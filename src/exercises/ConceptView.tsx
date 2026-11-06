import type { ConceptStep, TrackId } from '../curriculum/schema';
import { Prose } from '../ui/Prose';
import { WorkedExample } from '../ui/WorkedExample';
import { tracks } from '../curriculum';

export function ConceptView({ step, knownTracks, onDone }: { step: ConceptStep; knownTracks: TrackId[]; onDone: () => void }) {
  const contrasts = (step.contrast ?? []).filter((c) => knownTracks.includes(c.from));
  return (
    <div className="stack">
      <h2>{step.title}</h2>
      <Prose body={step.body} />
      {step.example && <WorkedExample sample={step.example} />}
      {contrasts.map((c, i) => (
        <div className="contrast" key={i}>
          <strong>Coming from {tracks.find((t) => t.id === c.from)?.title}?</strong> {c.note}
        </div>
      ))}
      <div className="row">
        <button className="btn" onClick={onDone}>Got it, continue</button>
      </div>
    </div>
  );
}
