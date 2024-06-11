import { Test, TestingModule } from '@nestjs/testing';
import { AppLoggerService } from './app-logger.service.ts';
import { AppLoggerModule } from './app-logger.module.ts';
import { test, expect, beforeEach, afterEach } from 'bun:test';

test('AppLoggerModule', async () => {
	let service: AppLoggerService;
	let module: TestingModule;

	beforeEach(async () => {
		module = await Test.createTestingModule({
			imports: [
				AppLoggerModule,
			],
		}).compile();

		// Without init(), no lifecycle events are fired, like onModuleInit.
		await module.init();

		service = module.get<AppLoggerService>(AppLoggerService);
	});

	afterEach(async () => {
		await module.close();
	});

	test('Check if service is defined', () => {
		expect(service).toBeDefined();
	});

	test('Check if level is settable', () => {
		service.level = 'fatal';
		expect(service.level).toBe('fatal');
		service.level = 'debug';
		expect(service.level).toBe('debug');
	});
});
