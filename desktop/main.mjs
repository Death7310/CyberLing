// Electron main process: serves the built web app over a private app:// scheme and exposes
// the native toolchain runner to the renderer through a narrow, validated IPC surface.
import { app, BrowserWindow, ipcMain, net, protocol, shell, Menu } from 'electron';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { detectToolchains, runNative } from './local-runner.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = app.isPackaged ? path.join(process.resourcesPath, 'web') : path.join(__dirname, '..', 'dist-artifact');
const LANGS = new Set(['python', 'c', 'cpp', 'csharp']);

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
]);

function serveApp() {
  protocol.handle('app', (request) => {
    const url = new URL(request.url);
    let p = decodeURIComponent(url.pathname);
    if (p === '/' || p === '') p = '/index.html';
    const file = path.normalize(path.join(WEB_ROOT, p));
    if (!file.startsWith(WEB_ROOT)) return new Response('forbidden', { status: 403 });
    return net.fetch(pathToFileURL(file).href);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 820,
    minHeight: 600,
    backgroundColor: '#0f172a',
    title: 'CyberLing',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('app://')) e.preventDefault(); });
  win.loadURL('app://cyberling/index.html');
  return win;
}

ipcMain.handle('runner:detect', (_e, opts) => detectToolchains({ refresh: Boolean(opts?.refresh) }));
ipcMain.handle('runner:run', (_e, req) => {
  if (!req || typeof req !== 'object' || !LANGS.has(req.language) || typeof req.source !== 'string') {
    return { stdout: '', stderr: '', exitCode: 1, timedOut: false, ms: 0, unavailable: 'bad request' };
  }
  const files = req.files && typeof req.files === 'object' ? Object.fromEntries(Object.entries(req.files).filter(([k, v]) => typeof k === 'string' && typeof v === 'string' && !path.isAbsolute(k) && !k.includes('..'))) : undefined;
  const argv = Array.isArray(req.argv) ? req.argv.filter((a) => typeof a === 'string').slice(0, 64) : undefined;
  return runNative({ language: req.language, source: req.source.slice(0, 200_000), stdin: typeof req.stdin === 'string' ? req.stdin.slice(0, 100_000) : '', timeoutMs: Number(req.timeoutMs) || undefined, files, argv });
});
ipcMain.handle('app:info', () => ({ platform: process.platform, arch: process.arch, version: app.getVersion(), electron: process.versions.electron }));
ipcMain.handle('app:open-external', (_e, url) => { if (typeof url === 'string' && /^https?:/.test(url)) shell.openExternal(url); });

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(Menu.buildFromTemplate([{ role: 'appMenu' }, { role: 'editMenu' }, { role: 'viewMenu' }, { role: 'windowMenu' }]));
  }
  serveApp();
  createWindow();
  detectToolchains().catch(() => {});
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
