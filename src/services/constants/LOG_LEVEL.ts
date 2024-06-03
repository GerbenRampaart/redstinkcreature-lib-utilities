import { processEnvValueOrDefault } from './processEnvValueOrDefault.ts';

// TODO: it's a bit infuriating I can't re-use the array values here. But at least they are isolated.
// The story: zod.enum() needs a literal string array and not a dynamic one. However I do need the dynamic
// array to do some low-level check when starting the app and assume a minimum default.

export const levels = [
	'silent',
	'fatal',
	'error',
	'warn',
	'info',
	'debug',
	'trace',
] as const;

export const levelsArray: string[] = [
	'silent',
	'fatal',
	'error',
	'warn',
	'info',
	'debug',
	'trace',
];

// We coalesce the log level to 'info' if it's not set,
// but we really should never worry about it being undefined because we
// use the zod schema to fill it with a default.

// So this is just safe code.
// Things like LOG_LEVEL and ENV are so low-level I want some access to defaults without
// having any higher level code initialized like nestjs modules.
export const LOG_LEVEL = function (): string {
	return processEnvValueOrDefault(
		LOG_LEVEL_NAME,
		'info',
		levelsArray,
	);
};

export const LOG_LEVEL_NAME = 'LOG_LEVEL';
