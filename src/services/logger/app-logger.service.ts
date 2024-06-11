
import { AppConstantsService } from '../constants/app-constants.service.ts';
import { PinoLogger, type Params, PARAMS_PROVIDER_TOKEN } from 'nestjs-pino';
import { Injectable, Inject } from '@nestjs/common';
import { type LevelWithSilent } from 'pino';

@Injectable()
export class AppLoggerService extends PinoLogger {
	constructor(
		@Inject(PARAMS_PROVIDER_TOKEN) params: Params,
	) {
		super(params);
	}

	public set level(lvl: string) {
		if (!AppConstantsService.validLogLevels.includes(lvl)) {
			throw new Error(
				`Tried to set LogLevel ${lvl}. Supported levels: ${AppConstantsService.validLogLevels.join(', ')
				}`,
			);
		}

		this.logger.level = lvl;
	}

	public get level(): LevelWithSilent {
		return this.logger.level as LevelWithSilent;
	}

	/**
	 * We used to use Winston which had a log() instead of Pino's info().
	 * So this is purely for backwards compat reasons and does the same thing as info()
	 */
	public log(
		obj: unknown,
		msg?: string | undefined,
		...args: unknown[]
	): void {
		this.logger.info(obj, msg, ...args);
	}
}
