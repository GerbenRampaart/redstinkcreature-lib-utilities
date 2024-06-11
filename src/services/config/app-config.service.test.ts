import { AppConfigService } from './app-config.service.ts';
import { AppConfigModule } from './app-config.module.ts';
import { test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import { AppConstantsService } from '../constants/app-constants.service.ts';
import { ENV_NAME } from '../constants/ENV.ts';
import z from 'zod';
import { Test, TestingModule } from '@nestjs/testing';
import { glob } from 'glob';
import { join } from 'node:path';

test('AppConfigModule', async () => {
	const appSchema = z.object({
		TEST: z.string().default('bla'),
		TEST_NUMBER: z.coerce.number().default(123),
		UNDEFINED: z.string().optional(),
		TEST_NULLABLE_NUMBER: z.number().optional(),
		MY_TEST_VALUE: z.string().optional(), // set by .env.test
	});

	type AppSchemaType = z.infer<typeof appSchema>;

	let service: AppConfigService<AppSchemaType>;
	let module: TestingModule;

	beforeEach(async () => {
		process.env[ENV_NAME] = 'test';

		module = await Test.createTestingModule({
			imports: [
				AppConfigModule.registerAsync<AppSchemaType>({
					schema: appSchema,
					useDotEnvEnvironment: AppConstantsService.env.isTest,
					useDotEnvDefaults: AppConstantsService.env.isTest,
				}),
			],
		}).compile();

		// Without init(), no lifecycle events are fired, like onModuleInit.
		await module.init();

		service = module.get(AppConfigService<AppSchemaType>);
	});

	afterEach(async () => {
		await module.close();
	});

	test('Check if service is defined', () => {
		expect(service).toBeDefined();
	});

	test('Should be bla', () => {
		// FROM default value out provided zod schema (top of this code file).
		expect(service.get('TEST')).toBe('bla');
	});

	test(
		'should be 123 because it was optional and defaulted to string "123" and then transformed to a number',
		() => {
			// FROM default value out provided zod schema (top of this code file).
			expect(service.get('TEST_NUMBER')).toBe(123);
		},
	);

	test('should be undefined because is was optional', () => {
		// FROM default value out provided zod schema (top of this code file).
		expect(service.get('TEST_NULLABLE_NUMBER')).toBeUndefined();
	});

	test('should be undefined', () => {
		// FROM default value out provided zod schema (top of this code file).
		expect(service.get('UNDEFINED')).toBeUndefined();
	});

	test('should be debug', () => {
		// FROM .env.test
		expect(service.LOG_LEVEL).toBe('debug');
	});

	test('should throw exception', () => {
		// FROM .env.test
		expect(() => service.getOrThrow('UNDEFINED')).toThrow();
	});

	test('should be info', () => {
		// FROM .env.test
		expect(service.ENV).toBe('test');
	});

	test('Can find .env.test', async () => {
		const dotEnvPath = join(
			AppConstantsService.projectRoot,
			'**',
			'.env.test',
		);

		const files = await glob(dotEnvPath);

		expect(files.length).toBe(1);
	});
});
