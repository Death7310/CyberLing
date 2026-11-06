import { useEffect, useMemo, useState } from 'react';
import type { Lesson, LexiconEntry, Module, Step, Track, TrackId } from '../curriculum/schema';
import { tracks, trackById } from '../curriculum';
import { isDue, orderQueue, type Grade } from '../learning/srs';
import { lessonKey, useStore } from '../store';
import { pyodideRunner, getExecutionEndpoint, DEFAULT_PISTON_ENDPOINT } from '../runners';
import { ConceptView } from '../exercises/ConceptView';
import { PredictView } from '../exercises/PredictView';
import { ParsonsView } from '../exercises/ParsonsView';
import { ClozeView } from '../exercises/ClozeView';
import { CodeView } from '../exercises/CodeView';
import { FieldworkView } from '../exercises/FieldworkView';
import { Inline, Prose } from './Prose';
import { METHOD } from '../curriculum/method';

/* ---------- helpers ---------- */

function useKnownTracks(): TrackId[] {
  const lessons = useStore((s) => s.lessons);
  return useMemo(() => {
    const ids = new Set<TrackId>();
    for (const [k, p] of Object.entries(lessons)) if (p.completedAt) ids.add(k.split('/')[0] as TrackId);
    return [...ids];
  }, [lessons]);
}

function trackProgress(track: Track, lessons: Record<string, { completedAt?: number }>) {
  const all = track.modules.flatMap((m) => m.lessons);
  const done = all.filter((l) => lessons[lessonKey(track.id, l.id)]?.completedAt).length;
  return { done, total: all.length };
}

function lexiconOf(track: Track): LexiconEntry[] {
  return track.modules.flatMap((m) => m.lessons.flatMap((l) => l.lexicon));
}

function findLexicon(id: string): { entry: LexiconEntry; track: Track } | undefined {
  for (const t of tracks) for (const e of lexiconOf(t)) if (e.id === id) return { entry: e, track: t };
  return undefined;
}

export function useDueCount(): number {
  const cards = useStore((s) => s.cards);
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 60_000); return () => clearInterval(t); }, []);
  return useMemo(() => Object.values(cards).filter((c) => isDue(c.card)).length, [cards, tick]);
}

/* ---------- Home ---------- */

