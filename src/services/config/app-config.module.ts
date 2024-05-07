import { type DynamicModule, Module, type OnModuleInit } from '@nestjs/common';
import { AppConstantsService } from '../constants/app-constants.service.ts';
import { AppLoggerService } from '../logger/app-logger.service.ts';
import type {
	AppConfigModuleOptions,
	ProcessEnv,
} from './app-config-module.options.ts';
import { AppConfigService } from './app-config.service.ts';
import { glob } from 'glob';
import { path as arp } from 'app-root-path';
import { join } from 'node:path';
import { AppLoggerModule } from '../logger/app-logger.module.ts';
import { env } from 'node:process';

@Module({
	imports: [
		AppLoggerModule,
	]
})
export class AppConfigModule {// implements OnModuleInit {
	constructor(
		private readonly l: AppLoggerService,
		private readonly cfg: AppConfigService<ProcessEnv>,
	) {
	}

/* 	async onModuleInit() {
		if (this.cfg.fullDotEnvPath) {
			this.l.info(
				`Found .env.${AppConstantsService.rawNodeEnv} at ${this.cfg.fullDotEnvPath}`,
			);
		} else {
			this.l.info(
				`No dotenv loaded because env was ${AppConstantsService.rawNodeEnv}`,
			);
		}
	} */

	public static async registerAsync<TSchema extends ProcessEnv>(
		options?: AppConfigModuleOptions,
	): Promise<DynamicModule> {
		const ef = `.env.${AppConstantsService.rawNodeEnv}`;
		const de = await glob(`**/${ef}`, {
			ignore: 'node_modules/**',
			cwd: arp,
		});

		// If no .env is found AND we're not running in debug mode, throw error.
		if (de.length === 0 && !AppConstantsService.nodeEnv.isDebug) {
			throw new Error(`No ${ef} file found.`);
		}

		// if multiple are found also throw an error. (in any mode)
		if (de.length > 1) {
			throw new Error(`Multiple ${ef} found in ${de.join()}.`);
		}

		let fullDotEnvPath: string | undefined = undefined;

		if (de.length === 1 && AppConstantsService.nodeEnv.isDebug) {
			fullDotEnvPath = join(arp, de[0]);
		}

		return {
			module: AppConfigModule,
			providers: [
				{
					provide: AppConfigService<TSchema>,
					inject: [
						{
							name: 'PROCESS_ENV',
							provide: () => {
								return env;
							},
						},
					]
				}
				,
			],

			exports: [
				AppConfigService<TSchema>,
			]
		};
	}
}
