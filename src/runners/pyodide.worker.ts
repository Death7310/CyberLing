/// <reference lib="webworker" />
// Runs Python inside a Web Worker so a runaway loop never freezes the UI; the main thread kills the worker on timeout.

type Req = { id: number; source: string; stdin: string; files?: Record<string, string>; argv?: string[] };
type Res = { id: number; stdout: string; stderr: string; exitCode: number } | { id: number; error: string } | { ready: true } | { id: number; progress: string };

interface PyodideLike {
  runPythonAsync(code: string): Promise<unknown>;
  globals: { set(name: string, value: unknown): void };
  toPy(value: unknown): unknown;
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
      const g = self as unknown as { __PYODIDE_BASE__?: string; __PYODIDE_STDLIB__?: string };
      const base = g.__PYODIDE_BASE__ ?? '/pyodide/';
      const mod = (await import(/* @vite-ignore */ base + 'pyodide.mjs')) as { loadPyodide: (o: { indexURL: string; stdLibURL?: string }) => Promise<PyodideLike> };
      // Some hosts refuse to serve .zip; the artifact build renames the stdlib archive, so its name is configurable.
      const py = await mod.loadPyodide({ indexURL: base, stdLibURL: base + (g.__PYODIDE_STDLIB__ ?? 'python_stdlib.zip') });
      pyodide = py;
      (self as unknown as Worker).postMessage({ ready: true } satisfies Res);
      return py;
    })();
  }
  return loading;
}

self.onmessage = async (ev: MessageEvent<Req | { init: true; base: string; stdlib: string }>) => {
  const data = ev.data;
  if ('init' in data) {
    const g = self as unknown as { __PYODIDE_BASE__?: string; __PYODIDE_STDLIB__?: string };
    g.__PYODIDE_BASE__ = data.base;
    g.__PYODIDE_STDLIB__ = data.stdlib;
    try { await load(); } catch (e) { (self as unknown as Worker).postMessage({ id: -1, error: String(e) } satisfies Res); }
    return;
  }
  const { id, source, stdin, files, argv } = data;
  try {
    const py = await load();
    let out = '';
    let err = '';
    const lines = stdin.split('\n');
    let lineIdx = 0;
    py.setStdin({ stdin: () => (lineIdx < lines.length ? lines[lineIdx++] : null), autoEOF: true });
    py.setStdout({ batched: (s) => { out += s + '\n'; } });
    py.setStderr({ batched: (s) => { err += s + '\n'; } });
    // Fresh working directory, argv and namespace for every run so tests never see each other's files or names.
    py.globals.set('_cl_files', py.toPy(files ?? {}));
    py.globals.set('_cl_argv', py.toPy(['main.py', ...(argv ?? [])]));
    await py.runPythonAsync([
      'import sys, os, tempfile',
      'os.chdir(tempfile.mkdtemp())',
      'for _n, _c in dict(_cl_files).items():',
      '    os.makedirs(os.path.dirname(_n) or ".", exist_ok=True)',
      '    open(_n, "w").write(_c)',
      'sys.argv = list(_cl_argv)',
      'for _k in [k for k in list(globals()) if not k.startswith("_")]:',
      '    del globals()[_k]',
      'for _m in [m for m in list(sys.modules) if m in ("ledger", "entry", "storage", "report", "cli")]:',
      '    del sys.modules[_m]',
    ].join('\n'));
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
