import { type DynamicModule, Module, type OnModuleInit } from '@nestjs/common';
import { AppConstantsService } from '../constants/app-constants.service.ts';
import { AppLoggerService } from '../logger/app-logger.service.ts';
import type {
	AppConfigModuleOptions,
	ProcessEnv,
} from './app-config-module.options.ts';
import { AppConfigService } from './app-config.service.ts';
import { glob } from 'glob';
import { AppLoggerModule } from '../logger/app-logger.module.ts';

@Module({})
export class AppConfigModule implements OnModuleInit {
	constructor(
		private readonly l: AppLoggerService,
		private readonly cfg: AppConfigService<ProcessEnv>,
	) {
	}

	onModuleInit() {
		if(this.cfg.dotEnvDefaultsPath) {
			this.l.info(`Using dotenv: ${this.cfg.dotEnvDefaultsPath}`);
		}

		if(this.cfg.dotEnvEnvironmentPath) {
			this.l.info(`Using dotenv: ${this.cfg.dotEnvEnvironmentPath}`);
		}
	}

	public static async registerAsync<TSchema extends ProcessEnv>(
		options?: AppConfigModuleOptions,
	): Promise<DynamicModule> {

		let dotEnvEnvironmentPath: string | null = null;
		if (options?.useDotEnvEnvironment) {
			dotEnvEnvironmentPath = await this.findDotEnvPathByName(`.env.${AppConstantsService.rawNodeEnv}`);
		}

		let dotEnvDefaultsPath: string | null = null;
		if (options?.useDotEnvDefaults) {
			dotEnvDefaultsPath = await this.findDotEnvPathByName(`.env.defaults`);
		}

		return {
			module: AppConfigModule,
			imports: [
				AppLoggerModule
			],
			providers: [
				{
					provide: 'DOTENV_ENVIRONMENT_PATH',
					useValue: dotEnvEnvironmentPath
				}, {
					provide: 'DOTENV_DEFAULTS_PATH',
					useValue: dotEnvDefaultsPath
				}, {
					provide: 'ZOD_SCHEMA',
					useValue: options?.schema,
				},
				AppLoggerService,
				AppConfigService<TSchema>
			],
			exports: [
				AppConfigService<TSchema>,
			],
		};
	}

	private static async findDotEnvPathByName(ef: string): Promise<string> {
		const de = await glob(`**/${ef}`, {
			ignore: 'node_modules/**',
			cwd: Deno.cwd(),
		});

		if (de.length === 0) {
			throw new Error(`No ${ef} file found.`);
		}

		// if multiple are found also throw an error. (in any mode)
		if (de.length > 1) {
			throw new Error(`Multiple ${ef} found in ${de.join()}.`);
		}

		return de[0];
	}
}
