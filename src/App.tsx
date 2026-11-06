import { useStore } from './store';
import { HomePage, LessonPage, LexiconPage, MethodPage, ReviewPage, SettingsPage, TrackPage, useDueCount } from './ui/pages';

export function App() {
  const route = useStore((s) => s.route);
  const navigate = useStore((s) => s.navigate);
  const due = useDueCount();
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => navigate({ page: 'home' })}><img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />CyberLing</button>
          <span className="spacer" />
          <nav className="nav">
            <button className={route.page === 'home' || route.page === 'track' || route.page === 'lesson' ? 'active' : ''} onClick={() => navigate({ page: 'home' })}>Learn</button>
            <button className={route.page === 'review' ? 'active' : ''} onClick={() => navigate({ page: 'review' })}>Review{due > 0 && <span className="badge">{due}</span>}</button>
            <button className={route.page === 'settings' ? 'active' : ''} onClick={() => navigate({ page: 'settings' })} aria-label="Settings">⚙</button>
          </nav>
        </div>
      </header>
      <main>
        {route.page === 'home' && <HomePage />}
        {route.page === 'track' && <TrackPage trackId={route.trackId} />}
        {route.page === 'lesson' && <LessonPage key={`${route.trackId}/${route.lessonId}`} trackId={route.trackId} moduleId={route.moduleId} lessonId={route.lessonId} />}
        {route.page === 'review' && <ReviewPage />}
        {route.page === 'lexicon' && <LexiconPage trackId={route.trackId} />}
        {route.page === 'method' && <MethodPage />}
        {route.page === 'settings' && <SettingsPage />}
      </main>
    </>
  );
}
