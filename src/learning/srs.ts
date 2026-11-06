/**
 * Spaced repetition scheduler.
 *
 * A compact SM-2 style scheduler (Wozniak, 1990) with the well-known adjustments used by
 * modern flashcard systems: a short learning ladder for new cards, ease bounded below at 1.3,
 * and lapses that reset the interval rather than the ease entirely.
 * Spacing and retrieval practice are among the best-replicated effects in learning science
 * (Cepeda et al., 2006; Roediger & Karpicke, 2006; Dunlosky et al., 2013).
 */

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface CardState {
  /** Ease factor; 2.5 is the classic start. Never below 1.3. */
  ease: number;
  /** Current interval in days (0 while in the learning ladder). */
  interval: number;
  /** Successful reviews in a row. */
  reps: number;
  /** Number of lapses (forgotten after graduating). */
  lapses: number;
  /** Learning-ladder step index while interval === 0. */
  learningStep: number;
  /** Next due time, epoch ms. */
  due: number;
}

const DAY = 24 * 60 * 60 * 1000;
/** Learning ladder in minutes before a card graduates to day-based intervals. */
const LEARNING_STEPS_MIN = [1, 10];
const GRADUATING_DAYS = 1;
const EASY_DAYS = 4;

export function newCard(now = Date.now()): CardState {
  return { ease: 2.5, interval: 0, reps: 0, lapses: 0, learningStep: 0, due: now };
}

export function isDue(card: CardState, now = Date.now()): boolean {
  return card.due <= now;
}

export function review(card: CardState, grade: Grade, now = Date.now()): CardState {
  const c = { ...card };
  const learning = c.interval === 0;

  if (learning) {
    if (grade === 'again') {
      c.learningStep = 0;
      c.due = now + LEARNING_STEPS_MIN[0] * 60_000;
      return c;
    }
    if (grade === 'easy') {
      c.interval = EASY_DAYS;
      c.reps = 1;
      c.due = now + c.interval * DAY;
      return c;
    }
    const next = c.learningStep + (grade === 'good' ? 1 : 0);
    if (next >= LEARNING_STEPS_MIN.length) {
      c.interval = GRADUATING_DAYS;
      c.reps = 1;
      c.learningStep = 0;
      c.due = now + c.interval * DAY;
    } else {
      c.learningStep = next;
      c.due = now + LEARNING_STEPS_MIN[next] * 60_000;
    }
    return c;
  }

  // Graduated card.
  switch (grade) {
    case 'again':
      c.lapses += 1;
      c.reps = 0;
      c.ease = Math.max(1.3, c.ease - 0.2);
      c.interval = 0;
      c.learningStep = 0;
      c.due = now + LEARNING_STEPS_MIN[0] * 60_000;
      return c;
    case 'hard':
      c.ease = Math.max(1.3, c.ease - 0.15);
      c.interval = Math.max(1, Math.round(c.interval * 1.2));
      break;
    case 'good':
      c.interval = Math.max(c.interval + 1, Math.round(c.interval * c.ease));
      break;
    case 'easy':
      c.ease = c.ease + 0.15;
      c.interval = Math.max(c.interval + 1, Math.round(c.interval * c.ease * 1.3));
      break;
  }
  c.reps += 1;
  c.due = now + c.interval * DAY;
  return c;
}

/** Sort due cards so lapsed/learning cards come first, then by due time. Interleaves tracks by stable mixing. */
export function orderQueue<T extends { card: CardState; trackId: string }>(items: T[], now = Date.now()): T[] {
  const due = items.filter((i) => isDue(i.card, now));
  due.sort((a, b) => (a.card.interval === 0 ? 0 : 1) - (b.card.interval === 0 ? 0 : 1) || a.card.due - b.card.due);
  // Interleave by track (Rohrer & Taylor, 2007): round-robin across tracks keeps discrimination practice alive.
  const buckets = new Map<string, T[]>();
  for (const i of due) buckets.set(i.trackId, [...(buckets.get(i.trackId) ?? []), i]);
  const out: T[] = [];
  const lists = [...buckets.values()];
  let any = true;
  while (any) {
    any = false;
    for (const l of lists) {
      const n = l.shift();
      if (n) { out.push(n); any = true; }
    }
  }
  return out;
}
