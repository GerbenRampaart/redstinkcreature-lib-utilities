import '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { LoggerErrorInterceptor } from 'nestjs-pino';
import { AppLoggerService } from './services/logger/app-logger.service.ts';
import { LibUtilitiesModule } from './lib-utilities.module.ts';

import './deno-lifecycle.ts';
import { ExpressAdapter } from '@nestjs/platform-express';

// @deno-types=npm:@types/express@4
import express from 'express';

const server = express();

async function bootstrap() {
	const app = await NestFactory.create(LibUtilitiesModule.register({
		config: {
			useDotEnvDefaults: true,
			useDotEnvEnvironment: true,
		}
	}),
	new ExpressAdapter(server),
	{
		abortOnError: true,
		bufferLogs: true,
	});

	const l = app.get(AppLoggerService);
	app.useLogger(l);
	app.useGlobalInterceptors(new LoggerErrorInterceptor());

	await app.listen(3000);
}

await bootstrap();
