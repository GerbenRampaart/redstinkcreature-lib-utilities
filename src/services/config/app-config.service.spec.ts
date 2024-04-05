import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from './app-config.service.ts';
import { AppConfigModule } from './app-config.module.ts';
import { z } from 'zod';
import type { UtilitiesSchemaType } from './app-config.schema.ts';

describe('AppConfigService', () => {
	const appSchema = z.object({
		TEST: z.string().optional().default('bla'),
	});

	type AppSchemaType = z.infer<typeof appSchema>;
	let service: AppConfigService<AppSchemaType & UtilitiesSchemaType>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				AppConfigModule.registerAsync<AppSchemaType>({
					schema: appSchema,
				}),
			],
			providers: [
				AppConfigService,
			],
		}).compile();

		service = await module.resolve(AppConfigService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should be bla', () => {
		// FROM default value out provided zod schema (top of this code file).
		expect(service.get('TEST')).toBe('bla');
	});

	it('should be info', () => {
		// FROM .env.test
		expect(service.get('LOG_LEVEL')).toBe('debug');
	});

	it('should be info', () => {
		// FROM .env.test
		expect(service.get('NODE_ENV')).toBe('test');
	});
});
