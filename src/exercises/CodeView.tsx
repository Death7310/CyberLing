import { useEffect, useState } from 'react';
import type { CreateStep, ModifyStep } from '../curriculum/schema';
import { checkOutput } from '../learning/checkers';
import { runnerFor, type RunResult } from '../runners';
import { CodeEditor } from '../ui/CodeEditor';
import { Inline } from '../ui/Prose';
import { useStore } from '../store';

type TestState = { ok: boolean; got: string } | null;

export function CodeView({ step, draftKey, onDone, onAttempt }: { step: ModifyStep | CreateStep; draftKey: string; onDone: () => void; onAttempt: () => void }) {
  const drafts = useStore((s) => s.drafts);
  const saveDraft = useStore((s) => s.saveDraft);
  const starter = step.kind === 'modify' ? step.starter : (step.starter ?? '');
  const [code, setCode] = useState<string>(drafts[draftKey] ?? starter);
  const [running, setRunning] = useState(false);
  const [last, setLast] = useState<RunResult | null>(null);
  const [tests, setTests] = useState<TestState[]>(step.tests.map(() => null));
  const [available, setAvailable] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const runner = runnerFor(step.language);
  const passed = tests.every((t) => t?.ok);

  useEffect(() => { runner?.available().then(setAvailable); }, [runner]);
  useEffect(() => { const t = setTimeout(() => saveDraft(draftKey, code), 400); return () => clearTimeout(t); }, [code, draftKey, saveDraft]);

  const runAll = async () => {
    if (!runner) return;
    setRunning(true); onAttempt();
    const results: TestState[] = [];
    let lastRun: RunResult | null = null;
    for (const t of step.tests) {
      const r = await runner.run(code, t.stdin ?? '');
      lastRun = r;
      if (r.unavailable) { setAvailable(false); break; }
      results.push({ ok: r.exitCode === 0 && checkOutput(t, r.stdout), got: r.stdout + (r.stderr ? '\n' + r.stderr : '') });
      if (r.timedOut) break; // one runaway run is enough feedback; don't make the learner wait for every test
    }
    while (results.length < step.tests.length) results.push(null);
    setTests(results); setLast(lastRun); setRunning(false);
  };

  return (
    <div className="stack">
      <h2>{step.kind === 'modify' ? 'Modify the program' : 'Build the next piece'}</h2>
      <p><Inline text={step.prompt} /></p>
      {step.kind === 'create' && <p className="muted small">Project: {step.projectNote}</p>}
      {available === false && (
        <div className="feedback">
          <strong>Code can't run right now.</strong> {last?.unavailable ?? `No runner for ${step.language} is reachable.`}{' '}
          {step.language === 'python' ? 'Reload the app once online so the Python runtime can be cached.' : 'Compiled languages need the execution service (Settings). Meanwhile: write your solution, then compare it with the reference and mark it done honestly.'}
        </div>
      )}
      <CodeEditor value={code} language={step.language} onChange={setCode} />
      <div className="row">
        <button className="btn" onClick={runAll} disabled={running || !runner}>{running ? 'Running…' : 'Run tests'}</button>
        <button className="btn secondary small" onClick={() => setCode(starter)}>Reset</button>
        {step.hint && <details style={{ margin: 0, flex: 1 }}><summary>Hint</summary><Inline text={step.hint} /></details>}
      </div>
      <div className="tests">
        {step.tests.map((t, i) => (
          <div className="test" key={i}>
            <span className={`dot ${tests[i] ? (tests[i]!.ok ? 'ok' : 'bad') : ''}`} />
            <div>
              <div>{t.description}{t.stdin !== undefined && <span className="muted small"> · input: <code>{t.stdin.replace(/\n/g, '⏎')}</code></span>}</div>
              {tests[i] && !tests[i]!.ok && (
                <div className="small muted">expected <code>{t.expectedStdout}</code>{t.match && t.match !== 'exact' ? ` (${t.match})` : ''}, got <code>{tests[i]!.got.trim() || '(nothing)'}</code></div>
              )}
            </div>
          </div>
        ))}
      </div>
      {last && (last.stderr || last.stdout) && (
        <div className="output">{last.stdout}{last.stderr && <span className="err">{last.stderr}</span>}</div>
      )}
      {(passed || available === false || showSolution) && (
        <details open={passed}><summary>Reference solution</summary><pre>{step.solution}</pre></details>
      )}
      <div className="row">
        {passed && <button className="btn" onClick={onDone}>Continue</button>}
        {!passed && available === false && <button className="btn secondary" onClick={onDone}>I compared with the reference; mark done</button>}
        {!passed && available !== false && !showSolution && <button className="btn ghost" onClick={() => setShowSolution(true)}>I'm stuck, show the solution</button>}
      </div>
    </div>
  );
}
