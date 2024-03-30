import { Module, type DynamicModule } from "@nestjs/common";
import { AppConfigService } from "./app-config.service.js";
import { NodeEnv } from "../../util/NodeEnv.js";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { z } from "zod";

export type ProcessEnvSchema<TSchema extends z.ZodRawShape> = z.ZodObject<TSchema>;

@Module({})
export class AppConfigModule {
  public static async registerAsync<TSchema extends z.ZodRawShape = {}>(processEnv?: ProcessEnvSchema<TSchema>): Promise<DynamicModule> {
    //type targetType = z.infer<typeof processEnv>;
    return {
      module: AppConfigModule,
      imports: [
        ConfigModule.forRoot({
          validate: (env) => {
            return processEnv?.parse(env) ?? env;
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
          useFactory: (c: ConfigService<TSchema, true>) => {
            return new AppConfigService(c)
          },
          provide: AppConfigService,
          inject: [
            ConfigService
          ]
        }
        
      ],
      exports: [
        AppConfigService
      ]
    }

  }
}