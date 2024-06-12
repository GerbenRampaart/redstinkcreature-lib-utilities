import { levelsArray, LOG_LEVEL } from './LOG_LEVEL.ts';
import { ENV, envsArray } from './ENV.ts';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { access, readFile, constants
 } from 'node:fs/promises';
 import { path } from 'app-root-path';

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
				n: 'process.cwd()',
				p: process.cwd() ?? '?',
			},
			{
				n: 'homedir()',
				p: homedir(),
			},
			{
				n: 'app-root-path',
				p: path,
			},
		];
	}

	private static _product: ProductJson | undefined;

	/**
	 * Will throw Error if:
	 * - join(root, 'package.json') does not exist or not readable
	 * - Text from file is not parsable as JSON.
	 * - JSON does not have a name and version property.
	 * @returns
	 */
	public static async product(): Promise<ProductJson> {
		if (this._product) {
			return this._product;
		}

		const pjPath = join(AppConstantsService.projectRoot, 'package.json');
		const exists = await access(pjPath, constants.F_OK)
           .then(() => true)
           .catch(() => false);

		   if (!exists) {
			throw new Error(`No package.json found in ${AppConstantsService.projectRoot}`);
		   }

				const text = await readFile(pjPath, { encoding: 'utf-8' });
				const j = JSON.parse(text) as ProductJson;

				if (j.name === undefined || j.version === undefined) {
					throw new Error(`${pjPath} not a valid product json. Name or version undefined.`);
				}

				const pj = {
					name: j.name,
					version: j.version,
				}

		if (pj) {
			this._product = pj;
			return pj;
		}

		throw new Error(
			`No package.json could be parsed. Root was ${AppConstantsService.projectRoot}`,
		);
	}

	private static _projectRoot: string | undefined;

	public static get projectRoot(): string {
		if (this._projectRoot) {
			return this._projectRoot;
		}

		// I have never tested how long the resolve.path of app-root-path takes.
		// But let's cache it regardless since it never changes during the lifetime of the app.

		this._projectRoot = path;

		return this._projectRoot;
	}

	public static get libraryOutDir() {
		return 'lib';
	}
}
