import { z } from 'zod';

export type ProcessEnvZod = z.ZodObject<Record<string, any>>;
export type ProcessEnv = z.infer<ProcessEnvZod>;

export type AppConfigModuleOptions = {
	schema?: ProcessEnvZod;
	failWhenInvalid?: boolean;
};
