import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { ProcessEnv } from "./app-config.schema.js";
import type { z } from "zod";


@Injectable()
export class AppConfigService<TSchema extends z.ZodObject<{}>> {
  constructor(
    private configService: ConfigService<TSchema, true>) { 
  }

  get<T extends keyof ProcessEnv>(key: T) {
    return this.configService.get(key, { infer: true });
  }
}
