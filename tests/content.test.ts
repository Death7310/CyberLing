import { describe, expect, it } from 'vitest';
import { tracks } from '../src/curriculum';
import { auditTrack } from './harness';

describe('content', () => {
  for (const t of tracks) {
    it(`${t.id}: schema, checkers, and reference solutions executed for real`, () => {
      const problems = auditTrack(t);
      expect(problems.map((p) => `${p.where}: ${p.message}`)).toEqual([]);
    }, 300_000);
  }

  it('lexicon ids are globally unique', () => {
    const ids = tracks.flatMap((t) => t.modules.flatMap((m) => m.lessons.flatMap((l) => l.lexicon.map((e) => e.id))));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lesson ids are globally unique', () => {
    const ids = tracks.flatMap((t) => t.modules.flatMap((m) => m.lessons.map((l) => l.id)));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
