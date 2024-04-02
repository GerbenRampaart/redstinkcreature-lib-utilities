import { forwardRef, Module } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AppLoggerService } from '../logger/app-logger.service.ts';
import { AppHttpService } from './app-http.service.ts';
import { AppLoggerModule } from '../logger/app-logger.module.ts';

@Module({
	imports: [
		HttpModule.register({}),
		forwardRef(() => AppLoggerModule),
	],
	providers: [
		AppLoggerService,
		HttpService,
		AppHttpService,
	],
	exports: [
		AppHttpService,
	],
})
export class AppHttpModule { }
