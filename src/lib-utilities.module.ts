import {
	Module,
	OnApplicationBootstrap,
	OnApplicationShutdown,
	type OnModuleInit,
} from '@nestjs/common';
import { AppLoggerService } from './services/logger/app-logger.service.ts';
import { AppConfigService } from './services/config/app-config.service.ts';
import { PackageService } from './services/package/package.service.ts';
import { type AppConfigModuleOptions } from './services/config/app-config-module.options.ts';
import { PathsService } from './services/paths/paths.service.ts';
import { AppConfigModule } from './services/config/app-config.module.ts';
import { TestController } from './test.controller.ts';
import { AppLoggerModule } from './services/logger/app-logger.module.ts';
import { PackageModule } from './services/package/index.ts';

export type LibUtilitiesOptions = {
	config?: AppConfigModuleOptions;
};

/**
 * The AppUtilitiesModule is a ground-up module, which provides some fundamental
 * services which we have to be careful about depending on each other. Once loaded,
 * the SharedModule, or any module, can depend on the AppUtilitiesModule.
 *
 * The AppPackageService provides information about the app in the form of deno.json
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
	imports: [
		AppLoggerModule,
		PackageModule,
	],
})
export class LibUtilitiesModule
	implements OnModuleInit, OnApplicationBootstrap, OnApplicationShutdown {
	public static register(
		options?: LibUtilitiesOptions,
	) {
		return {
			module: LibUtilitiesModule,
			imports: [
				AppConfigModule.registerAsync(options?.config),
				AppLoggerModule,
				PackageModule,
			],
			providers: [
				PackageService,
				AppConfigService,
				AppLoggerService,
				PathsService,
			],
			exports: [
				PackageService,
				AppConfigService,
				AppLoggerService,
				PathsService,
			],
			controllers: [
				TestController,
			],
		};
	}

	constructor(
		private readonly l: AppLoggerService,
		private readonly pj: PackageService,
		private readonly p: PathsService,
	) {
	}

	onApplicationShutdown(signal?: string | undefined) {
		this.l.info(`APPLICATION SHUTDOWN (signal ${signal})`);
	}

	onApplicationBootstrap() {
		this.l.info(`APPLICATION BOOTSTRAP`);
	}

	onModuleInit() {
		this.l.info(
			`Loaded app: ${this.pj.product.pj.name}:${this.pj.product.pj.version}`,
		);

		this.p.logPaths(this.l);
	}
}
