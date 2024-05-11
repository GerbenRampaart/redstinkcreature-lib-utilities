import { Controller, Get } from '@nestjs/common';
import { AppLoggerService } from './services/logger/app-logger.service.ts';
import { PackageService } from './services/package/package.service.ts';

@Controller()
export class TestController {
    constructor(
        private readonly l: AppLoggerService,
        private readonly p: PackageService
    ) {

    }

    @Get()
    test() {
        this.l.info('test route')
        return 'test';
    }
}