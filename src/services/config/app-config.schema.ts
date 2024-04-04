import { z } from 'zod';
import { envs } from '../misc/raw/NODE_ENV.ts';
import { levels } from '../misc/raw/LOG_LEVEL.ts';

export const UtilitiesSchema = z.object({
	NODE_ENV: z.enum(envs),
	LOG_LEVEL: z.enum(levels),
}).partial();

export type UtilitiesSchemaType = z.infer<typeof UtilitiesSchema>;
