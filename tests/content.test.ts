import { describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { tracks } from '../src/curriculum';
import { validateTrack } from '../src/curriculum/validate';
import { checkCloze, checkOutput, checkParsons } from '../src/learning/checkers';
import type { CreateStep, ModifyStep } from '../src/curriculum/schema';

const has = (bin: string) => spawnSync('which', [bin]).status === 0;

describe('content validity', () => {
  for (const t of tracks) {
    it(`${t.id} passes static validation`, () => {
      expect(validateTrack(t)).toEqual([]);
    });
  }

  it('lexicon ids are globally unique', () => {
    const ids = tracks.flatMap((t) => t.modules.flatMap((m) => m.lessons.flatMap((l) => l.lexicon.map((e) => e.id))));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lesson ids are globally unique', () => {
    const ids = tracks.flatMap((t) => t.modules.flatMap((m) => m.lessons.map((l) => l.id)));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('parsons solutions pass their own checker and distractors fail it', () => {
    for (const t of tracks) for (const m of t.modules) for (const l of m.lessons) for (const s of l.steps) {
      if (s.kind !== 'parsons') continue;
      const lines = s.solution.map((x) => ({ text: x.trimStart(), indent: s.indentation ? x.length - x.trimStart().length : 0 }));
      const attempt = s.indentation ? lines : s.solution.map((x) => ({ text: x.trimStart(), indent: x.length - x.trimStart().length }));
      expect(checkParsons(s, { lines: attempt }).ok, `${l.id}`).toBe(true);
      for (const d of s.distractors ?? []) {
        const wrong = [...attempt]; wrong[0] = { text: d.trimStart(), indent: 0 };
        expect(checkParsons(s, { lines: wrong }).ok, `${l.id} distractor ${d}`).toBe(false);
      }
    }
  });

  it('cloze canonical answers pass', () => {
    for (const t of tracks) for (const m of t.modules) for (const l of m.lessons) for (const s of l.steps) {
      if (s.kind !== 'cloze') continue;
      const answers = Object.fromEntries(s.blanks.map((b) => [b.id, b.answers[0]]));
      expect(checkCloze(s, answers).ok, l.id).toBe(true);
      expect(checkCloze(s, {}).ok, l.id).toBe(false);
    }
  });
});

function runSolution(step: ModifyStep | CreateStep, stdin: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'cl-'));
  if (step.language === 'python') {
    const f = join(dir, 'main.py'); writeFileSync(f, step.solution);
    return execFileSync('python3', ['-I', f], { input: stdin, encoding: 'utf8', timeout: 10000, stdio: ['pipe', 'pipe', 'pipe'] });
  }
  if (step.language === 'c' || step.language === 'cpp') {
    const f = join(dir, step.language === 'c' ? 'main.c' : 'main.cpp'); writeFileSync(f, step.solution);
    execFileSync(step.language === 'c' ? 'gcc' : 'g++', ['-Wall', '-Wextra', '-Werror', f, '-o', join(dir, 'a.out')], { encoding: 'utf8' });
    return execFileSync(join(dir, 'a.out'), [], { input: stdin, encoding: 'utf8', timeout: 10000, stdio: ['pipe', 'pipe', 'pipe'] });
  }
  throw new Error('no local runner');
}

describe('reference solutions pass their own tests', () => {
  const toolFor = { python: 'python3', c: 'gcc', cpp: 'g++' } as const;
  for (const t of tracks) for (const m of t.modules) for (const l of m.lessons) l.steps.forEach((s, i) => {
    if (s.kind !== 'modify' && s.kind !== 'create') return;
    const tool = toolFor[s.language as keyof typeof toolFor];
    const runner = tool && has(tool) ? it : it.skip;
    runner(`${t.id}/${l.id}#${i + 1} (${s.language})`, () => {
      for (const test of s.tests) {
        const out = runSolution(s, test.stdin ?? '');
        expect(checkOutput(test, out), `${test.description}: got ${JSON.stringify(out)}`).toBe(true);
      }
      // The starter of a modify step must NOT already pass (otherwise there is nothing to modify).
      if (s.kind === 'modify') {
        const starterPasses = s.tests.every((test) => {
          try { return checkOutput(test, runSolution({ ...s, solution: s.starter }, test.stdin ?? '')); } catch { return false; }
        });
        expect(starterPasses, 'starter already passes').toBe(false);
      }
    });
  });
});
