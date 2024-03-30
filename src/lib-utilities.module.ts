import { Module, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppLoggerService } from "./services/logger/app-logger.service.js";
import { AppPackageJsonService } from "./services/package/packageJson.service.js";
import { PathsService } from "./services/paths/paths.service.js";
import { AppConfigModule } from "./services/config/app-config.module.js";
import { AppConfigService } from "./services/config/app-config.service.js";
import { z } from 'zod';

export type LibUtilitiesOptions<TSchema extends z.ZodRawShape> = {
  schema?: z.ZodObject<TSchema>
}

/**
 * The AppUtilitiesModule is a ground-up module, which provides some fundamental
 * services which we have to be careful about depending on each other. Once loaded,
 * the SharedModule, or any module, can depend on the AppUtilitiesModule.
 *
 * The AppPackageService provides information about the app in the form of package.json
 * information and other pathing data. It depends on nothing.
 *
 * The ConfigModule and sebsequent more opinionated SharedConfigModule provides generic
 * settings data, based on environment variables (either from .env or otherwise injected).
 *
 * The AppLoggerModule is the only way of logging (only to stdout) for the entire app.
 * It depends on AppPackageJsonService and AppConfigService, the module waits for
 * those services to be available using ModuleRef().
 */
@Module({
})
export class LibUtilitiesModule implements OnModuleInit {
  public static async registerAsync<TSchema extends z.ZodRawShape = {}>(options?: LibUtilitiesOptions<TSchema>) {
    return {
      module: LibUtilitiesModule,
      imports: [
        AppConfigModule.registerAsync(options?.schema)
      ],
      providers: [
        ConfigService,
        AppConfigService,
        AppPackageJsonService,
        AppLoggerService,
        PathsService,
      ],
      exports: [
        ConfigService,
        AppConfigService,
        AppLoggerService,
        AppPackageJsonService,
        PathsService,
      ],
    }

  }
  constructor(
    private readonly l: AppLoggerService,
    private readonly pj: AppPackageJsonService,
  ) {
  }

  async onModuleInit() {
    this.l.info(
      `Loaded package.json ${this.pj.product.pj.name}:${this.pj.product.pj.version}`,
    );
  }
}
