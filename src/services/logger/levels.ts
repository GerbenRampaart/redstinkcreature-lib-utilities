/**
 * Array from pino.LevelWithSilent
 */
export const pinoLevels: string[] = [
  "silent",
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
] as const;

export function logLevelOrDefault(): string {
  const v = process.env['LOG_LEVEL'] ?? 'debug';

  if (!pinoLevels.includes(v)) {
      return 'debug';
  }

  return v;
}