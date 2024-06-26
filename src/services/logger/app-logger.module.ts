import { Module } from '@nestjs/common';
import { AppLoggerService } from './app-logger.service.ts';
import { LoggerModule } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'http';
import { type ReqId } from 'pino-http';
import { v4 } from 'uuid';
import { type PrettyOptions } from 'pino-pretty';
import { AppPackageJsonService } from '../package/package.service.ts';
import { PackageModule } from '../package/package.module.ts';
import { AppConfigService } from '../config/app-config.service.ts';
import { AppConstantsService } from '../constants/app-constants.service.ts';

@Module({
	imports: [
		LoggerModule.forRootAsync({
			imports: [
				PackageModule,
			],
			inject: [
				AppPackageJsonService,
			],
			useFactory: async (
				pj: AppPackageJsonService,
			) => {
				// https://github.com/pinojs/pino-pretty#options
				const options: PrettyOptions = {
					colorize: true,
					singleLine: false,
				};

				return {
					pinoHttp: {
						level: AppConstantsService.rawLogLevel,
						name: `${pj.product.pj.name}:${pj.product.pj.version}`,
						transport: AppConstantsService.nodeEnv.isDebug
							? {
								target: 'pino-pretty',
								options,
							}
							: undefined, // undefined = stdout
						genReqId: (
							req: IncomingMessage,
							res: ServerResponse,
						): ReqId => {
							const cId =
							AppConstantsService.libUtilitiesConstants.headers
									.correlationId;
							const rId =
							AppConstantsService.libUtilitiesConstants.headers
									.requestId;

							const corId = req.headers[cId]?.toString() ?? v4();
							const reqId = req.headers[rId]?.toString() ?? v4();

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
export class AppLoggerModule { }
