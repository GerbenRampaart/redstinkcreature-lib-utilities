import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConstantsService } from '../constants/app-constants.service.ts';
import { ProcessEnv, ProcessEnvZod } from './app-config-module.options.ts';

@Injectable()
export class AppConfigService<TSchema extends ProcessEnv> {
	constructor(
		private readonly cfg: ConfigService<TSchema, true>,
		@Optional() public readonly beforeValidate: Record<string, unknown>,
		@Optional() public readonly afterValidate: Record<string, unknown>,
		@Optional() public readonly fullDotEnvPath?: string,
		@Optional() public readonly schema?: ProcessEnvZod,
	) {
	}

	get<T extends keyof TSchema>(key: T): TSchema[T] {
		const val: TSchema = this.cfg.get<TSchema>(key, { infer: true });
		return val[key];
	}

	getOrThrow<T extends keyof TSchema>(key: T): TSchema[T] {
		return this.cfg.getOrThrow<TSchema>(key, { infer: true });
	}

	public get NODE_ENV(): string {
		return AppConstantsService.rawNodeEnv;
	}

	public get LOG_LEVEL(): string {
		return AppConstantsService.rawLogLevel;
	}

	public get keys(): string[] {
		if (this.schema) {
			return Object.keys(this.schema.shape);
		}

		return [];
	}
}
