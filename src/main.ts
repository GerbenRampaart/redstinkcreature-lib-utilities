import '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { LoggerErrorInterceptor } from 'nestjs-pino';
import { AppLoggerModule } from './services/logger/app-logger.module.ts';
import { AppLoggerService } from './services/logger/app-logger.service.ts';

async function bootstrap() {
	const app = await NestFactory.create(AppLoggerModule,
		{
			bufferLogs: true,
		}
	);

	const l = app.get(AppLoggerService);
	app.useLogger(l);
	
	app.useGlobalInterceptors(new LoggerErrorInterceptor());
	await app.listen(3000);
}
bootstrap();
