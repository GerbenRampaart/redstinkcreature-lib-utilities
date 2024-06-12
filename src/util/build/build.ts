import { join } from "node:path";
import { AppConstantsService } from "../../services/constants";
import { rm, mkdir, writeFile } from "node:fs/promises";

const buildResult = await Bun.build({
	entrypoints: [
		join(AppConstantsService.projectRoot, 'index.ts'),
	],
	target: 'node',
	format: 'esm',
	minify: true,
	sourcemap: 'external',
});

buildResult.logs.forEach((log) => {
	console.log(log);
});

const libDir = join(AppConstantsService.projectRoot, AppConstantsService.libraryOutDir);

if (buildResult.success) {
	console.log('Build succeeded');

	const out = buildResult.outputs;

	await rm(libDir, {
		force: true,
		recursive: true,
	});

	await mkdir(libDir, {
		recursive: true,
	});

	out.forEach(async (output) => {
		if (output.kind === 'entry-point') {
			await writeFile(join(libDir, 'index.js'), await output.text());
		}

		if (output.kind === 'sourcemap') {
			await writeFile(join(libDir, 'index.js.map'), await output.text());
		}
	});

} else {
	console.log('Build failed');
}