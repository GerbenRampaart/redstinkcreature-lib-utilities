import { Inject, Injectable } from '@nestjs/common';
import { AppConstantsService } from '../constants/app-constants.service.ts';
import {
	type ProcessEnv,
	type ProcessEnvZod,
} from './app-config-module.options.ts';
import { loadSync } from 'std/dotenv';
import { AppLoggerService } from '../logger/app-logger.service.ts';

export type RawSetting = {
	name: string;
	value: unknown | undefined;
};

@Injectable()
export class AppConfigService<TSchema extends ProcessEnv> {
	constructor(
		private readonly l: AppLoggerService,
		@Inject(
			'DOTENV_ENVIRONMENT_PATH',
		) public readonly dotEnvEnvironmentPath: string | null,
		@Inject('DOTENV_DEFAULTS_PATH') public readonly dotEnvDefaultsPath:
			| string
			| null,
		@Inject('ZOD_SCHEMA') public readonly schema?: ProcessEnvZod,
	) {
		this.initialize();
	}

	private map = (r: Record<string, unknown>): RawSetting[] =>
		Object.keys(r).map((key) => {
			return {
				name: key,
				value: r[key],
			};
		});

	private _originalSettings: Record<string, unknown> = {};
	private _changesMadeByDotEnv: Record<string, unknown> = {};
	private _changesMadeBySchema: Record<string, unknown> = {};
	private _finalSettings: Record<string, unknown> = {};
	private _finalSettingsMap: RawSetting[] = [];

	public get changesMadeByDotEnv(): RawSetting[] {
		return this.map(this._changesMadeByDotEnv);
	}

	public get originalSettings(): RawSetting[] {
		return this.map(this._originalSettings);
	}

	public get changesMadeBySchema(): RawSetting[] {
		return this.map(this._changesMadeBySchema);
	}

	public get finalSettingsMap(): RawSetting[] {
		return this._finalSettingsMap;
	}

	/**
	 * You don't need to call initialize() if you are using the default behaviour since
	 * this function is also called in the constructor.
	 *
	 * Calling initialize() again however somwhere in code will:
	 * - Take the current content of Deno.env;
	 * - Apply the dotenvs (if required) as configured in the AppConfigModule.registerAsync.
	 * - Apply the schema (if provided) as configured in the AppConfigModule.registerAsync.
	 */
	public initialize(settings: Record<string, string> = Deno.env.toObject()) {
		this._originalSettings = settings;

		this.loadDotEnvs();
		this._finalSettings = this.move(
			this._originalSettings,
			this._changesMadeByDotEnv,
		);

		if (this.schema) {
			const result = this.schema.safeParse(this._finalSettings);

			if (!result.success) {
				throw new Error(result.error.message);
			} else {
				this._changesMadeBySchema = result.data;
				this._finalSettings = this.move(
					this._finalSettings,
					this._changesMadeBySchema,
				);
			}
		}

		this._finalSettingsMap = this.map(this._finalSettings);
	}

	private move(
		originalValues: Record<string, unknown>,
		newValues: Record<string, unknown>,
	): Record<string, unknown> {
		const result: Record<string, unknown> = {
			...newValues,
		};

		for (const ov of Object.keys(originalValues)) {
			const ds = newValues[ov];

			// If not found in the newValues, we must use the old value.
			if (!ds) {
				result[ov] = originalValues[ov];
			}
		}

		return result;
	}

	private loadDotEnvs() {
		const result = loadSync({
			envPath: this.dotEnvEnvironmentPath,
			export: true,
			allowEmptyValues: true,
			defaultsPath: this.dotEnvDefaultsPath,
			examplePath: null,
		});

		this._changesMadeByDotEnv = result;
	}

	get<T extends keyof TSchema>(key: T): TSchema[T] | undefined {
		const result = this._finalSettingsMap.find((p) => p.name === key);
		return result?.value as TSchema[T];
	}

	getOrThrow<T extends keyof TSchema>(key: T): TSchema[T] {
		const result = this._finalSettingsMap.find((p) => p.name === key);

		if (!result || result.value === undefined) {
			throw new Error(
				`key ${String(key)} not found or value was undefined`,
			);
		}

		return result.value as TSchema[T];
	}

	public get DENO_ENV(): string {
		return AppConstantsService.rawDenoEnv();
	}

	public get LOG_LEVEL(): string {
		return AppConstantsService.rawLogLevel();
	}

	public get schemaKeys(): string[] {
		if (this.schema) {
			return Object.keys(this.schema.shape);
		}

		return [];
	}
}
