import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from './app-config.service.ts';
import { AppConfigModule } from './app-config.module.ts';
import { z } from 'zod';
import { env } from 'bun';

describe('AppConfigService', () => {
	const appSchema = z.object({
		TEST: z.string().default('bla'),
		TEST_NUMBER: z.number().default(123),
		UNDEFINED: z.string().optional(),
		TEST_NULLABLE_NUMBER: z.number().optional(),
		MY_TEST_VALUE: z.string().optional(), // set by .env.test
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
				AppConfigService<AppSchemaType>,
			],
		}).compile();

		service = module.get<AppConfigService<AppSchemaType>>(AppConfigService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should be bla', () => {
		// FROM default value out provided zod schema (top of this code file).
		expect(service.get('TEST')).toBe('bla');
	});

	it('should be 123 because it was optional and defaulted to string "123" and then transformed to a number', () => {
		// FROM default value out provided zod schema (top of this code file).
		expect(service.get('TEST_NUMBER')).toBe(123);
	});

	it('should be undefined because is was optional', () => {
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

	it('should be 456', () => {
		// FROM .env.test
		expect(service.NODE_ENV).toBe('test');
	});
});
