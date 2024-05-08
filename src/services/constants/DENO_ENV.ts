import { processEnvValueOrDefault } from './processEnvValueOrDefault.ts';

// Internal type
export const envs = [
	'development',
	'production',
	'test',
	'repl',
] as const;

export const envsArray: string[] = [
	'development',
	'production',
	'test',
	'repl',
];

// This is just safe code.
// Things like LOG_LEVEL and DENO_ENV are so low-level I want some access to defaults without
// having any higher level code initiliazed like nestjs modules.
export const DENO_ENV = function (): string {
	return processEnvValueOrDefault(
		'DENO_ENV',
		'production',
		envsArray,
	);
};
