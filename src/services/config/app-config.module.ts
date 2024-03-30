import { Module, type DynamicModule } from "@nestjs/common";
import { AppConfigService } from "./app-config.service.js";
import { NodeEnv } from "../../util/NodeEnv.js";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { z } from "zod";
import { UtilitiesSchema, type UtilitiesSchemaType } from "./app-config.schema.js";

export type ProcessEnvType = z.ZodObject<{ [key in string]: any}>;

@Module({})
export class AppConfigModule {
  public static async registerAsync<TSchema>(
    processEnv?: ProcessEnvType
  ): Promise<DynamicModule> {
    
    return {
      module: AppConfigModule,
      imports: [
        ConfigModule.forRoot({
          validate: (env) => {
            console.log(env)
            env = processEnv?.parse(env) ?? env;
            console.log(env)
            return UtilitiesSchema.parse(env);
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
          useFactory: (c: ConfigService<TSchema & UtilitiesSchemaType, true>) => {
            return new AppConfigService<TSchema & UtilitiesSchemaType>(c)
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