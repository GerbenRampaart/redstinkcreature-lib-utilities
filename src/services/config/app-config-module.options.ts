import z from 'zod';

export type ProcessEnvZod = z.ZodObject<Record<string, any>>;
export type ProcessEnv = z.infer<ProcessEnvZod>;

export type AppConfigModuleOptions = {
	/**
	 * Will throw an Error if a schema was provided and the zod.parse fails.
	 * If undefined, no processing or checking will be done.
	 *
	 * It's highly recommended to supply a strict schema so the app gets exactly
	 * the settings it's expecting.
	 *
	 * default: undefined
	 */
	schema?: ProcessEnvZod;

	/**
	 * If true, tries to find '.env' in cwd() and throws Error if not available.
	 * If false or undefined, ignores any .env
	 *
	 * default: undefined
	 */
	useDotEnvDefaults?: boolean;

	/**
	 * If true, tries to find '.env.<ENV>' (like .env.development) in cwd() and throws Error if not available.
	 * If false or undefined, ignores any .env.<ENV>
	 *
	 * default: undefined
	 */
	useDotEnvEnvironment?: boolean;
};
