import type { RunnableLanguage } from '../curriculum/schema';
import type { CodeRunner, RunResult } from './types';

/**
 * Compiled languages (C, C++, C#) are executed by a Piston-compatible service
 * (https://github.com/engineer-man/piston), which you can self-host. A phone cannot
 * reasonably carry gcc and the .NET SDK, so this is a network runner by design.
 * When offline, lessons fall back to reading/assembling exercises plus a reference solution.
 */
const PISTON_NAMES: Record<string, string[]> = {
  c: ['c'],
  cpp: ['c++'],
  csharp: ['csharp.net', 'csharp'],
  python: ['python'],
};

const FILE_NAMES: Record<string, string> = { c: 'main.c', cpp: 'main.cpp', csharp: 'Program.cs', python: 'main.py' };

export class RemoteRunner implements CodeRunner {
  readonly description: string;
  constructor(
    readonly language: RunnableLanguage,
    private readonly endpoint: () => string,
  ) {
    this.description = 'Compiled and run by a Piston execution service over the network (configurable in Settings).';
  }

  async available(): Promise<boolean> {
    const ep = this.endpoint().trim();
    if (!ep) return false;
    if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) return false;
    return true;
  }

  async run(source: string, stdin = '', timeoutMs = 15000): Promise<RunResult> {
    const ep = this.endpoint().trim().replace(/\/$/, '');
    const start = Date.now();
    if (!ep) return { stdout: '', stderr: '', exitCode: 1, timedOut: false, unavailable: 'No execution service configured. Open Settings to set one.', ms: 0 };
    const names = PISTON_NAMES[this.language] ?? [this.language];
    let lastErr = '';
    for (const name of names) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeoutMs + 5000);
        const res = await fetch(`${ep}/execute`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            language: name,
            version: '*',
            files: [{ name: FILE_NAMES[this.language] ?? 'main.txt', content: source }],
            stdin,
            run_timeout: timeoutMs,
            compile_timeout: 15000,
          }),
          signal: ctrl.signal,
        });
        clearTimeout(t);
        if (res.status === 400) { lastErr = await res.text(); continue; } // unknown runtime name: try next alias
        if (!res.ok) return { stdout: '', stderr: '', exitCode: 1, timedOut: false, unavailable: `Service error ${res.status}`, ms: Date.now() - start };
        const data = (await res.json()) as { compile?: { stdout: string; stderr: string; code: number }; run: { stdout: string; stderr: string; code: number | null; signal: string | null } };
        if (data.compile && data.compile.code !== 0) {
          return { stdout: '', stderr: data.compile.stderr || data.compile.stdout, exitCode: data.compile.code, timedOut: false, ms: Date.now() - start };
        }
        const timedOut = data.run.signal === 'SIGKILL';
        return { stdout: data.run.stdout, stderr: timedOut ? 'Stopped: the program ran too long.' : data.run.stderr, exitCode: data.run.code ?? 1, timedOut, ms: Date.now() - start };
      } catch (e) {
        lastErr = String(e);
      }
    }
    return { stdout: '', stderr: '', exitCode: 1, timedOut: false, unavailable: `Could not reach the execution service (${lastErr}).`, ms: Date.now() - start };
  }
}
