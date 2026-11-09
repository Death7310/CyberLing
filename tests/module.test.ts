/**
 * Audit ONE module file in isolation, so content authors working in parallel are not blocked by
 * each other's half-finished files:
 *   MODULE_FILE=src/curriculum/tracks/python/m3.ts npx vitest run tests/module.test.ts
 */
import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import type { Module } from '../src/curriculum/schema';
import { auditTrack, fakeTrack } from './harness';

const file = process.env.MODULE_FILE;

describe.skipIf(!file)(`module ${file}`, () => {
  it('passes every content check', async () => {
    const mod = (await import(resolve(file!))) as Record<string, Module>;
    const module = Object.values(mod).find((v) => v && typeof v === 'object' && 'lessons' in v)!;
    expect(module, 'file must export a Module').toBeTruthy();
    const problems = auditTrack(fakeTrack(module));
    expect(problems.map((p) => `${p.where}: ${p.message}`)).toEqual([]);
    const lex = module.lessons.flatMap((l) => l.lexicon.map((e) => e.id));
    expect(new Set(lex).size, 'duplicate lexicon ids inside the module').toBe(lex.length);
  }, 1_800_000);
});
