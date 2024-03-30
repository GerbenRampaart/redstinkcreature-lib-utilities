import { z } from 'zod';

export const AppConfigSchema = z.object({
  PORT: z.coerce.number().optional().default(3000),
  
  NODE_ENV: z.enum([
    "development",
    "production",
    "test",
    "provision",
    "repl",
  ]).optional().default("development"),

  LOG_LEVEL: z.enum([
    "silent",
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace", 
  ]).optional().default("info"),

  
});

export type ProcessEnv = z.infer<typeof AppConfigSchema>;