export function HomePage() {
  const navigate = useStore((s) => s.navigate);
  const lessons = useStore((s) => s.lessons);
  const due = useDueCount();
  const next = useMemo(() => {
    for (const t of tracks) for (const m of t.modules) for (const l of m.lessons) if (!lessons[lessonKey(t.id, l.id)]?.completedAt) return { t, m, l };
    return null;
  }, [lessons]);
  return (
    <div className="stack">
      <section className="section">
        <h1>Learn to program the way you learn a language.</h1>
        <p className="muted">Read before you write. Assemble before you compose. Build one real project per language, from zero.</p>
        <div className="row">
          {next && <button className="btn" onClick={() => navigate({ page: 'lesson', trackId: next.t.id, moduleId: next.m.id, lessonId: next.l.id })}>Continue: {next.t.title} · {next.l.title}</button>}
          <button className="btn secondary" onClick={() => navigate({ page: 'review' })}>Review{due > 0 && <span className="badge">{due}</span>}</button>
          <button className="btn ghost" onClick={() => navigate({ page: 'method' })}>How this works</button>
        </div>
      </section>
      <section className="section">
        <h2>Tracks</h2>
        <div className="grid">
          {tracks.map((t) => {
            const p = trackProgress(t, lessons);
            const available = t.modules.some((m) => m.status === 'available');
            return (
              <div className="card clickable" key={t.id} onClick={() => navigate({ page: 'track', trackId: t.id })}>
                <h3>{t.title}</h3>
                <p className="muted small">{t.tagline}</p>
                <div className="row small">
                  <span className={`pill ${available ? 'ok' : 'warn'}`}>{available ? `${p.total} lessons authored` : 'designed, content in progress'}</span>
                  {t.prerequisites.length > 0 && <span className="pill">after {t.prerequisites.map((id) => trackById(id).title).join(', ')}</span>}
                </div>
                {p.total > 0 && <div className="progress"><div style={{ width: `${(100 * p.done) / p.total}%` }} /></div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ---------- Track ---------- */

export function TrackPage({ trackId }: { trackId: TrackId }) {
  const track = trackById(trackId);
  const navigate = useStore((s) => s.navigate);
  const lessons = useStore((s) => s.lessons);
  const p = trackProgress(track, lessons);
  return (
    <div className="stack">
      <button className="btn ghost" style={{ alignSelf: 'flex-start' }} onClick={() => navigate({ page: 'home' })}>← All tracks</button>
      <h1>{track.title}</h1>
      <p className="muted">{track.tagline}</p>
      {p.total > 0 && <div className="progress"><div style={{ width: `${(100 * p.done) / p.total}%` }} /></div>}
      <div className="card">
        <h3>The project you will build: {track.projectSpine.title}</h3>
        <p className="small">{track.projectSpine.description}</p>
      </div>
      <details>
        <summary>How {track.title} runs: the notional machine</summary>
        <ul>{track.notionalMachine.map((n, i) => <li key={i}><Inline text={n} /></li>)}</ul>
      </details>
      <div className="row"><button className="btn secondary small" onClick={() => navigate({ page: 'lexicon', trackId })}>Lexicon ({lexiconOf(track).length} entries)</button></div>
      {track.modules.map((m, i) => <ModuleCard key={m.id} track={track} module={m} index={i} />)}
    </div>
  );
}

function ModuleCard({ track, module, index }: { track: Track; module: Module; index: number }) {
  const navigate = useStore((s) => s.navigate);
  const lessons = useStore((s) => s.lessons);
  return (
    <div className="card">
      <div className="row"><h3 style={{ margin: 0 }}>{index + 1}. {module.title}</h3>{module.status === 'planned' && <span className="pill warn">planned</span>}</div>
      <p className="small muted" style={{ margin: '4px 0' }}>{module.goal}</p>
      <p className="small"><strong>Milestone:</strong> {module.projectMilestone}</p>
      {module.lessons.map((l) => {
        const prog = lessons[lessonKey(track.id, l.id)];
        const done = !!prog?.completedAt;
        const started = !!prog && prog.done.length > 0;
        return (
          <div key={l.id} className="row" style={{ padding: '6px 0', borderTop: '1px solid var(--border)' }}>
            <span className={`pill ${done ? 'ok' : started ? 'accent' : ''}`}>{done ? 'done' : started ? `${prog!.done.length}/${l.steps.length}` : `${l.minutes} min`}</span>
            <span style={{ flex: 1 }}>{l.title} <span className="muted small">· {l.objective}</span></span>
            <button className="btn small secondary" onClick={() => navigate({ page: 'lesson', trackId: track.id, moduleId: module.id, lessonId: l.id })}>{done ? 'Revisit' : started ? 'Resume' : 'Start'}</button>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Lesson ---------- */

export function LessonPage({ trackId, moduleId, lessonId }: { trackId: TrackId; moduleId: string; lessonId: string }) {
  const track = trackById(trackId);
  const module = track.modules.find((m) => m.id === moduleId)!;
  const lesson: Lesson = module.lessons.find((l) => l.id === lessonId)!;
  const navigate = useStore((s) => s.navigate);
  const progress = useStore((s) => s.lessons[lessonKey(trackId, lessonId)]);
  const markStep = useStore((s) => s.markStep);
  const recordAttempt = useStore((s) => s.recordAttempt);
  const addCards = useStore((s) => s.addCards);
  const known = useKnownTracks();
  const firstUndone = lesson.steps.findIndex((_, i) => !progress?.done.includes(i));
  const [idx, setIdx] = useState(firstUndone === -1 ? 0 : firstUndone);
  const [finished, setFinished] = useState(false);

  useEffect(() => { if (lesson.steps.some((s) => 'language' in s && s.language === 'python') || lesson.steps.some((s) => s.kind === 'predict' && s.code.language === 'python')) pyodideRunner.warmUp().catch(() => {}); }, [lesson]);

  const step: Step = lesson.steps[idx];
  const onDone = () => {
    markStep(trackId, lessonId, idx, lesson.steps.length);
    if (idx + 1 < lesson.steps.length) setIdx(idx + 1);
    else { addCards(trackId, lesson.lexicon.map((e) => e.id)); setFinished(true); }
  };
  const onAttempt = () => recordAttempt(trackId, lessonId);
  const lessonsInModule = module.lessons;
  const nextLesson = lessonsInModule[lessonsInModule.indexOf(lesson) + 1];
  const nextModule = track.modules[track.modules.indexOf(module) + 1];

  return (
    <div className="stack">
      <div className="row">
        <button className="btn ghost" onClick={() => navigate({ page: 'track', trackId })}>← {track.title}</button>
        <span className="muted small">{module.title} · {lesson.title}</span>
      </div>
      <div className="stepper">{lesson.steps.map((s, i) => <span key={i} className={progress?.done.includes(i) ? 'done' : i === idx ? 'current' : ''} title={s.kind} />)}</div>
      {finished ? (
        <div className="card stack">
          <h2>Lesson complete</h2>
          <p>{lesson.lexicon.length} new lexicon entries were added to your review deck. Reviewing them tomorrow is what makes them stick.</p>
          <div className="row">
            {nextLesson && <button className="btn" onClick={() => { setFinished(false); setIdx(0); navigate({ page: 'lesson', trackId, moduleId, lessonId: nextLesson.id }); }}>Next: {nextLesson.title}</button>}
            {!nextLesson && nextModule?.status === 'available' && nextModule.lessons[0] && <button className="btn" onClick={() => navigate({ page: 'lesson', trackId, moduleId: nextModule.id, lessonId: nextModule.lessons[0].id })}>Next module: {nextModule.title}</button>}
            <button className="btn secondary" onClick={() => navigate({ page: 'review' })}>Review now</button>
            <button className="btn ghost" onClick={() => navigate({ page: 'track', trackId })}>Back to track</button>
          </div>
        </div>
      ) : (
        <StepView key={`${lessonId}-${idx}`} step={step} known={known} draftKey={`${trackId}/${lessonId}/${idx}`} onDone={onDone} onAttempt={onAttempt} />
      )}
      {!finished && (
        <div className="row small muted">
          <button className="btn ghost small" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Previous step</button>
          <span>Step {idx + 1} of {lesson.steps.length} · {step.kind}</span>
          {progress?.done.includes(idx) && idx + 1 < lesson.steps.length && <button className="btn ghost small" onClick={() => setIdx(idx + 1)}>Next step</button>}
        </div>
      )}
    </div>
  );
}

function StepView({ step, known, draftKey, onDone, onAttempt }: { step: Step; known: TrackId[]; draftKey: string; onDone: () => void; onAttempt: () => void }) {
  switch (step.kind) {
    case 'concept': return <ConceptView step={step} knownTracks={known} onDone={onDone} />;
    case 'predict': return <PredictView step={step} onDone={onDone} onAttempt={onAttempt} />;
    case 'parsons': return <ParsonsView step={step} onDone={onDone} onAttempt={onAttempt} />;
    case 'cloze': return <ClozeView step={step} onDone={onDone} onAttempt={onAttempt} />;
    case 'modify':
    case 'create': return <CodeView step={step} draftKey={draftKey} onDone={onDone} onAttempt={onAttempt} />;
    case 'fieldwork': return <FieldworkView step={step} onDone={onDone} onAttempt={onAttempt} />;
  }
}

/* ---------- Review (spaced retrieval) ---------- */

export function ReviewPage() {
  const cards = useStore((s) => s.cards);
  const gradeCard = useStore((s) => s.gradeCard);
  const navigate = useStore((s) => s.navigate);
  const [queue, setQueue] = useState(() => orderQueue(Object.entries(cards).map(([id, c]) => ({ id, ...c }))));
  const [reveal, setReveal] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const current = queue[0];
  const info = current ? findLexicon(current.id) : undefined;
  const total = Object.keys(cards).length;

  const grade = (g: Grade) => {
    gradeCard(current.id, g);
    setReveal(false); setDoneCount(doneCount + 1);
    // 'again' cards come back at the end of this session.
    setQueue(g === 'again' ? [...queue.slice(1), current] : queue.slice(1));
  };

  if (total === 0) return <div className="card"><h2>Nothing to review yet</h2><p>Finish a lesson and its lexicon joins your deck.</p><button className="btn" onClick={() => navigate({ page: 'home' })}>Go learn</button></div>;
  if (!current || !info) return <div className="card"><h2>All caught up</h2><p>{doneCount} reviewed. {total} entries in your deck. Come back when more are due; spacing is the point.</p><button className="btn" onClick={() => navigate({ page: 'home' })}>Home</button></div>;

  const { entry, track } = info;
  return (
    <div className="stack">
      <div className="row"><h1 style={{ margin: 0 }}>Review</h1><span className="muted small">{queue.length} left · {track.title}</span></div>
      <div className="flash">
        <span className="pill">{entry.kind}</span>
        <div className="term">{entry.term}</div>
        {!reveal ? (
          <p className="muted">Say the meaning out loud, and write (or picture) one correct example. Then reveal.</p>
        ) : (
          <>
            <p>{entry.meaning}</p>
            <pre>{entry.example}</pre>
            {entry.analogy && <p className="muted small">Analogy: {entry.analogy}</p>}
          </>
        )}
      </div>
      {!reveal ? (
        <button className="btn" onClick={() => setReveal(true)}>Reveal</button>
      ) : (
        <div className="grades">
          <button className="again" onClick={() => grade('again')}>Again<br /><span className="small muted">forgot</span></button>
          <button onClick={() => grade('hard')}>Hard<br /><span className="small muted">barely</span></button>
          <button className="good" onClick={() => grade('good')}>Good<br /><span className="small muted">recalled</span></button>
          <button className="easy" onClick={() => grade('easy')}>Easy<br /><span className="small muted">instant</span></button>
        </div>
      )}
    </div>
  );
}

/* ---------- Lexicon ---------- */

export function LexiconPage({ trackId }: { trackId: TrackId }) {
  const track = trackById(trackId);
  const navigate = useStore((s) => s.navigate);
  const cards = useStore((s) => s.cards);
  const entries = lexiconOf(track);
  return (
    <div className="stack">
      <button className="btn ghost" style={{ alignSelf: 'flex-start' }} onClick={() => navigate({ page: 'track', trackId })}>← {track.title}</button>
      <h1>{track.title} lexicon</h1>
      <p className="muted">Syntax treated as vocabulary and grammar. Entries unlock as you finish lessons and are rehearsed with spaced retrieval.</p>
      {entries.map((e) => (
        <div className="card" key={e.id}>
          <div className="row"><code className="inline-code">{e.term}</code><span className="pill">{e.kind}</span>{cards[e.id] && <span className="pill ok">in deck · {cards[e.id].card.interval}d</span>}</div>
          <p className="small" style={{ margin: '6px 0' }}>{e.meaning}</p>
          <pre>{e.example}</pre>
          {e.analogy && <p className="muted small" style={{ marginTop: 6 }}>Analogy: {e.analogy}</p>}
        </div>
      ))}
    </div>
  );
}

/* ---------- Method ---------- */

export function MethodPage() {
  return <div className="stack"><Prose body={METHOD} /></div>;
}

/* ---------- Settings ---------- */

export function SettingsPage() {
  const endpoint = useStore((s) => s.executionEndpoint);
  const setEndpoint = useStore((s) => s.setEndpoint);
  const resetAll = useStore((s) => s.resetAll);
  const [pyStatus, setPyStatus] = useState<string>('not loaded');
  useEffect(() => { pyodideRunner.onStatus = (s) => setPyStatus(s); return () => { pyodideRunner.onStatus = undefined; }; }, []);
  return (
    <div className="stack">
      <h1>Settings</h1>
      <div className="card">
        <h3>Python runtime</h3>
        <p className="small muted">{pyodideRunner.description}</p>
        <div className="row"><span className="pill">{pyStatus}</span><button className="btn small secondary" onClick={() => pyodideRunner.warmUp().then(() => setPyStatus('ready')).catch((e) => setPyStatus('error: ' + e))}>Load now</button></div>
      </div>
      <div className="card">
        <h3>Execution service for C, C++, C#</h3>
        <p className="small muted">A Piston-compatible HTTP service compiles and runs these. The default is a public, rate-limited instance; self-host for classroom or heavy use (see docs/ARCHITECTURE.md). Leave empty to work fully offline with reading and assembling exercises only.</p>
        <label className="field"><span>Endpoint</span><input type="url" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder={DEFAULT_PISTON_ENDPOINT} /></label>
        <div className="row"><button className="btn small secondary" onClick={() => setEndpoint(DEFAULT_PISTON_ENDPOINT)}>Use default</button><span className="muted small">current: {getExecutionEndpoint() || '(none)'}</span></div>
      </div>
      <div className="card">
        <h3>Data</h3>
        <p className="small muted">Progress, drafts and your review deck are stored on this device only.</p>
        <button className="btn small secondary" onClick={() => { if (confirm('Erase all progress and the review deck on this device?')) resetAll(); }}>Reset everything</button>
      </div>
    </div>
  );
}
