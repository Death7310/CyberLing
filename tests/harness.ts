import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import type { CreateStep, ModifyStep, Module, Test, Track } from '../src/curriculum/schema';
import { validateTrack } from '../src/curriculum/validate';
import { checkCloze, checkOutput, checkParsons } from '../src/learning/checkers';

export const has = (bin: string) => spawnSync('which', [bin]).status === 0;
export const toolFor: Record<string, string> = { python: 'python3', c: 'gcc', cpp: 'g++' };

/** Run a reference solution (or any source) the way the app would: fresh cwd, fixture files, argv, stdin. */
export function runSource(language: string, source: string, test: Test): string {
  const dir = mkdtempSync(join(tmpdir(), 'cl-'));
  for (const [name, content] of Object.entries(test.files ?? {})) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), content);
  }
  const opts = { input: test.stdin ?? '', encoding: 'utf8' as const, timeout: 10000, cwd: dir, stdio: ['pipe', 'pipe', 'pipe'] as ['pipe', 'pipe', 'pipe'] };
  if (language === 'python') {
    const f = join(dir, 'main.py'); writeFileSync(f, source);
    return execFileSync('python3', ['-I', f, ...(test.argv ?? [])], opts);
  }
  if (language === 'c' || language === 'cpp') {
    const f = join(dir, language === 'c' ? 'main.c' : 'main.cpp'); writeFileSync(f, source);
    execFileSync(language === 'c' ? 'gcc' : 'g++', ['-Wall', '-Wextra', '-Werror', f, '-o', join(dir, 'a.out')], { encoding: 'utf8' });
    return execFileSync(join(dir, 'a.out'), test.argv ?? [], opts);
  }
  throw new Error('no local runner for ' + language);
}

export interface Problem { where: string; message: string }

/** All content checks for one track, as a list of problems. Empty = good. Executes solutions when a toolchain exists. */
export function auditTrack(track: Track): Problem[] {
  const problems: Problem[] = validateTrack(track).map((m) => ({ where: track.id, message: m }));
  for (const m of track.modules) for (const l of m.lessons) l.steps.forEach((s, i) => {
    const where = `${track.id}/${l.id}#${i + 1}`;
    if (s.kind === 'parsons') {
      const attempt = s.solution.map((x) => ({ text: x.trimStart(), indent: x.length - x.trimStart().length }));
      if (!checkParsons(s, { lines: attempt }).ok) problems.push({ where, message: 'parsons solution fails its own checker' });
      for (const d of s.distractors ?? []) {
        const wrong = [...attempt]; wrong[0] = { text: d.trimStart(), indent: 0 };
        if (checkParsons(s, { lines: wrong }).ok) problems.push({ where, message: `distractor passes: ${d}` });
      }
    }
    if (s.kind === 'cloze') {
      const answers = Object.fromEntries(s.blanks.map((b) => [b.id, b.answers[0]]));
      if (!checkCloze(s, answers).ok) problems.push({ where, message: 'cloze canonical answers fail' });
      if (checkCloze(s, {}).ok) problems.push({ where, message: 'cloze passes with empty answers' });
    }
    if (s.kind === 'modify' || s.kind === 'create') {
      const tool = toolFor[s.language];
      if (!tool || !has(tool)) return;
      for (const test of s.tests) {
        try {
          const out = runSource(s.language, (s as ModifyStep | CreateStep).solution, test);
          if (!checkOutput(test, out)) problems.push({ where, message: `solution fails test "${test.description}": got ${JSON.stringify(out)}` });
        } catch (e) {
          problems.push({ where, message: `solution crashed on "${test.description}": ${String((e as { stderr?: string }).stderr ?? e).slice(0, 400)}` });
        }
      }
      if (s.kind === 'modify') {
        const starterPasses = s.tests.every((test) => { try { return checkOutput(test, runSource(s.language, s.starter, test)); } catch { return false; } });
        if (starterPasses) problems.push({ where, message: 'modify starter already passes all tests' });
      }
    }
  });
  return problems;
}

export const fakeTrack = (module: Module): Track => ({
  id: 'python', title: 'x', tagline: 'x', prerequisites: [], runnable: true, notionalMachine: ['x'], projectSpine: { title: 'x', description: 'x' }, modules: [module],
});
