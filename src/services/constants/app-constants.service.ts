import { levelsArray, LOG_LEVEL } from './LOG_LEVEL.ts';
import { ENV, envsArray } from './ENV.ts';
import { homedir } from 'node:os';
import { exists } from 'std/fs';
import { join } from 'std/path';

export interface ProductJson {
	name: string;
	version: string;
}

export class AppConstantsService {
	private constructor() {
	}

	public static rawLogLevel(): string {
		return LOG_LEVEL();
	}

	public static rawEnv(): string {
		return ENV();
	}

	public static get libUtilitiesConstants(): {
		headers: {
			correlationId: string;
			requestId: string;
			responseTime: string;
		};
	} {
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

	public static get validEnvs(): string[] {
		return envsArray;
	}

	public static get env(): {
		isTest: boolean;
		isProduction: boolean;
		isDevelopment: boolean;
		isRepl: boolean;
		isDebug: boolean;
	} {
		const de = this.rawEnv();
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

	public static get paths(): {
		n: string;
		p: string;
	}[] {
		return [
			{
				n: 'cwd',
				p: Deno.cwd(),
			},
			{
				n: 'import.meta.dirname',
				p: import.meta.dirname ?? '?',
			},
			{
				n: 'import.meta.filename',
				p: import.meta.filename ?? '?',
			},
			{
				n: 'import.meta.url',
				p: import.meta.url ?? '?',
			},
			{
				n: 'homedir()',
				p: homedir(),
			},
		];
	}

	private static _product: ProductJson | undefined;

	/**
	 * Will throw Error if:
	 * - join(Deno.cwd(), 'deno.json') does not exist or not readable
	 * - Text from file is not parsable as JSON.
	 * - JSON does not have a name and version property.
	 * @returns
	 */
	public static async product(): Promise<ProductJson> {
		if (this._product) {
			return this._product;
		}

		const djPath = join(Deno.cwd(), 'deno.json');
		const ex = await exists(djPath, {
			isFile: true,
		});

		if (!ex) {
			throw new Error(
				`No deno.json found in the project root. cwd was ${Deno.cwd()}`,
			);
		}

		const djText = await Deno.readTextFile(djPath);
		const dj = JSON.parse(djText);

		if (dj?.name && dj?.version) {
			this._product = dj as ProductJson;
			return dj;
		} else {
			throw new Error(
				`No valid deno.json found in the project root. cwd was ${Deno.cwd()}`,
			);
		}
	}
}
