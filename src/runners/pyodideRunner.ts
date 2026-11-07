import type { CodeRunner, RunResult } from './types';

/** Python in the browser via Pyodide (CPython compiled to WebAssembly). Works offline once cached. */
export class PyodideRunner implements CodeRunner {
  readonly language = 'python' as const;
  readonly description = 'Runs on this device via Pyodide (CPython in WebAssembly). No network needed.';
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private nextId = 1;
  private pending = new Map<number, (r: RunResult) => void>();
  private starts = new Map<number, number>();
  onStatus?: (s: 'loading' | 'ready' | 'error') => void;

  private spawn(): Promise<void> {
    this.worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url), { type: 'module' });
    const base = new URL(import.meta.env.BASE_URL + 'pyodide/', location.href).href;
    this.onStatus?.('loading');
    this.ready = new Promise<void>((resolve, reject) => {
      this.worker!.onmessage = (ev: MessageEvent) => {
        const d = ev.data;
        if (d.ready) { this.onStatus?.('ready'); resolve(); return; }
        if (d.id === -1 && d.error) { this.onStatus?.('error'); reject(new Error(d.error)); return; }
        const done = this.pending.get(d.id);
        if (!done) return;
        this.pending.delete(d.id);
        const ms = Date.now() - (this.starts.get(d.id) ?? Date.now());
        this.starts.delete(d.id);
        if (d.error) done({ stdout: '', stderr: '', exitCode: 1, timedOut: false, unavailable: d.error, ms });
        else done({ stdout: d.stdout, stderr: d.stderr, exitCode: d.exitCode, timedOut: false, ms });
      };
      this.worker!.onerror = (e) => { this.onStatus?.('error'); reject(new Error(e.message)); };
    });
    this.worker.postMessage({ init: true, base, stdlib: import.meta.env.VITE_PYODIDE_STDLIB ?? 'python_stdlib.zip' });
    return this.ready;
  }

  /** Begin loading in the background (call when a Python lesson opens). */
  warmUp(): Promise<void> {
    return this.ready ?? this.spawn();
  }

  async available(): Promise<boolean> {
    return typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined';
  }

  async run(source: string, stdin = '', timeoutMs = 8000): Promise<RunResult> {
    try {
      await this.warmUp();
    } catch (e) {
      return { stdout: '', stderr: '', exitCode: 1, timedOut: false, unavailable: `Python runtime failed to load: ${String(e)}`, ms: 0 };
    }
    const id = this.nextId++;
    this.starts.set(id, Date.now());
    return new Promise<RunResult>((resolve) => {
      const timer = setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        // Kill the worker: there is no other way to stop synchronous Python. Next run respawns it.
        this.worker?.terminate();
        this.worker = null;
        this.ready = null;
        resolve({ stdout: '', stderr: `Stopped after ${timeoutMs / 1000}s. Is there a loop that never ends?`, exitCode: 1, timedOut: true, ms: timeoutMs });
      }, timeoutMs);
      this.pending.set(id, (r) => { clearTimeout(timer); resolve(r); });
      this.worker!.postMessage({ id, source, stdin });
    });
  }
}
