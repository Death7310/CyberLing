import type { RunnableLanguage } from '../curriculum/schema';
import type { NativeLanguage, Toolchains } from '../native';
import type { CodeRunner, RunOptions, RunResult } from './types';

export const isDesktop = () => typeof window !== 'undefined' && !!window.cyberlingNative;

let toolchainsPromise: Promise<Toolchains> | null = null;
export function toolchains(refresh = false): Promise<Toolchains> {
  if (!window.cyberlingNative) return Promise.resolve({ python: null, c: null, cpp: null, csharp: null });
  if (!toolchainsPromise || refresh) toolchainsPromise = window.cyberlingNative.detectToolchains(refresh);
  return toolchainsPromise;
}

/** Desktop only: runs code with the real toolchain installed on this computer. */
export class NativeRunner implements CodeRunner {
  readonly description = 'Runs with the real toolchain installed on this computer (no sandbox, no network).';
  constructor(readonly language: RunnableLanguage) {}

  async available(): Promise<boolean> {
    if (!isDesktop()) return false;
    const t = await toolchains();
    return !!t[this.language as NativeLanguage];
  }

  async run(source: string, stdin = '', timeoutMs = 30000, options: RunOptions = {}): Promise<RunResult> {
    if (!window.cyberlingNative) return { stdout: '', stderr: '', exitCode: 1, timedOut: false, ms: 0, unavailable: 'not running in the desktop app' };
    return window.cyberlingNative.run({ language: this.language as NativeLanguage, source, stdin, timeoutMs, files: options.files, argv: options.argv });
  }
}

/** Prefers the native toolchain when present, otherwise the fallback (Pyodide or the remote service). */
export class SmartRunner implements CodeRunner {
  constructor(readonly language: RunnableLanguage, private readonly native: NativeRunner, private readonly fallback: CodeRunner | undefined) {}
  get description() { return this.fallback ? `${this.native.description} Falls back to: ${this.fallback.description}` : this.native.description; }
  async activeDescription(): Promise<string> {
    return (await this.native.available()) ? this.native.description : (this.fallback?.description ?? 'No runner available.');
  }
  async available(): Promise<boolean> {
    return (await this.native.available()) || (await (this.fallback?.available() ?? Promise.resolve(false)));
  }
  async run(source: string, stdin = '', timeoutMs?: number, options: RunOptions = {}): Promise<RunResult> {
    if (await this.native.available()) return this.native.run(source, stdin, timeoutMs ?? 30000, options);
    if (!this.fallback) return { stdout: '', stderr: '', exitCode: 1, timedOut: false, ms: 0, unavailable: `No ${this.language} toolchain on this computer and no fallback.` };
    return this.fallback.run(source, stdin, timeoutMs, options);
  }
}
