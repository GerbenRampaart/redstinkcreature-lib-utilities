import { Module } from '@nestjs/common';
import { AppLoggerService } from './app-logger.service.ts';
import { LoggerModule } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'node:http';
import { type ReqId } from 'pino-http';
import { type PrettyOptions } from 'pino-pretty';
import { PackageService } from '../package/package.service.ts';
import { PackageModule } from '../package/package.module.ts';
import { AppConstantsService } from '../constants/app-constants.service.ts';
import { build } from 'pino-pretty';

@Module({
	imports: [
		LoggerModule.forRootAsync({
			imports: [
				PackageModule,
			],
			inject: [
				PackageService,
			],
			useFactory: (
				pj: PackageService,
			) => {
				// https://github.com/pinojs/pino-pretty#options
				const options: PrettyOptions = {
					colorize: true,
					singleLine: false,
				};

				return {
					pinoHttp: {
						level: AppConstantsService.rawLogLevel(),
						name: `${pj.product.pj.name}:${pj.product.pj.version}`,
						stream: AppConstantsService.denoEnv.isDebug
							? build(options)
							: undefined,
						genReqId: (
							req: IncomingMessage,
							res: ServerResponse,
						): ReqId => {
							const cId =
								AppConstantsService.libUtilitiesConstants
									.headers
									.correlationId;
							const rId =
								AppConstantsService.libUtilitiesConstants
									.headers
									.requestId;

							const corId = req.headers[cId]?.toString() ??
								crypto.randomUUID();
							const reqId = req.headers[rId]?.toString() ??
								crypto.randomUUID();

							req.headers[cId] = corId;
							req.headers[rId] = reqId;

							res.setHeader(cId, corId);
							res.setHeader(rId, reqId);

							return reqId;
						},
					},
				};
			},
		}),
	],
	providers: [
		AppLoggerService,
	],
	exports: [
		AppLoggerService,
	],
})
export class AppLoggerModule {}
