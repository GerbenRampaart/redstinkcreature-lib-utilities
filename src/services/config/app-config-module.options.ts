import type { z } from 'zod';

export type ProcessEnvType = z.ZodObject<{ [key in string]: any }>;

export interface IAppConfigModuleOptions {
	schema?: ProcessEnvType;
}
