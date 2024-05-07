import { Inject, Injectable } from '@nestjs/common';
import { AppConstantsService } from '../constants/app-constants.service.ts';
import {
	type ProcessEnv,
	type ProcessEnvZod,
} from './app-config-module.options.ts';

@Injectable()
export class AppConfigService<TSchema extends ProcessEnv> {
	constructor(
		@Inject('PROCESS_ENV') processEnv: Record<string, string | undefined>,
		//public readonly fullDotEnvPath?: string,
		//public readonly schema?: ProcessEnvZod,
	) {
		Object.keys(processEnv).forEach((key) => {
			this.pe.push({
				n: key,
				v: processEnv[key],
			});
		});
	}

	private pe: { n: string; v: string | undefined }[] = [];

	get<T extends keyof TSchema>(key: T) {
		return this.pe.find((p) => p.n === key);
	}

	getOrThrow<T extends keyof TSchema>(key: T) {
		return this.pe.find((p) => p.n === key);
	}

	public get NODE_ENV(): string {
		return AppConstantsService.rawNodeEnv;
	}

	public get LOG_LEVEL(): string {
		return AppConstantsService.rawLogLevel;
	}

/* 	public get keys(): string[] {
		if (this.schema) {
			return Object.keys(this.schema.shape);
		}

		return [];
	} */
}
