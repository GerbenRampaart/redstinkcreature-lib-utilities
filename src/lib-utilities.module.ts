import {
	DynamicModule,
	Module,
	OnApplicationBootstrap,
	OnApplicationShutdown,
	type OnModuleInit,
} from '@nestjs/common';
import { AppLoggerService } from './services/logger/app-logger.service.ts';
import { AppConfigService } from './services/config/app-config.service.ts';
import { type AppConfigModuleOptions } from './services/config/app-config-module.options.ts';
import { AppConfigModule } from './services/config/app-config.module.ts';
import { TestController } from './test.controller.ts';
import { AppLoggerModule } from './services/logger/app-logger.module.ts';
import { AppConstantsService } from './services/constants/app-constants.service.ts';
import { AppHttpModule } from './services/http/app-http.module.ts';

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
	],
})
export class LibUtilitiesModule
	implements OnModuleInit, OnApplicationBootstrap, OnApplicationShutdown {
	public static register(
		options?: LibUtilitiesOptions,
	): DynamicModule {
		return {
			module: LibUtilitiesModule,
			imports: [
				AppConfigModule.registerAsync(options?.config),
				AppLoggerModule,
				AppHttpModule,
			],
			providers: [
				AppConfigService,
				AppLoggerService,
			],
			exports: [
				AppConfigModule,
				AppLoggerModule,
				AppHttpModule,
			],
			controllers: [
				TestController,
			],
		};
	}

	constructor(
		private readonly l: AppLoggerService,
	) {
	}

	onApplicationShutdown(signal?: string | undefined) {
		this.l.info(`APPLICATION SHUTDOWN (signal ${signal})`);
	}

	onApplicationBootstrap() {
		this.l.info(`APPLICATION BOOTSTRAP`);
	}

	async onModuleInit() {
		const p = await AppConstantsService.product();
		this.l.info(
			`Loaded app: ${p.name}:${p.version}`,
		);

		AppConstantsService.paths.forEach((v) => {
			this.l.info(`${v.n}: ${v.p}`);
		});
	}
}
