import { NestFactory } from '@nestjs/core';
import { LibUtilitiesModule } from '../lib-utilities.module.ts';
import { type INestApplicationContext } from '@nestjs/common';
import { AppLoggerService } from '../services/logger/app-logger.service.ts';
import { AppConfigService } from '../services/config/app-config.service.ts';

/**
 * https://docs.nestjs.com/standalone-applications
 */
export class Factory {
	private constructor(
		private readonly app: INestApplicationContext,
	) {
	}

	public static async instance(
		module = LibUtilitiesModule,
	): Promise<Factory> {
		const app = await NestFactory.createApplicationContext(module, {
			logger: false,
		});

		return new Factory(app);
	}

	public async close() {
		await this.app.close();
	}

	public get logger(): AppLoggerService {
		return this.app.get(AppLoggerService);
	}

	public config<TSchema extends Record<string, unknown>>(): AppConfigService<
		TSchema
	> {
		return this.app.get(AppConfigService<TSchema>);
	}
}
