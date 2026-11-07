/**
 * Native code runner for the desktop app. Runs learner programs with the real toolchains
 * installed on this computer (CPython, gcc/clang, g++/clang++, the .NET SDK).
 * Pure Node: no Electron imports, so it can be unit-tested directly.
 */
import { execFile, spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readdir, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const WIN = process.platform === 'win32';
const OUTPUT_LIMIT = 1024 * 1024; // 1 MB per stream

/** Candidate commands per language, first match wins. */
const CANDIDATES = {
  python: [
    { cmd: 'python3', probe: ['--version'], prefix: [] },
    { cmd: 'python', probe: ['--version'], prefix: [] },
    { cmd: 'py', probe: ['-3', '--version'], prefix: ['-3'] },
  ],
  c: [
    { cmd: 'gcc', probe: ['--version'], prefix: [] },
    { cmd: 'clang', probe: ['--version'], prefix: [] },
    { cmd: 'cc', probe: ['--version'], prefix: [] },
  ],
  cpp: [
    { cmd: 'g++', probe: ['--version'], prefix: [] },
    { cmd: 'clang++', probe: ['--version'], prefix: [] },
    { cmd: 'c++', probe: ['--version'], prefix: [] },
  ],
  csharp: [{ cmd: 'dotnet', probe: ['--version'], prefix: [] }],
};

function probe(cmd, args) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: 8000, windowsHide: true, encoding: 'utf8' }, (err, stdout, stderr) => {
      if (err) return resolve(null);
      const text = (stdout + '\n' + stderr).trim();
      const m = text.match(/\d+\.\d+(\.\d+)?/);
      if (!m) return resolve(null);
      resolve({ cmd, version: m[0], banner: text.split('\n')[0].slice(0, 120) });
    });
  });
}

let cache = null;

/** @returns {Promise<Record<'python'|'c'|'cpp'|'csharp', {cmd:string, version:string, banner:string, prefix:string[]}|null>>} */
export async function detectToolchains({ refresh = false } = {}) {
  if (cache && !refresh) return cache;
  const out = {};
  await Promise.all(
    Object.entries(CANDIDATES).map(async ([lang, list]) => {
      out[lang] = null;
      for (const c of list) {
        const r = await probe(c.cmd, c.probe);
        if (r) { out[lang] = { ...r, prefix: c.prefix }; break; }
      }
    }),
  );
  cache = out;
  return out;
}

function runProcess(cmd, args, { cwd, stdin = '', timeoutMs, env }) {
  return new Promise((resolve) => {
    const start = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let child;
    try {
      child = spawn(cmd, args, { cwd, env: { ...process.env, ...env }, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (e) {
      return resolve({ stdout: '', stderr: String(e), exitCode: 1, timedOut: false, ms: 0 });
    }
    const timer = setTimeout(() => {
      timedOut = true;
      if (WIN) spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true });
      else child.kill('SIGKILL');
    }, timeoutMs);
    child.stdout.on('data', (d) => { if (stdout.length < OUTPUT_LIMIT) stdout += d.toString('utf8'); });
    child.stderr.on('data', (d) => { if (stderr.length < OUTPUT_LIMIT) stderr += d.toString('utf8'); });
    child.on('error', (e) => { clearTimeout(timer); resolve({ stdout, stderr: stderr + String(e), exitCode: 1, timedOut, ms: Date.now() - start }); });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr: timedOut ? `Stopped after ${timeoutMs / 1000}s. Is there a loop that never ends?` : stderr, exitCode: timedOut ? 1 : (code ?? 1), timedOut, ms: Date.now() - start });
    });
    child.stdin.on('error', () => {});
    child.stdin.end(stdin);
  });
}

async function prepareDir(files) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cyberling-run-'));
  for (const [name, content] of Object.entries(files ?? {})) {
    const target = path.join(dir, name);
    if (!target.startsWith(dir)) continue;
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, 'utf8');
  }
  return dir;
}

/**
 * @param {{language:'python'|'c'|'cpp'|'csharp', source:string, stdin?:string, timeoutMs?:number, files?:Record<string,string>, argv?:string[]}} req
 */
