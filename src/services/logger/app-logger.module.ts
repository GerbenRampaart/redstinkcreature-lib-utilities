import { AppLoggerService } from './app-logger.service.ts';
import { IncomingMessage, ServerResponse } from 'node:http';
import { AppConstantsService } from '../constants/app-constants.service.ts';
import { LoggerModule } from "nestjs-pino";
import { Global, Module } from '@nestjs/common';
import { type PrettyOptions, build } from 'pino-pretty';
import { type ReqId } from 'pino-http';

@Global()
@Module({
	imports: [
		LoggerModule.forRootAsync({
			useFactory: async () => {
				const p = await AppConstantsService.product();
				// https://github.com/pinojs/pino-pretty#options
				const options: PrettyOptions = {
					colorize: true,
					singleLine: false,
				};

				return {
					pinoHttp: {
						level: AppConstantsService.rawLogLevel(),
						name: `${p.name}:${p.version}`,
						stream: AppConstantsService.env.isDebug
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
export class AppLoggerModule { }
