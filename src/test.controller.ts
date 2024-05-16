import { Controller, Get } from '@nestjs/common';
import { AppLoggerService } from './services/logger/app-logger.service.ts';

@Controller()
export class TestController {
	constructor(
		private readonly l: AppLoggerService,
	) {
	}

	@Get()
	test() {
		this.l.info('test route');
		return 'test';
	}
}
