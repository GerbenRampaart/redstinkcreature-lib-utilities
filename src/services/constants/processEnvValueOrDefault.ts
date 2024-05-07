export const processEnvValueOrDefault = (
	name: string,
	def: string,
	valid: string[],
): string => {
	const val = Deno.env.get(name);

	if (val === undefined) {
		console.warn(`${name} not set. Defaulting to ${def}.`);
		return def;
	}

	if (!valid.includes(val)) {
		console.warn(
			`${name} set to incorrect value ${val}. Defaulting to ${def}.`,
		);
		return def;
	}

	return val;
};
