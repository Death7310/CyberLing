import { Fragment, useState } from 'react';
import type { ClozeStep } from '../curriculum/schema';
import { checkCloze } from '../learning/checkers';
import { Inline } from '../ui/Prose';

export function ClozeView({ step, onDone, onAttempt }: { step: ClozeStep; onDone: () => void; onAttempt: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ ok: boolean; feedback: string } | null>(null);
  const parts = step.template.split(/(\{\{\w+\}\})/g);
  const check = () => { onAttempt(); setResult(checkCloze(step, answers)); };

  return (
    <div className="stack cloze">
      <h2>Fill the blanks</h2>
      <p><Inline text={step.prompt} /></p>
      <pre>
        {parts.map((p, i) => {
          const m = p.match(/^\{\{(\w+)\}\}$/);
          if (!m) return <Fragment key={i}>{p}</Fragment>;
          const id = m[1];
          const width = Math.max(4, ...(step.blanks.find((b) => b.id === id)?.answers.map((a) => a.length + 2) ?? [6]));
          return (
            <input key={i} style={{ width: `${width}ch` }} value={answers[id] ?? ''} spellCheck={false} autoCapitalize="off" autoCorrect="off"
              onChange={(e) => { setAnswers({ ...answers, [id]: e.target.value }); setResult(null); }} aria-label={`blank ${id}`} />
          );
        })}
      </pre>
      {result && <div className={`feedback ${result.ok ? 'ok' : 'bad'}`}><Inline text={result.feedback} /></div>}
      <div className="row">
        {!result?.ok && <button className="btn" onClick={check}>Check</button>}
        {result?.ok && <button className="btn" onClick={onDone}>Continue</button>}
      </div>
    </div>
  );
}
