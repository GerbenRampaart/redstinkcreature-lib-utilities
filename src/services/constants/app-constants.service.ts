import { levelsArray, LOG_LEVEL } from './LOG_LEVEL.ts';
import { DENO_ENV, envsArray } from './DENO_ENV.ts';
import { homedir } from 'node:os';
import { existsSync } from 'std/fs';
import { join } from 'std/path';

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
					n: 'homedir()',
					p: homedir(),
				},
			];
	}

	private static _product: {
		name: string;
		version: string;
	} | undefined;

	/**
	 * Will throw Error if:
	 * - join(Deno.cwd(), 'deno.json') does not exist or not readable
	 * - Text from file is not parsable as JSON.
	 * - JSON does not have a name and version property.
	 * @returns 
	 */
	public static async product() {
		if (this._product) {
			return this._product;
		}

		const djPath = join(Deno.cwd(), 'deno.json');

		if (!existsSync(djPath, {
			isFile: true,
			isReadable: true,
		})) {
			throw new Error(`No deno.json found in the project root. cwd was ${Deno.cwd()}`);
		}

		const djText = await Deno.readTextFile(djPath);
		const dj = JSON.parse(djText);

		if (dj?.name && dj?.version) {
			this._product = dj;
			return dj;
		} else {
			throw new Error(
				`No valid deno.json found in the project root. cwd was ${Deno.cwd()}`,
			);
		}
	}
}
