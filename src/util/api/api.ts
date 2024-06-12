import { AppLoggerService } from '../../services/logger/app-logger.service.ts';
import { LibUtilitiesModule } from '../../lib-utilities.module.ts';
import { AppConstantsService } from '../../services/constants/app-constants.service.ts';
import express, { type Express, type Request, type Response } from "express";
import { NestFactory, AbstractHttpAdapter } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { type INestApplication } from '@nestjs/common';
import z from 'zod';
import { LoggerErrorInterceptor } from 'nestjs-pino';

const server = express();

// This casting is necessary because of the following error:
// Argument of type 'ExpressAdapter' is not assignable to parameter of type 'AbstractHttpAdapter<any, any, any>'.
const adapter = new ExpressAdapter(server) as unknown as AbstractHttpAdapter<
	Express,
	Request,
	Response
>;

export async function api(): Promise<INestApplication<Express>> {
	const app = await NestFactory.create(
		LibUtilitiesModule.register({
			config: {
				schema: z.object({
					TEST: z.string().default('bla'),
					HOMMA: z.coerce.number().default(123),
				}),
				useDotEnvDefaults: AppConstantsService.env.isDebug,
				useDotEnvEnvironment: AppConstantsService.env.isDebug,
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

	return app;
}

export async function startPORT() {
	const portString = process.env.PORT;

	if (portString === undefined) {
		throw new Error('process.env.PORT undefined');
	}

	const port = parseInt(portString);

	if (isNaN(port)) {
		throw new Error('process.env.PORT is not a number');
	}

	await start(port);
}

export async function start(port: number) {
	const app = await api();
	const l = app.get(AppLoggerService);
	l.info(`Starting API on port ${port}`);
	await app.listen(port);
}