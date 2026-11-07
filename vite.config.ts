import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// One codebase, three targets:
//  - laptop browser / installable PWA (this config, `npm run build`)
//  - Android APK via Capacitor (`npm run android:apk`), which wraps dist/
//  - desktop shells (Electron/Tauri) can wrap dist/ the same way later.
// CYBERLING_TARGET=artifact builds a relocatable copy (relative URLs, no service worker)
// for hosting under an arbitrary path, e.g. a claude.ai artifact or a static file host.
const artifact = process.env.CYBERLING_TARGET === 'artifact';

export default defineConfig({
  base: artifact ? './' : '/',
  // Artifact hosts don't serve .zip, so the stdlib archive is renamed by scripts/postbuild-artifact.mjs.
  define: artifact ? { 'import.meta.env.VITE_PYODIDE_STDLIB': JSON.stringify('python_stdlib.wasm') } : {},
  plugins: [
    react(),
    !artifact && VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'CyberLing',
        short_name: 'CyberLing',
        description: 'Learn programming languages the way you learn a language: from zero, through projects.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Pyodide is ~14MB; precaching it makes Python work fully offline after first load.
        maximumFileSizeToCacheInBytes: 40 * 1024 * 1024,
        globPatterns: ['**/*.{js,mjs,css,html,svg,png,wasm,zip,json}'],
      },
    }),
  ],
  worker: { format: 'es' },
  build: { target: 'es2022', sourcemap: false, outDir: artifact ? 'dist-artifact' : 'dist' },
  server: { host: true },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
