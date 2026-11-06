/// <reference lib="webworker" />
// Runs Python inside a Web Worker so a runaway loop never freezes the UI; the main thread kills the worker on timeout.

type Req = { id: number; source: string; stdin: string };
type Res = { id: number; stdout: string; stderr: string; exitCode: number } | { id: number; error: string } | { ready: true } | { id: number; progress: string };

interface PyodideLike {
  runPythonAsync(code: string): Promise<unknown>;
  setStdin(opts: { stdin: () => string | null; autoEOF?: boolean }): void;
  setStdout(opts: { batched: (s: string) => void }): void;
  setStderr(opts: { batched: (s: string) => void }): void;
}

let pyodide: PyodideLike | null = null;
let loading: Promise<PyodideLike> | null = null;

async function load(): Promise<PyodideLike> {
  if (pyodide) return pyodide;
  if (!loading) {
    loading = (async () => {
      const base = (self as unknown as { __PYODIDE_BASE__?: string }).__PYODIDE_BASE__ ?? '/pyodide/';
      const mod = (await import(/* @vite-ignore */ base + 'pyodide.mjs')) as { loadPyodide: (o: { indexURL: string }) => Promise<PyodideLike> };
      const py = await mod.loadPyodide({ indexURL: base });
      pyodide = py;
      (self as unknown as Worker).postMessage({ ready: true } satisfies Res);
      return py;
    })();
  }
  return loading;
}

self.onmessage = async (ev: MessageEvent<Req | { init: true; base: string }>) => {
  const data = ev.data;
  if ('init' in data) {
    (self as unknown as { __PYODIDE_BASE__?: string }).__PYODIDE_BASE__ = data.base;
    try { await load(); } catch (e) { (self as unknown as Worker).postMessage({ id: -1, error: String(e) } satisfies Res); }
    return;
  }
  const { id, source, stdin } = data;
  try {
    const py = await load();
    let out = '';
    let err = '';
    const lines = stdin.split('\n');
    let lineIdx = 0;
    py.setStdin({ stdin: () => (lineIdx < lines.length ? lines[lineIdx++] : null), autoEOF: true });
    py.setStdout({ batched: (s) => { out += s + '\n'; } });
    py.setStderr({ batched: (s) => { err += s + '\n'; } });
    // Reset the user namespace so lessons don't leak state into each other.
    await py.runPythonAsync('import sys\nfor _k in [k for k in list(globals()) if not k.startswith("_")]:\n    del globals()[_k]\n');
    let exitCode = 0;
    try {
      await py.runPythonAsync(source);
    } catch (e) {
      exitCode = 1;
      err += formatPyError(String(e));
    }
    (self as unknown as Worker).postMessage({ id, stdout: out, stderr: err, exitCode } satisfies Res);
  } catch (e) {
    (self as unknown as Worker).postMessage({ id, error: String(e) } satisfies Res);
  }
};

/** Trim Pyodide's internal frames so the learner sees only their traceback. */
function formatPyError(msg: string): string {
  const lines = msg.split('\n');
  const idx = lines.findIndex((l) => l.includes('File "<exec>"'));
  const kept = idx >= 0 ? ['Traceback (most recent call last):', ...lines.slice(idx)] : lines;
  return kept.join('\n').replace(/^PythonError: /, '');
}
