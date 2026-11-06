import { useMemo, useState } from 'react';
import type { ParsonsStep } from '../curriculum/schema';
import { checkParsons } from '../learning/checkers';
import { Inline } from '../ui/Prose';

interface Line { id: number; text: string; indent: number }

function shuffle<T>(xs: T[], seed: number): T[] {
  // Deterministic shuffle so a step always presents the same arrangement (lets learners retry calmly).
  const a = [...xs];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ParsonsView({ step, onDone, onAttempt }: { step: ParsonsStep; onDone: () => void; onAttempt: () => void }) {
  const initial = useMemo(() => {
    const all = [...step.solution, ...(step.distractors ?? [])].map((l, i) => ({ id: i, text: l.trimStart(), indent: step.indentation ? 0 : l.length - l.trimStart().length }));
    return shuffle(all, step.solution.join('').length + all.length);
  }, [step]);
  const [bank, setBank] = useState<Line[]>(initial);
  const [prog, setProg] = useState<Line[]>([]);
  const [result, setResult] = useState<{ ok: boolean; feedback: string } | null>(null);

  const toProgram = (l: Line) => { setBank(bank.filter((b) => b.id !== l.id)); setProg([...prog, l]); setResult(null); };
  const toBank = (l: Line) => { setProg(prog.filter((p) => p.id !== l.id)); setBank([...bank, l]); setResult(null); };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d; if (j < 0 || j >= prog.length) return;
    const a = [...prog]; [a[i], a[j]] = [a[j], a[i]]; setProg(a); setResult(null);
  };
  const dent = (i: number, d: -1 | 1) => {
    const a = [...prog]; a[i] = { ...a[i], indent: Math.max(0, a[i].indent + d * 4) }; setProg(a); setResult(null);
  };
  const check = () => { onAttempt(); setResult(checkParsons(step, { lines: prog.map((l) => ({ text: l.text, indent: l.indent })) })); };

  return (
    <div className="stack">
      <h2>Assemble the program</h2>
      <p><Inline text={step.prompt} /></p>
      <p className="muted small">Tap a line to move it. Use ▲▼ to reorder{step.indentation ? ' and ◀▶ to set indentation (4 spaces)' : ''}. Some lines are decoys.</p>
      <div className="parsons">
        <div className="zone">
          <h4>Available lines</h4>
          {bank.map((l) => (
            <div className="pline" key={l.id}><code>{l.text}</code><button onClick={() => toProgram(l)} aria-label="add">+</button></div>
          ))}
          {!bank.length && <p className="muted small">Empty</p>}
        </div>
        <div className="zone">
          <h4>Your program</h4>
          {prog.map((l, i) => (
            <div className="pline" key={l.id}>
              <code><span className="indent" style={{ width: `${l.indent}ch` }} />{l.text}</code>
              {step.indentation && <><button onClick={() => dent(i, -1)} aria-label="outdent">◀</button><button onClick={() => dent(i, 1)} aria-label="indent">▶</button></>}
              <button onClick={() => move(i, -1)} aria-label="up">▲</button>
              <button onClick={() => move(i, 1)} aria-label="down">▼</button>
              <button onClick={() => toBank(l)} aria-label="remove">×</button>
            </div>
          ))}
          {!prog.length && <p className="muted small">Add lines here in order.</p>}
        </div>
      </div>
      {result && <div className={`feedback ${result.ok ? 'ok' : 'bad'}`}><Inline text={result.feedback} /></div>}
      <div className="row">
        {!result?.ok && <button className="btn" disabled={!prog.length} onClick={check}>Check</button>}
        {result?.ok && <button className="btn" onClick={onDone}>Continue</button>}
      </div>
    </div>
  );
}