export async function runNative(req) {
  const tools = await detectToolchains();
  const tool = tools[req.language];
  if (!tool) return { stdout: '', stderr: '', exitCode: 1, timedOut: false, ms: 0, unavailable: `No ${req.language} toolchain found on this computer.` };
  const timeoutMs = Math.min(Math.max(req.timeoutMs ?? 30000, 1000), 120000);
  const argv = (req.argv ?? []).map(String);
  const dir = await prepareDir(req.files);
  try {
    switch (req.language) {
      case 'python': {
        await writeFile(path.join(dir, 'main.py'), req.source, 'utf8');
        return await runProcess(tool.cmd, [...tool.prefix, 'main.py', ...argv], { cwd: dir, stdin: req.stdin, timeoutMs, env: { PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1', PYTHONDONTWRITEBYTECODE: '1' } });
      }
      case 'c':
      case 'cpp': {
        const src = req.language === 'c' ? 'main.c' : 'main.cpp';
        const exe = path.join(dir, WIN ? 'main.exe' : 'main');
        await writeFile(path.join(dir, src), req.source, 'utf8');
        const flags = req.language === 'c' ? ['-std=c17', '-Wall', '-Wextra'] : ['-std=c++20', '-Wall', '-Wextra'];
        const compile = await runProcess(tool.cmd, [...flags, '-O1', src, '-o', exe, ...(req.language === 'c' && !WIN ? ['-lm'] : [])], { cwd: dir, timeoutMs: 60000 });
        if (compile.exitCode !== 0) return { ...compile, stdout: '', stderr: compile.stderr || compile.stdout || 'compilation failed' };
        return await runProcess(exe, argv, { cwd: dir, stdin: req.stdin, timeoutMs });
      }
      case 'csharp':
        return await runCSharp(tool, req.source, argv, req.stdin ?? '', dir, timeoutMs);
    }
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {});
  }
  return { stdout: '', stderr: '', exitCode: 1, timedOut: false, ms: 0, unavailable: 'unsupported language' };
}

/** A persistent console project so incremental builds take seconds, not the 10+ s of a fresh restore. */
async function runCSharp(tool, source, argv, stdin, cwd, timeoutMs) {
  const major = tool.version.split('.')[0];
  const proj = path.join(os.tmpdir(), `cyberling-dotnet-${major}`);
  await mkdir(proj, { recursive: true });
  const csproj = path.join(proj, 'Program.csproj');
  if (!(await exists(csproj))) {
    await writeFile(csproj, `<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <OutputType>Exe</OutputType>\n    <TargetFramework>net${major}.0</TargetFramework>\n    <ImplicitUsings>enable</ImplicitUsings>\n    <Nullable>enable</Nullable>\n    <AssemblyName>Program</AssemblyName>\n    <RootNamespace>Program</RootNamespace>\n    <SatelliteResourceLanguages>en</SatelliteResourceLanguages>\n  </PropertyGroup>\n</Project>\n`, 'utf8');
  }
  await writeFile(path.join(proj, 'Program.cs'), source, 'utf8');
  const build = await runProcess(tool.cmd, ['build', proj, '--nologo', '-v', 'q', '-c', 'Release', '-p:WarningLevel=3'], { cwd: proj, timeoutMs: 120000, env: { DOTNET_CLI_TELEMETRY_OPTOUT: '1', DOTNET_NOLOGO: '1', DOTNET_SKIP_FIRST_TIME_EXPERIENCE: '1' } });
  if (build.exitCode !== 0) {
    const errors = (build.stdout + '\n' + build.stderr).split('\n').filter((l) => /error|warning CS/.test(l)).map((l) => l.replace(proj + path.sep, '').replace(/\s*\[.*\]\s*$/, '')).join('\n');
    return { ...build, stdout: '', stderr: errors || build.stdout || build.stderr };
  }
  const dll = await findFile(path.join(proj, 'bin', 'Release'), 'Program.dll');
  if (!dll) return { stdout: '', stderr: 'Build produced no Program.dll', exitCode: 1, timedOut: false, ms: build.ms };
  return runProcess(tool.cmd, [dll, ...argv], { cwd, stdin, timeoutMs, env: { DOTNET_CLI_TELEMETRY_OPTOUT: '1', DOTNET_NOLOGO: '1' } });
}

async function exists(p) { try { await stat(p); return true; } catch { return false; } }
async function findFile(root, name) {
  if (!(await exists(root))) return null;
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const p = path.join(root, entry.name);
    if (entry.isDirectory()) { const r = await findFile(p, name); if (r) return r; }
    else if (entry.name === name) return p;
  }
  return null;
}
