import type { RunnableLanguage } from '../curriculum/schema';

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  /** Set when the run could not happen at all (runner missing, network down). Distinct from a program error. */
  unavailable?: string;
  /** Wall time in ms. */
  ms: number;
}

export interface CodeRunner {
  readonly language: RunnableLanguage;
  /** Human-readable description of how code is executed, shown in Settings. */
  readonly description: string;
  available(): Promise<boolean>;
  run(source: string, stdin?: string, timeoutMs?: number): Promise<RunResult>;
}
