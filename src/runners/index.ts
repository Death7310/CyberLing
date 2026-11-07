import type { RunnableLanguage } from '../curriculum/schema';
import { PyodideRunner } from './pyodideRunner';
import { RemoteRunner } from './remoteRunner';
import { NativeRunner, SmartRunner, isDesktop } from './nativeRunner';
import type { CodeRunner } from './types';

/** Default public Piston instance. It is rate-limited and third-party; self-host for real use (see docs/ARCHITECTURE.md). */
export const DEFAULT_PISTON_ENDPOINT = 'https://emkc.org/api/v2/piston';

let endpoint = DEFAULT_PISTON_ENDPOINT;
export function setExecutionEndpoint(url: string) { endpoint = url; }
export function getExecutionEndpoint() { return endpoint; }

export const pyodideRunner = new PyodideRunner();

const fallbacks: Partial<Record<RunnableLanguage, CodeRunner>> = {
  python: pyodideRunner,
  c: new RemoteRunner('c', () => endpoint),
  cpp: new RemoteRunner('cpp', () => endpoint),
  csharp: new RemoteRunner('csharp', () => endpoint),
};

// On desktop (Electron), every language first tries the toolchain installed on the machine.
const runners: Partial<Record<RunnableLanguage, CodeRunner>> = isDesktop()
  ? Object.fromEntries((['python', 'c', 'cpp', 'csharp'] as const).map((l) => [l, new SmartRunner(l, new NativeRunner(l), fallbacks[l])]))
  : fallbacks;

export function runnerFor(language: RunnableLanguage): CodeRunner | undefined {
  return runners[language];
}
export { isDesktop, toolchains } from './nativeRunner';
export type { CodeRunner, RunResult } from './types';
