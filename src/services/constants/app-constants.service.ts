import { levelsArray, LOG_LEVEL } from './LOG_LEVEL.ts';
import { ENV, envsArray } from './ENV.ts';
import { homedir } from 'node:os';
import { exists } from '@std/fs';
import { join } from '@std/path';
import arp from 'app-root-path';

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
				n: 'homedir()',
				p: homedir(),
			},
			{
				n: 'app-root-path',
				p: arp.path,
			}
		];
	}

	private static _product: ProductJson | undefined;

	/**
	 * Will throw Error if:
	 * - join(root, 'deno.json') does not exist or not readable
	 * - Text from file is not parsable as JSON.
	 * - JSON does not have a name and version property.
	 * @returns
	 */
	public static async product(): Promise<ProductJson> {
		if (this._product) {
			return this._product;
		}

		const djPath = join(AppConstantsService.projectRoot, 'deno.json');
		const djExists = await exists(djPath, {
			isFile: true,
		});

		const pjPath = join(AppConstantsService.projectRoot, 'package.json');
		const pjExists = await exists(pjPath, {
			isFile: true,
		});

		if (pjExists && djExists) {
			throw new Error(
				`Both deno.json AND package.json found, that's invalid. Root was ${AppConstantsService.projectRoot}`,
			);
		}

		if (!pjExists && !djExists) {
			throw new Error(
				`No deno.json OR package.json found in the project root. Root was ${AppConstantsService.projectRoot}`,
			);
		}

		const getProduct = async (p: string): Promise<ProductJson | undefined> => {
			try {
				const text = await Deno.readTextFile(p);
				const j = JSON.parse(text);
				return (j?.name && j?.version) ? j as ProductJson : undefined;
			} catch {
				return undefined;
			}
		}

		const pj = await getProduct(pjPath);

		if (pj) {
			this._product = pj;
			return pj;
		}

		const dj = await getProduct(djPath);
		
		if (dj) {
			this._product = dj;
			return dj;
		}

		throw new Error(
			`No deno.json OR package.json could be parsed. Root was ${AppConstantsService.projectRoot}`,
		);
	}

	private static _projectRoot: string | undefined;

	public static get projectRoot(): string {
		if (this._projectRoot) {
			return this._projectRoot;
		}

		// I have never tested how long the resolve.path of app-root-path takes.
		// But let's cache it regardless since it never changes during the lifetime of the app.
		this._projectRoot = arp.path;

		return this._projectRoot;
	}
}
