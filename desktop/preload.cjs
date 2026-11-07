// Runs in the renderer with Node access, isolated from page scripts. Exposes only what the app needs.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cyberlingNative', {
  platform: process.platform,
  info: () => ipcRenderer.invoke('app:info'),
  detectToolchains: (refresh = false) => ipcRenderer.invoke('runner:detect', { refresh }),
  run: (request) => ipcRenderer.invoke('runner:run', request),
  openExternal: (url) => ipcRenderer.invoke('app:open-external', url),
});
