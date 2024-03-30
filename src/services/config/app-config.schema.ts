import { z } from 'zod';
import { pinoLevels } from '../logger/levels';

export const UtilitiesSchema = z.object({
  NODE_ENV: z.enum([
    "development",
    "production",
    "test",
    "repl",
  ]).default('development'),
  LOG_LEVEL: z.enum(pinoLevels).optional().default("info"),
}).partial();

export type UtilitiesSchemaType = z.infer<typeof UtilitiesSchema>;

