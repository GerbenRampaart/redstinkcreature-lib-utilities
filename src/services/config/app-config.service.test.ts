import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from './app-config.service.ts';
import { AppConfigModule } from './app-config.module.ts';
import z from 'zod';
import { assertEquals, assertExists, assertThrows } from 'std/assert';
import { AppConstantsService } from '../constants/app-constants.service.ts';

Deno.test({
	name: 'AppConfigModule',
	permissions: {
		read: true,
		env: true,
		sys: true,
	},
}, async (t: Deno.TestContext) => {
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

	await t.step('Create Module', async () => {
		module = await Test.createTestingModule({
			imports: [
				AppConfigModule.registerAsync<AppSchemaType>({
					schema: appSchema,
					useDotEnvEnvironment: AppConstantsService.denoEnv.isTest,
					useDotEnvDefaults: AppConstantsService.denoEnv.isTest
				}),
			]
		}).compile();

		service = module.get(AppConfigService<AppSchemaType>);
	});

	await t.step('Check if service is defined', () => {
		assertExists(service);
	});

	await t.step('Should be bla', () => {
		// FROM default value out provided zod schema (top of this code file).
		assertEquals(service.get('TEST'), 'bla');
	});

	await t.step(
		'should be 123 because it was optional and defaulted to string "123" and then transformed to a number',
		() => {
			// FROM default value out provided zod schema (top of this code file).
			assertEquals(service.get('TEST_NUMBER'), 123);
		},
	);

	await t.step('should be undefined because is was optional', () => {
		// FROM default value out provided zod schema (top of this code file).
		assertEquals(service.get('TEST_NULLABLE_NUMBER'), undefined);
	});

	await t.step('should be undefined', () => {
		// FROM default value out provided zod schema (top of this code file).
		assertEquals(service.get('UNDEFINED'), undefined);
	});

	await t.step('should be debug', () => {
		// FROM .env.test
		assertEquals(service.LOG_LEVEL, 'debug');
	});

	await t.step('should throw exception', () => {
		// FROM .env.test
		assertThrows(() => service.getOrThrow('UNDEFINED'));
	});

	await t.step('should be info', () => {
		// FROM .env.test
		assertEquals(service.DENO_ENV, 'test');
	});

	await t.step('Close TestModule', async () => {
		await module.close();
	});
});
