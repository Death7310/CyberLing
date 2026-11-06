import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.cyberling.app',
  appName: 'CyberLing',
  webDir: 'dist',
  android: {
    // Pyodide needs cross-origin isolation headers for threads; we run single-threaded, so none needed.
    allowMixedContent: false,
  },
  server: {
    // Serve over https scheme so service workers and WASM streaming work in the WebView.
    androidScheme: 'https',
  },
};

export default config;
