import type { RunResult } from './runners/types';

export type NativeLanguage = 'python' | 'c' | 'cpp' | 'csharp';
export interface Toolchain { cmd: string; version: string; banner: string; prefix: string[] }
export type Toolchains = Record<NativeLanguage, Toolchain | null>;

export interface CyberlingNative {
  platform: 'darwin' | 'win32' | 'linux' | string;
  info(): Promise<{ platform: string; arch: string; version: string; electron: string }>;
  detectToolchains(refresh?: boolean): Promise<Toolchains>;
  run(request: { language: NativeLanguage; source: string; stdin?: string; timeoutMs?: number; files?: Record<string, string>; argv?: string[] }): Promise<RunResult>;
  openExternal(url: string): Promise<void>;
}

declare global {
  interface Window { cyberlingNative?: CyberlingNative }
}
