import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TrackId } from './curriculum/schema';
import { type CardState, type Grade, newCard, review } from './learning/srs';
import { DEFAULT_PISTON_ENDPOINT, setExecutionEndpoint } from './runners';

export type Route =
  | { page: 'home' }
  | { page: 'track'; trackId: TrackId }
  | { page: 'lesson'; trackId: TrackId; moduleId: string; lessonId: string }
  | { page: 'review' }
  | { page: 'lexicon'; trackId: TrackId }
  | { page: 'method' }
  | { page: 'settings' };

export interface LessonProgress {
  /** Step indices completed. */
  done: number[];
  completedAt?: number;
  attempts: number;
}

interface State {
  route: Route;
  navigate: (r: Route) => void;
  lessons: Record<string, LessonProgress>; // key: trackId/lessonId
  markStep: (trackId: TrackId, lessonId: string, stepIndex: number, totalSteps: number) => void;
  recordAttempt: (trackId: TrackId, lessonId: string) => void;
  cards: Record<string, { card: CardState; trackId: TrackId }>; // key: lexicon id
  addCards: (trackId: TrackId, ids: string[]) => void;
  gradeCard: (id: string, grade: Grade) => void;
  executionEndpoint: string;
  setEndpoint: (url: string) => void;
  /** Learner's code drafts so a phone interruption never loses work. key: trackId/lessonId/stepIndex */
  drafts: Record<string, string>;
  saveDraft: (key: string, code: string) => void;
  resetAll: () => void;
}

export const lessonKey = (trackId: TrackId, lessonId: string) => `${trackId}/${lessonId}`;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      route: { page: 'home' },
      navigate: (route) => { set({ route }); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }); },
      lessons: {},
      markStep: (trackId, lessonId, stepIndex, totalSteps) => {
        const key = lessonKey(trackId, lessonId);
        const cur = get().lessons[key] ?? { done: [], attempts: 0 };
        const done = cur.done.includes(stepIndex) ? cur.done : [...cur.done, stepIndex].sort((a, b) => a - b);
        const completedAt = done.length >= totalSteps ? (cur.completedAt ?? Date.now()) : cur.completedAt;
        set({ lessons: { ...get().lessons, [key]: { ...cur, done, completedAt } } });
      },
      recordAttempt: (trackId, lessonId) => {
        const key = lessonKey(trackId, lessonId);
        const cur = get().lessons[key] ?? { done: [], attempts: 0 };
        set({ lessons: { ...get().lessons, [key]: { ...cur, attempts: cur.attempts + 1 } } });
      },
      cards: {},
      addCards: (trackId, ids) => {
        const cards = { ...get().cards };
        for (const id of ids) if (!cards[id]) cards[id] = { card: newCard(), trackId };
        set({ cards });
      },
      gradeCard: (id, grade) => {
        const entry = get().cards[id];
        if (!entry) return;
        set({ cards: { ...get().cards, [id]: { ...entry, card: review(entry.card, grade) } } });
      },
      executionEndpoint: DEFAULT_PISTON_ENDPOINT,
      setEndpoint: (url) => { setExecutionEndpoint(url); set({ executionEndpoint: url }); },
      drafts: {},
      saveDraft: (key, code) => set({ drafts: { ...get().drafts, [key]: code } }),
      resetAll: () => set({ lessons: {}, cards: {}, drafts: {}, route: { page: 'home' } }),
    }),
    {
      name: 'cyberling-v1',
      partialize: (s) => ({ lessons: s.lessons, cards: s.cards, executionEndpoint: s.executionEndpoint, drafts: s.drafts }),
      onRehydrateStorage: () => (state) => { if (state) setExecutionEndpoint(state.executionEndpoint); },
    },
  ),
);
