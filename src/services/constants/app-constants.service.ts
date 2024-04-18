import { levelsArray, LOG_LEVEL } from './LOG_LEVEL.ts';
import { envsArray, NODE_ENV } from './NODE_ENV.ts';

export class AppConstantsService {
	public static rawLogLevel = LOG_LEVEL();
	public static rawNodeEnv = NODE_ENV();

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

	public static get validNodeEnvs(): string[] {
		return envsArray;
	}

	public static get nodeEnv() {
		const isTest = this.rawNodeEnv === 'test';
		const isProduction = this.rawNodeEnv === 'production';
		const isDevelopment = this.rawNodeEnv === 'development';
		const isRepl = this.rawNodeEnv === 'repl';

		return {
			isTest,
			isProduction,
			isDevelopment,
			isRepl,
			isDebug: isRepl || isDevelopment || isTest,
		};
	}
}
