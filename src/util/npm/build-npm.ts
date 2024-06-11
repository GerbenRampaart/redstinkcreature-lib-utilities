import { build, emptyDir } from '@deno/dnt';
import deno from '../../../deno.json' with { type: 'json' };
import { getBunPath } from './getBunPath.ts';
import { join } from '@std/path';
import { AppConstantsService } from '../../services/constants/app-constants.service.ts';
import { EOL, expandGlob } from '@std/fs';

const outDirAbs = join(AppConstantsService.projectRoot, AppConstantsService.outDir);

await emptyDir(outDirAbs);

await build({
	entryPoints: [
		{
			name: './api',
			path: './src/util/api/api.ts',
		},
		{
			name: './lib',
			path: './mod.ts',
		},
	],
	outDir: outDirAbs,
	shims: {
		deno: true,
		crypto: true, // instead of using v4() from uuid,
	},
	rootTestDir: './src',
	packageManager: await getBunPath(),
	package: {
		name: deno.name,
		version: deno.version,
		license: 'MIT',
	},
	importMap: join(AppConstantsService.projectRoot, 'deno.json'),
	esModule: true,
	scriptModule: 'cjs',
	skipSourceOutput: true,
	compilerOptions: {
		emitDecoratorMetadata: true,
	},
	async postBuild() {
		await Deno.copyFile('README.md', join(outDirAbs, 'README.md'));

		// Select all the .env files from the project root.
		const dotEnvPath = join(
			AppConstantsService.projectRoot,
			'**',
			'.env.*',
		);
		const filesPromise = expandGlob(dotEnvPath);
		const files = await Array.fromAsync(filesPromise);

		const newDotEnvPath = join(
			outDirAbs,
			'dotenv',
		);
    
		await Deno.mkdir(newDotEnvPath);

		files.forEach(async (f) => {
			await Deno.copyFile(f.path, join(newDotEnvPath, f.name));
		});

		await Deno.writeTextFile(
			join(outDirAbs, '.npmignore'),
			`/dotenv${EOL}`,
			{
				append: true,
			},
		);

		await Deno.writeTextFile(
			join(outDirAbs, '.npmignore'),
			`/bun.lockb${EOL}`,
			{
				append: true,
			},
		);
	},
});
