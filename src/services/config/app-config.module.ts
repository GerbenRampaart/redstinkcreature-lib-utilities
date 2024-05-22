import {
	type DynamicModule,
	Module,
	type OnModuleInit,
	Provider,
} from '@nestjs/common';
import { AppConstantsService } from '../constants/app-constants.service.ts';
import { AppLoggerService } from '../logger/app-logger.service.ts';
import type {
	AppConfigModuleOptions,
	ProcessEnv,
} from './app-config-module.options.ts';
import { AppConfigService } from './app-config.service.ts';
import { AppLoggerModule } from '../logger/app-logger.module.ts';
import { join } from 'std/path';
import { expandGlob } from 'std/fs';

@Module({})
export class AppConfigModule implements OnModuleInit {
	constructor(
		private readonly l: AppLoggerService,
		private readonly cfg: AppConfigService<ProcessEnv>,
	) {
	}

	onModuleInit() {
		if (this.cfg.dotEnvDefaultsPath) {
			this.l.info(`DOTENV file included: ${this.cfg.dotEnvDefaultsPath}`);
		}

		if (this.cfg.dotEnvEnvironmentPath) {
			this.l.info(
				`DOTENV file included: ${this.cfg.dotEnvEnvironmentPath}`,
			);
		}

		if (this.cfg.changesMadeBySchema.length > 0) {
			const sc = this.cfg.changesMadeBySchema.map<string>((c) =>
				`${c.name}: ${c.value}`
			);
			this.l.info(`ZOD SCHEMA changes: ${sc.join(', ')}`);
		}

		if (this.cfg.changesMadeByDotEnv.length > 0) {
			const sc = this.cfg.changesMadeByDotEnv.map<string>((c) =>
				`${c.name}: ${c.value}`
			);
			this.l.info(`DOTENV changes: ${sc.join(', ')}`);
		}
	}

	public static async registerAsync<TSchema extends ProcessEnv>(
		options?: AppConfigModuleOptions,
	): Promise<DynamicModule> {
		let dotEnvEnvironmentPath: string | null = null;
		if (options?.useDotEnvEnvironment) {
			dotEnvEnvironmentPath = await this.findDotEnvPathByName(
				`.env.${AppConstantsService.rawDenoEnv()}`,
			);
		}

		let dotEnvDefaultsPath: string | null = null;
		if (options?.useDotEnvDefaults) {
			dotEnvDefaultsPath = await this.findDotEnvPathByName(
				`.env.defaults`,
			);
		}

		const providers: Provider[] = [
			{
				provide: 'DOTENV_ENVIRONMENT_PATH',
				useValue: dotEnvEnvironmentPath,
			},
			{
				provide: 'DOTENV_DEFAULTS_PATH',
				useValue: dotEnvDefaultsPath,
			},
			{
				provide: 'ZOD_SCHEMA',
				useValue: options?.schema,
			},
		];

		return {
			module: AppConfigModule,
			imports: [
				AppLoggerModule,
			],
			providers: [
				...providers,
				AppLoggerService,
				AppConfigService<TSchema>,
			],
			exports: [
				...providers,
				AppConfigService<TSchema>,
			],
		};
	}

	private static async findDotEnvPathByName(ef: string): Promise<string> {
		const dotEnvPath = join(Deno.cwd(), '**' , ef);
		const filesPromise = expandGlob(dotEnvPath);
		const files = await Array.fromAsync(filesPromise);

		if (files.length !== 1) {
			throw new Error(
				`${ef} was found ${files.length} times. Must be 1. (glob used: ${dotEnvPath}})`,
			);
		}

		return files[0].path;
	}
}
