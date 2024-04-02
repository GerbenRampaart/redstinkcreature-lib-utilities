import { Test, TestingModule } from '@nestjs/testing';
import { AppHttpService } from './app-http.service.ts';
import { AppHttpModule } from './app-http.module.ts';

describe('AppHttpService', () => {
	let service: AppHttpService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				AppHttpModule,
			],
			providers: [
				AppHttpService,
			],
		}).compile();

		service = await module.resolve<AppHttpService>(AppHttpService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
