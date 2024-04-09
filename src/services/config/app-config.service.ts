import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConstantsService } from '../constants/app-constants.service';

@Injectable()
export class AppConfigService<TSchema> {
	constructor(
		private configService: ConfigService<TSchema, true>,
	) {
	}

	get<T extends keyof TSchema>(key: T) {
		return this.configService.get<TSchema>(key, { infer: true });
	}

	getorThrow<T extends keyof TSchema>(key: T) {
		return this.configService.getOrThrow<TSchema>(key, { infer: true });
	}

	public get NODE_ENV(): string {
		return AppConstantsService.rawNodeEnv;
	}

	public get LOG_LEVEL(): string {
		return AppConstantsService.rawLogLevel;
	}
}
