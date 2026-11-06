import { describe, expect, it } from 'vitest';
import { isDue, newCard, orderQueue, review } from '../src/learning/srs';

const DAY = 86_400_000;

describe('spaced repetition', () => {
  it('new cards are due immediately and graduate after the learning ladder', () => {
    const t0 = 1_000_000;
    let c = newCard(t0);
    expect(isDue(c, t0)).toBe(true);
    c = review(c, 'good', t0); // step 1: due in 10 min
    expect(c.interval).toBe(0);
    expect(c.due).toBe(t0 + 10 * 60_000);
    c = review(c, 'good', c.due); // graduates
    expect(c.interval).toBe(1);
    expect(c.reps).toBe(1);
  });

  it('intervals grow with good reviews and shrink on lapses', () => {
    const t0 = 0;
    let c = { ...newCard(t0), interval: 1, reps: 1, due: t0 };
    c = review(c, 'good', t0);
    const i1 = c.interval;
    c = review(c, 'good', c.due);
    expect(c.interval).toBeGreaterThan(i1);
    const easeBefore = c.ease;
    c = review(c, 'again', c.due);
    expect(c.interval).toBe(0);
    expect(c.lapses).toBe(1);
    expect(c.ease).toBeLessThan(easeBefore);
    expect(c.ease).toBeGreaterThanOrEqual(1.3);
  });

  it('easy on a new card jumps straight to a multi-day interval', () => {
    const c = review(newCard(0), 'easy', 0);
    expect(c.interval).toBeGreaterThanOrEqual(4);
    expect(c.due).toBe(c.interval * DAY);
  });

  it('ease never drops below 1.3', () => {
    let c = { ...newCard(0), interval: 5, reps: 3, due: 0, ease: 1.35 };
    for (let i = 0; i < 5; i++) c = review({ ...c, interval: 5 }, 'again', 0);
    expect(c.ease).toBe(1.3);
  });

  it('queue interleaves tracks and puts learning cards first', () => {
    const now = 10 * DAY;
    const items = [
      { id: 'a1', trackId: 'python', card: { ...newCard(0), interval: 3, due: now - DAY } },
      { id: 'a2', trackId: 'python', card: { ...newCard(0), due: now - 1 } },
      { id: 'b1', trackId: 'c', card: { ...newCard(0), interval: 2, due: now - 2 * DAY } },
      { id: 'future', trackId: 'c', card: { ...newCard(0), interval: 2, due: now + DAY } },
    ];
    const q = orderQueue(items, now).map((i) => i.id);
    expect(q).not.toContain('future');
    expect(q[0]).toBe('a2'); // learning card first
    expect(q).toHaveLength(3);
    expect(q[1]).toBe('b1'); // then the other track gets a turn
  });
});
