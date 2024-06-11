import { AppLoggerService } from './services/logger/app-logger.service.ts';
import { AppConstantsService } from './services/constants/app-constants.service.ts';
import { AppConfigService } from './services/config/app-config.service.ts';
import process from 'node:process';
import z from 'zod';
import { Controller, Get, Post, Body, HttpException } from '@nestjs/common';
import { hostname } from 'node:os';

const recordSchema = z.record(
	z.string(),
	z.string().optional(),
);

type recordSchemaType = z.infer<typeof recordSchema>;

@Controller('lib-utilities')
export class LibUtilitiesController {
	constructor(
		private readonly l: AppLoggerService,
		private readonly c: AppConfigService<Record<string, unknown>>,
	) {
	}

	@Get('info')
	async info() {
		return {
			product: await AppConstantsService.product(),
			paths: AppConstantsService.paths,
			host: hostname(),
			node: process.version,
			config: {
				envPath: this.c.dotEnvEnvironmentPath,
				schema: this.c.schema,
				settings: this.c.finalSettingsMap,
			},
		};
	}

	@Post('settings')
	async settings(
		@Body() body: recordSchemaType
	) {
		const result = await recordSchema.safeParseAsync(body);

		if (!result.success) {
			throw new HttpException(result.error.issues, 400);
		}

		this.c.initialize(body);

		return this.c.finalSettingsMap;
	}
}
