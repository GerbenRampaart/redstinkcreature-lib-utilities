import { Inject, Injectable } from '@nestjs/common';
import { AppConstantsService } from '../constants/app-constants.service.ts';
import {
	type ProcessEnv,
	type ProcessEnvZod,
} from './app-config-module.options.ts';
import { res } from '../../../../../../../Library/Caches/deno/npm/registry.npmjs.org/pino-std-serializers/6.2.2/index.d.ts';

@Injectable()
export class AppConfigService<TSchema extends ProcessEnv> {
	constructor(
		//@Inject('PROCESS_ENV') processEnv: Record<string, string | undefined>,
		//public readonly fullDotEnvPath?: string,
		//public readonly schema?: ProcessEnvZod,
	) {
		Object.keys(Deno.env).forEach((key) => {
			this.pe.push({
				n: key,
				v: Deno.env.get(key),
			});
		});
	}

	private pe: { n: string; v: string | undefined }[] = [];

	get<T extends keyof TSchema>(key: T): TSchema[T] | undefined {
		const result = this.pe.find((p) => p.n === key);
		return result?.v as TSchema[T];
	}

	getOrThrow<T extends keyof TSchema>(key: T) {
		const result = this.pe.find((p) => p.n === key);

		if (!result) {
			throw new Error(`key ${String(key)} not found or value was undefined`);
		}

		return result.v as TSchema[T];
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
