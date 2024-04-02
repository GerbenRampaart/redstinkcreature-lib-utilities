import { levels } from '../../util/LOG_LEVEL.ts';
import { envs } from '../../util/NODE_ENV.ts';
import { z } from 'zod';

export const UtilitiesSchema = z.object({
	NODE_ENV: z.enum(envs),
	LOG_LEVEL: z.enum(levels),
}).partial();

export type UtilitiesSchemaType = z.infer<typeof UtilitiesSchema>;
