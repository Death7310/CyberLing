import { useState } from 'react';
import type { FieldworkStep } from '../curriculum/schema';
import { Inline } from '../ui/Prose';

export function FieldworkView({ step, onDone, onAttempt }: { step: FieldworkStep; onDone: () => void; onAttempt: () => void }) {
  const [checked, setChecked] = useState<boolean[]>(step.checklist.map(() => false));
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const all = checked.every(Boolean);
  const check = () => { onAttempt(); setResult(step.verify.answers.some((a) => a.trim().toLowerCase() === answer.trim().toLowerCase())); };
  return (
    <div className="stack">
      <h2>Fieldwork: do it in your own account</h2>
      <p><Inline text={step.prompt} /></p>
      {step.warning && <div className="contrast"><strong>Cost / safety:</strong> {step.warning}</div>}
      <div className="checklist card">
        {step.checklist.map((item, i) => (
          <label key={i}><input type="checkbox" checked={checked[i]} onChange={(e) => { const c = [...checked]; c[i] = e.target.checked; setChecked(c); }} /><span><Inline text={item} /></span></label>
        ))}
      </div>
      <label className="field"><span>{step.verify.question}</span><input type="text" value={answer} onChange={(e) => { setAnswer(e.target.value); setResult(null); }} /></label>
      {result !== null && <div className={`feedback ${result ? 'ok' : 'bad'}`}>{result ? 'Verified.' : 'That does not match what a completed step produces. Re-check the output you got.'}</div>}
      <div className="row">
        {!result && <button className="btn" disabled={!all || !answer} onClick={check}>Verify</button>}
        {result && <button className="btn" onClick={onDone}>Continue</button>}
      </div>
    </div>
  );
}
