import { Module } from "@nestjs/common";
import { AppLoggerService } from "./app-logger.service.js";
import { LoggerModule } from "nestjs-pino";
import { IncomingMessage, ServerResponse} from "http";
import { type ReqId } from "pino-http";
import { v4 } from "uuid";
import { AppPackageJsonService } from "../package/packageJson.service.js";
import { type PrettyOptions } from "pino-pretty";
import { NodeEnv } from "../../util/NodeEnv.js";
import { LibUtilitiesConstants } from "../../util/LibUtilitiesConstants.js";

@Module({
  imports: [
    LoggerModule.forRootAsync({
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
            // We coalesce the log level to 'info' if it's not set,
            // but it really should never 
            level: process.env['LOG_LEVEL'] ?? 'info',
            name: `${pj.product.pj.name}:${pj.product.pj.version}`,
            transport: NodeEnv.isDebug
              ? {
                target: "pino-pretty",
                options,
              }
              : undefined, // undefined = stdout
            genReqId: (req: IncomingMessage, res: ServerResponse): ReqId => {
              const cId = LibUtilitiesConstants.headers.correlationId;
              const rId = LibUtilitiesConstants.headers.requestId;

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
export class AppLoggerModule {}
