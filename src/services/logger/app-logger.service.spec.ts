import { Test, TestingModule } from '@nestjs/testing';
import { AppLoggerService } from './app-logger.service';
import { AppLoggerModule } from './app-logger.module';

describe('AppConfigService', () => {
	let service: AppLoggerService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				AppLoggerModule,
			],
		}).compile();

		service = module.get(AppLoggerService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should be defined', () => {
		service.level = 'fatal';
		expect(service.level).toBe('fatal');
	});
});
