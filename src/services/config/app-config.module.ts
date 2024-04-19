import { type DynamicModule, Module, type OnModuleInit } from '@nestjs/common';
import { AppConfigService } from './app-config.service.ts';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { glob } from 'glob';
import { path as arp } from 'app-root-path';
import {
	type AppConfigModuleOptions,
	type ProcessEnv,
} from './app-config-module.options.ts';
import { AppLoggerModule } from '../logger/app-logger.module.ts';
import { AppLoggerService } from '../logger/app-logger.service.ts';
import { join } from 'path';
import { AppConstantsService } from '../constants/app-constants.service.ts';

@Module({
	imports: [
		AppLoggerModule,
	],
})
export class AppConfigModule implements OnModuleInit {
	constructor(
		private readonly l: AppLoggerService,
		private readonly cfg: AppConfigService<ProcessEnv>,
	) {
	}

	onModuleInit() {
		if (this.cfg.fullDotEnvPath) {
			this.l.info(
				`Found .env.${AppConstantsService.rawNodeEnv} at ${this.cfg.fullDotEnvPath}`,
			);
		} else {
			this.l.info(
				`No dotenv loaded because env was ${AppConstantsService.rawNodeEnv}`,
			);
		}
	}

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

		let before: Record<string, unknown> = {};
		let after: Record<string, unknown> = {};
		let error: Zod.ZodError<{ [x: string]: any; }> | undefined = undefined;

		return {
			module: AppConfigModule,
			imports: [
				AppLoggerModule,
				ConfigModule.forRoot({
					load: [
						() => {
							before = process.env;
							after = before;

							if (options?.schema) {
								const result = options.schema.safeParse(before);

								if (result.success) {
									after = result.data;
								} else {
									error = result.error
								}
							}
							console.log(after)
							return after;
						}
					],
					isGlobal: true,
					envFilePath: fullDotEnvPath,
					ignoreEnvFile: !AppConstantsService.nodeEnv.isDebug,
					cache: true,
				}),
			],
			providers: [
				{
					useFactory: (
						c: ConfigService<TSchema, true>,
					): AppConfigService<
						TSchema
					> => {
						return new AppConfigService<
							TSchema
						>(
							c,
							before,
							after,
							fullDotEnvPath,
							options?.schema,
							error
						);
					},
					provide: AppConfigService,
					inject: [
						ConfigService,
					],
				},
			],
			exports: [
				AppConfigService,
			],
		};
	}
}
