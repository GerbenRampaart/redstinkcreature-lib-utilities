import { Test, TestingModule } from "@nestjs/testing";
import { AppConfigService } from "./app-config.service.js";
import { AppConfigModule } from "./app-config.module.js";
import { z } from "zod";

describe("AppConfigService", () => {
  const appSchema = z.object({
    TEST: z.string().optional().default('bla')
  });

  type AppSchemaType = z.infer<typeof appSchema>;
  let service: AppConfigService<AppSchemaType>;

  beforeEach(async () => {


    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppConfigModule.registerAsync(),
      ],
      providers: [
        AppConfigService,
      ],
    }).compile();

    service = await module.resolve<appSchemaType>(AppConfigService);

    service.get('')
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should be 3000", () => {
    expect(service.get('PORT')).toBe(3000);
  });
});
