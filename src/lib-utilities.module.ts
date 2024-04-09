import { Module, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLoggerService } from './services/logger/app-logger.service.ts';
import { AppConfigModule } from './services/config/app-config.module.ts';
import { AppConfigService } from './services/config/app-config.service.ts';
import { AppPackageJsonService } from './services/package/package.service.ts';
import { type IAppConfigModuleOptions } from './services/config/app-config-module.options.ts';
import { PathsService } from './services/paths/paths.service.ts';

export type LibUtilitiesOptions = {
	config?: IAppConfigModuleOptions;
};

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
@Module({})
export class LibUtilitiesModule implements OnModuleInit {
	public static async registerAsync(
		options?: LibUtilitiesOptions,
	) {
		return {
			module: LibUtilitiesModule,
			imports: [
				AppConfigModule.registerAsync(options?.config),
			],
			providers: [
				ConfigService,
				AppConfigService,
				AppPackageJsonService,
				AppLoggerService,
				PathsService,
			],
			exports: [
				AppConfigService,
				AppLoggerService,
				AppPackageJsonService,
				PathsService,
			],
		};
	}
	constructor(
		private readonly l: AppLoggerService,
		private readonly pj: AppPackageJsonService,
	) {
	}

 	onModuleInit() {
		this.l.info(
			`Loaded package.json ${this.pj.product.pj.name}:${this.pj.product.pj.version}`,
		);
	}
}
