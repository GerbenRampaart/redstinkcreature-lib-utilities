import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppLoggerService } from '../logger/app-logger.service.ts';
import { AppHttpService } from './app-http.service.ts';
import { AppLoggerModule } from '../logger/app-logger.module.ts';

@Global()
@Module({
	imports: [
		HttpModule.register({}),
		AppLoggerModule,
	],
	providers: [
		AppLoggerService,
		AppHttpService,
	],
	exports: [
		AppHttpService,
	],
})
export class AppHttpModule {}
