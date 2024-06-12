import { join } from "node:path";
import { AppConstantsService } from "../services/constants";
import { rm } from "node:fs/promises";

await rm(join(AppConstantsService.projectRoot, 'out'), {
	force: true,
	recursive: true,
});


const buildResult = await Bun.build({
	entrypoints: [
		join(AppConstantsService.projectRoot, 'index.ts'),
		join(AppConstantsService.projectRoot, 'src', 'util', 'api', 'bootstrap.ts')
	],
	target: 'node',
	format: 'esm',
	minify: true,
	sourcemap: 'external',
	
  });