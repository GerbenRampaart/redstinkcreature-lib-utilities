import { AppConstantsService } from '../constants/app-constants.service.ts';
import {
	type ProcessEnv,
	type ProcessEnvZod,
} from './app-config-module.options.ts';
import { AppLoggerService } from '../logger/app-logger.service.ts';
import { Injectable, Inject } from '@nestjs/common';
import { config } from 'dotenv';

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
	 * - Take the current content of process.env;
	 * - Apply the dotenvs (if required) as configured in the AppConfigModule.registerAsync.
	 * - Apply the schema (if provided) as configured in the AppConfigModule.registerAsync.
	 */
	public initialize(settings: Record<string, string | undefined> = process.env) {
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
		if (this.dotEnvEnvironmentPath) {
		const result = config({
			debug: AppConstantsService.env.isDebug,
			override: true,
			path: this.dotEnvEnvironmentPath,
		});

		this._changesMadeByDotEnv = result.parsed ?? {};
	}

	
	}

	/**
	 * By default, both the dotenv and zodschema are applied in-memory to the settings and
	 * end up in finalSettings but the process.env is untouched. This function applies the
	 * finalsettings to the process.env.
	 */
	public copyFinalSettingsToEnv() {
		for (const obj of this.finalSettingsMap) {
			if (
				obj.value === undefined ||
				obj.value === null
			) {
				delete process.env[obj.name];
			} else {
				process.env[obj.name] = String(obj.value);
			}
		}
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

	public get ENV(): string {
		return AppConstantsService.rawEnv();
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
