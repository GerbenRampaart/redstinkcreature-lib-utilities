import { type DynamicModule, Module } from '@nestjs/common';
import { AppConfigService } from './app-config.service.ts';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
	UtilitiesSchema,
	type UtilitiesSchemaType,
} from './app-config.schema.ts';
import { glob } from 'glob';
import { path } from 'app-root-path';
import { join } from 'node:path';
import { type IAppConfigModuleOptions } from './app-config-module.options.ts';
import { AppLoggerModule } from '../logger/app-logger.module.ts';
import { AppLoggerService } from '../logger/app-logger.service.ts';
import { RawValueService } from '../static/raw-value.service.ts';

@Module({})
export class AppConfigModule {
	public static async registerAsync<TSchema>(
		options?: IAppConfigModuleOptions,
	): Promise<DynamicModule> {
		return {
			module: AppConfigModule,
			imports: [
				AppLoggerModule,
				ConfigModule.forRoot({
					validate: (env) => {
						console.log(env);
						if (options?.schema) {
							UtilitiesSchema.merge(options.schema);
						}
						//env = options?.schema?.parse(env) ?? env;

						//env = UtilitiesSchema.parse(env);
						console.log(env);
						return env;
					},
					isGlobal: true,
					validationOptions: {
						allowUnknown: true,
						abortEarly: false, // output all errors
					},
					envFilePath: `.env.${process.env.NODE_ENV}`,
					ignoreEnvFile: !RawValueService.nodeEnv.isDebug,
					cache: true,
				}),
			],
			providers: [
				{
					useFactory: async (
						l: AppLoggerService,
						c: ConfigService<TSchema & UtilitiesSchemaType, true>,
					): Promise<
						AppConfigService<
							TSchema & UtilitiesSchemaType
						>
					> => {
						const env = RawValueService.rawNodeEnv;
						const de = await glob(join(path, `.env.${env}`));

						if (!de) {
							throw new Error(`No .env file found for environment.`);
						}

						l.info(
							`Found .env file for environment ${env} at ${de}.`,
						);

						c.setEnvFilePaths(de);

						return new AppConfigService<
							TSchema & UtilitiesSchemaType
						>(c);
					},
					provide: AppConfigService,
					inject: [
						AppLoggerService,
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
