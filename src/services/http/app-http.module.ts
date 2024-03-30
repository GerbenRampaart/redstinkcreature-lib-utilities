import { Module, forwardRef } from "@nestjs/common";
import { HttpModule, HttpService } from "@nestjs/axios";
import { AppLoggerService } from "../logger/app-logger.service.js";
import { AppHttpService } from "./app-http.service.js";
import { AppLoggerModule } from "../logger/app-logger.module.js";

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
export class AppHttpModule {}
