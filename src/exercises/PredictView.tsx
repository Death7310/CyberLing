import { useState } from 'react';
import type { PredictStep } from '../curriculum/schema';
import { checkPredict } from '../learning/checkers';
import { WorkedExample } from '../ui/WorkedExample';
import { Inline } from '../ui/Prose';

export function PredictView({ step, onDone, onAttempt }: { step: PredictStep; onDone: () => void; onAttempt: () => void }) {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<{ ok: boolean; feedback: string } | null>(null);

  const submit = () => { onAttempt(); setResult(checkPredict(step, answer)); };

  return (
    <div className="stack">
      <h2>Predict before you run</h2>
      <p><Inline text={step.prompt} /></p>
      <WorkedExample sample={step.code} />
      {step.choices ? (
        <div className="choices">
          {step.choices.map((c) => (
            <button key={c} className={answer === c ? 'selected' : ''} onClick={() => { setAnswer(c); setResult(null); }}>{c}</button>
          ))}
        </div>
      ) : (
        <textarea className="code" rows={3} placeholder="What will the program print?" value={answer} onChange={(e) => { setAnswer(e.target.value); setResult(null); }} />
      )}
      {result && <div className={`feedback ${result.ok ? 'ok' : 'bad'}`}><Inline text={result.feedback} /></div>}
      <div className="row">
        {!result?.ok && <button className="btn" disabled={!answer} onClick={submit}>Check</button>}
        {result?.ok && <button className="btn" onClick={onDone}>Continue</button>}
      </div>
    </div>
  );
}
