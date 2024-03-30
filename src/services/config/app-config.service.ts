import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService<TSchema> {
  constructor(
    private configService: ConfigService<TSchema, true>) { 
  }

  get<T extends keyof TSchema>(key: T) {
    return this.configService.get<TSchema>(key, { infer: true });
  }
}
