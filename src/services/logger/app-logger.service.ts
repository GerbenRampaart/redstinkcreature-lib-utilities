import { Inject, Injectable } from '@nestjs/common';
import { type Params, PARAMS_PROVIDER_TOKEN, PinoLogger } from 'nestjs-pino';
import { type LevelWithSilent } from 'pino';
import { RawValueService } from '../misc/raw/raw-value.service.ts';

@Injectable()
export class AppLoggerService extends PinoLogger {
	constructor(
		// @ts-ignore: Params is used for super() but typescript doesn't like it.
		@Inject(PARAMS_PROVIDER_TOKEN) private readonly params: Params,
	) {
		super(params);
	}

	public set level(lvl: string) {
		if (!RawValueService.validLogLevels.includes(lvl)) {
			throw new Error(
				`Tried to set LogLevel ${lvl}. Supported levels: ${
					RawValueService.validLogLevels.join(', ')
				}`,
			);
		}

		PinoLogger.root.level = lvl;
	}

	public get level(): LevelWithSilent {
		return PinoLogger.root.level as LevelWithSilent;
	}

	/**
	 * We used to use Winston which had a log() instead of Pino's info().
	 * So this is purely for backwards compat reasons and does the same thing as info()
	 */
	public log(obj: unknown, msg?: string | undefined, ...args: unknown[]): void {
		this.info(obj, msg, ...args);
	}
}
