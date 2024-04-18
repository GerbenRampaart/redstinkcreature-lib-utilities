import type { z } from 'zod';

export type ProcessEnvZod = z.ZodObject<{ [key in string]: any }>;
export type ProcessEnv = z.infer<ProcessEnvZod>;

export type AppConfigModuleOptions = {
	schema?: ProcessEnvZod;
};
