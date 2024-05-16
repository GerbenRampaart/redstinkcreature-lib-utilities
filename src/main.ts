// deno-lint-ignore-file no-explicit-any
import { AbstractHttpAdapter, NestFactory } from '@nestjs/core';
import { LoggerErrorInterceptor } from 'nestjs-pino';
import { AppLoggerService } from './services/logger/app-logger.service.ts';
import { LibUtilitiesModule } from './lib-utilities.module.ts';

import './deno-lifecycle.ts';
import { ExpressAdapter } from '@nestjs/platform-express';

// @deno-types=npm:@types/express@4
import express from 'express';
import z from 'zod';
import { AppConstantsService } from './index.ts';

const server = express();

// This casting is necessary because of the following error:
// Argument of type 'ExpressAdapter' is not assignable to parameter of type 'AbstractHttpAdapter<any, any, any>'.
const adapter = new ExpressAdapter(server) as unknown as AbstractHttpAdapter<
	any,
	any,
	any
>;

async function bootstrap() {
	const app = await NestFactory.create(
		LibUtilitiesModule.register({
			config: {
				schema: z.object({
					TEST: z.string().default('bla'),
					HOMMA: z.coerce.number().default(123),
				}),
				useDotEnvDefaults: AppConstantsService.denoEnv.isDebug,
				useDotEnvEnvironment: AppConstantsService.denoEnv.isDebug,
			},
		}),
		adapter,
		{
			abortOnError: true,
			bufferLogs: true,
		},
	);

	const l = app.get(AppLoggerService);
	app.useLogger(l);
	app.useGlobalInterceptors(new LoggerErrorInterceptor());

	await app.listen(3000);
}

await bootstrap();
