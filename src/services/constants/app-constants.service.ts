import { levelsArray, LOG_LEVEL } from './LOG_LEVEL.ts';
import { DENO_ENV, envsArray } from './DENO_ENV.ts';

export class AppConstantsService {
	public static rawLogLevel() {
		return LOG_LEVEL();
	}

	public static rawDenoEnv() { 
		return DENO_ENV();
	}

	public static get libUtilitiesConstants() {
		return {
			headers: {
				correlationId: 'x-correlation-id',
				requestId: 'x-request-id',
				responseTime: 'x-response-time',
			},
		} as const;
	}

	public static get validLogLevels(): string[] {
		return levelsArray;
	}

	public static get validDenoEnvs(): string[] {
		return envsArray;
	}

	public static get denoEnv() {
		const de = this.rawDenoEnv();
		const isTest = de === 'test';
		const isProduction = de === 'production';
		const isDevelopment = de === 'development';
		const isRepl = de === 'repl';

		return {
			isTest,
			isProduction,
			isDevelopment,
			isRepl,
			isDebug: isRepl || isDevelopment || isTest,
		};
	}
}
