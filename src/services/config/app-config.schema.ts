import { z } from 'zod';
import { envs } from '../static/NODE_ENV.ts';
import { levels } from '../static/LOG_LEVEL.ts';

export const UtilitiesSchema = z.object({
	NODE_ENV: z.enum(envs),
	LOG_LEVEL: z.enum(levels),
}).partial();

export type UtilitiesSchemaType = z.infer<typeof UtilitiesSchema>;
