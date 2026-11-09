import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import type { CreateStep, ModifyStep, Module, Test, Track } from '../src/curriculum/schema';
import { validateTrack } from '../src/curriculum/validate';
import { checkCloze, checkOutput, checkParsons } from '../src/learning/checkers';

export const has = (bin: string) => spawnSync('which', [bin]).status === 0;
export const toolFor: Record<string, string> = { python: 'python3', c: 'gcc', cpp: 'g++', csharp: 'dotnet' };

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
  if (language === 'csharp') {
    // Persistent project so each build is incremental (seconds, not a full restore).
    const proj = join(tmpdir(), 'cyberling-test-dotnet');
    mkdirSync(proj, { recursive: true });
    const csproj = join(proj, 'Program.csproj');
    if (!existsSync(csproj)) {
      writeFileSync(csproj, '<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <OutputType>Exe</OutputType>\n    <TargetFramework>net8.0</TargetFramework>\n    <ImplicitUsings>disable</ImplicitUsings>\n    <Nullable>disable</Nullable>\n    <AssemblyName>Program</AssemblyName>\n    <SatelliteResourceLanguages>en</SatelliteResourceLanguages>\n  </PropertyGroup>\n</Project>\n');
    }
    writeFileSync(join(proj, 'Program.cs'), source);
    const env = { ...process.env, DOTNET_CLI_TELEMETRY_OPTOUT: '1', DOTNET_NOLOGO: '1', DOTNET_SKIP_FIRST_TIME_EXPERIENCE: '1' };
    const build = spawnSync('dotnet', ['build', proj, '--nologo', '-v', 'q', '-c', 'Release', '-p:WarningLevel=3'], { encoding: 'utf8', env, timeout: 180000 });
    if (build.status !== 0) { const e = new Error('C# build failed') as Error & { stderr: string }; e.stderr = (build.stdout + build.stderr).split('\n').filter((l) => /error CS/.test(l)).join('\n'); throw e; }
    return execFileSync('dotnet', [join(proj, 'bin', 'Release', 'net8.0', 'Program.dll'), ...(test.argv ?? [])], { ...opts, env });
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
