import { type DynamicModule, Module } from '@nestjs/common';
import { AppConfigService } from './app-config.service.ts';
import { NODE_ENV, NodeEnv } from '../../util/NODE_ENV.ts';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  UtilitiesSchema,
  type UtilitiesSchemaType,
} from './app-config.schema.ts';
import { glob } from 'glob';
import { path } from 'app-root-path';
import { join } from 'path';
import {
  type IAppConfigModuleOptions,
} from './app-config-module.options.ts';
import { AppLoggerModule } from '../logger/app-logger.module.ts';
import { AppLoggerService } from '../logger/app-logger.service.ts';

@Module({})
export class AppConfigModule {
  public static async registerAsync<TSchema>(
    options: IAppConfigModuleOptions,
  ): Promise<DynamicModule> {
    return {
      module: AppConfigModule,
      imports: [
        AppLoggerModule,
        ConfigModule.forRoot({
          validate: (env) => {
            env = options.schema?.parse(env) ?? env;
            console.log(env);
            env = UtilitiesSchema.parse(env);
            console.log(env);
            return env;
          },
          isGlobal: true,
          validationOptions: {
            allowUnknown: true,
            abortEarly: false, // output all errors
          },
          envFilePath: `.env.${process.env.NODE_ENV}`,
          ignoreEnvFile: !NodeEnv.isDebug,
          cache: true,
        }),
      ],
      providers: [
        {
          useFactory: async (
            l: AppLoggerService,
            c: ConfigService<TSchema & UtilitiesSchemaType, true>,
          ): Promise<AppConfigService<
            TSchema & UtilitiesSchemaType
          >> => {
            const env = NODE_ENV();
            const de = await glob(join(path, `.env.${env}`));

            l.info(`Found .env file for environment ${env} at ${de}.`);

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
