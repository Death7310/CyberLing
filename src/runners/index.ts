import type { RunnableLanguage } from '../curriculum/schema';
import { PyodideRunner } from './pyodideRunner';
import { RemoteRunner } from './remoteRunner';
import type { CodeRunner } from './types';

/** Default public Piston instance. It is rate-limited and third-party; self-host for real use (see docs/ARCHITECTURE.md). */
export const DEFAULT_PISTON_ENDPOINT = 'https://emkc.org/api/v2/piston';

let endpoint = DEFAULT_PISTON_ENDPOINT;
export function setExecutionEndpoint(url: string) { endpoint = url; }
export function getExecutionEndpoint() { return endpoint; }

export const pyodideRunner = new PyodideRunner();

const runners: Partial<Record<RunnableLanguage, CodeRunner>> = {
  python: pyodideRunner,
  c: new RemoteRunner('c', () => endpoint),
  cpp: new RemoteRunner('cpp', () => endpoint),
  csharp: new RemoteRunner('csharp', () => endpoint),
};

export function runnerFor(language: RunnableLanguage): CodeRunner | undefined {
  return runners[language];
}
export type { CodeRunner, RunResult } from './types';
