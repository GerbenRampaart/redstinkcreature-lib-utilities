import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from './app-config.service.ts';
import { AppConfigModule } from './app-config.module.ts';
import { z } from 'zod';

describe('AppConfigService', () => {
	const appSchema = z.object({
		TEST: z.string().optional().default('bla'),
		TEST_NUMBER: z.number().optional().default(123),
		UNDEFINED: z.number(),
		TEST_NULLABLE_NUMBER: z.number().optional(),
	});

	type AppSchemaType = z.infer<typeof appSchema>;
	let service: AppConfigService<AppSchemaType>;

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

		service = module.get(AppConfigService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should be bla', () => {
		// FROM default value out provided zod schema (top of this code file).
		expect(service.get('TEST')).toBe('bla');
	});

	it('should be 123', () => {
		// FROM default value out provided zod schema (top of this code file).
		expect(service.get('TEST_NUMBER')).toBe(123);
	});

	it('should be 123', () => {
		// FROM default value out provided zod schema (top of this code file).
		expect(service.get('TEST_NULLABLE_NUMBER')).toBe(undefined);
	});

	it('should be undefined', () => {
		// FROM default value out provided zod schema (top of this code file).
		expect(service.get('UNDEFINED')).toBe(undefined);
	});

	it('should be debug', () => {
		// FROM .env.test
		expect(service.LOG_LEVEL).toBe('debug');
	});

	it('should throw exception', () => {
		// FROM .env.test
		expect(() => service.getOrThrow('UNDEFINED')).toThrow();
	});

	it('should be info', () => {
		// FROM .env.test
		expect(service.NODE_ENV).toBe('test');
	});
});
