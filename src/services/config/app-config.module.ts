import { type DynamicModule, Module } from '@nestjs/common';
import { AppConfigService } from './app-config.service.ts';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { glob } from 'glob';
import { path as arp } from 'app-root-path';
import { type IAppConfigModuleOptions } from './app-config-module.options.ts';
import { AppLoggerModule } from '../logger/app-logger.module.ts';
import { AppLoggerService } from '../logger/app-logger.service.ts';
import { join } from 'path';
import { NODE_ENV } from '../constants/NODE_ENV.ts';
import { AppConstantsService } from '../constants/app-constants.service.ts';

@Module({})
export class AppConfigModule {
  public static async registerAsync<TSchema>(
    options?: IAppConfigModuleOptions,
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
      imports: [
        AppLoggerModule,
        ConfigModule.forRoot({
          validate: (env) => {
            if (options?.schema) {
              return options.schema.parse(env);
            }

            return env;
          },
          isGlobal: true,
          validationOptions: {
            allowUnknown: true,
            abortEarly: false, // output all errors
          },
          envFilePath: fullDotEnvPath,
          ignoreEnvFile: !AppConstantsService.nodeEnv.isDebug,
          cache: true,
        }),
      ],
      providers: [
        {
          useFactory: async (
            l: AppLoggerService,
            c: ConfigService<TSchema, true>,
          ): Promise<
            AppConfigService<
              TSchema
            >
          > => {
            if (fullDotEnvPath) {
              l.info(
                `Found ${ef} at ${fullDotEnvPath}`,
              );
            } else {

            }

            c.setEnvFilePaths(de);

            return new AppConfigService<
              TSchema
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
