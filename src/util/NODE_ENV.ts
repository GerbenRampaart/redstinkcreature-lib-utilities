import { processEnvValueOrDefault } from './processEnvValueOrDefault';

const isTest = process.env.NODE_ENV === 'test';
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isRepl = process.env.NODE_ENV === 'repl';
const isDebug = isTest || isDevelopment || isRepl;

export const NodeEnv = {
	isTest,
	isDevelopment,
	isProduction,
	isRepl,
	isDebug,
};

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
// Things like LOG_LEVEL and NODE_ENV are so low-level I want some access to defaults without
// having any higher level code initiliazed like nestjs modules.
export const NODE_ENV = function (): string {
	return processEnvValueOrDefault(
		'NODE_ENV',
		'production',
		envsArray,
	);
};
