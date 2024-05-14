import { Test, TestingModule } from '@nestjs/testing';
import { AppLoggerService } from './app-logger.service.ts';
import { AppLoggerModule } from './app-logger.module.ts';
import { assertEquals, assertExists } from 'std/assert';

Deno.test({
	name: 'AppLoggerModule',
	permissions: {
		read: true,
		sys: true,
		env: true,
	},
}, async (t: Deno.TestContext) => {
	let service: AppLoggerService;
	let module: TestingModule;

	await t.step('Create Module', async () => {
		module = await Test.createTestingModule({
			imports: [
				AppLoggerModule,
			],
		}).compile();

		service = module.get<AppLoggerService>(AppLoggerService);
	});

	await t.step('Check if service is defined', () => {
		assertExists(service);
	});

	await t.step('Check if level is settable', () => {
		service.level = 'fatal';
		assertEquals(service.level, 'fatal');
		service.level = 'debug';
		assertEquals(service.level, 'debug');
	});

	await t.step('Close TestModule', async () => {
		await module.close();
	});
});
