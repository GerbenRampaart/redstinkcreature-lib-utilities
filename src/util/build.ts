/* //import deno from '../../deno.json' with { type: 'json' };

// https://jsr.io/@luca/esbuild-deno-loader
import * as esbuild from 'esbuild';
import { denoPlugins } from '@luca/esbuild-deno-loader';
import { join } from 'std/path';
import { dtsPlugin } from 'esbuild-plugin-d.ts';
import { nodeExternals } from 'esbuild-plugin-node-externals';

const result = await esbuild.build({
	plugins: [
		nodeExternals({}),

		...denoPlugins({
			loader: 'native',
			configPath: join(Deno.cwd(), 'deno.json'),
			lockPath: join(Deno.cwd(), 'deno.lock'),

			// https://github.com/lucacasonato/esbuild_deno_loader/issues/103
			nodeModulesDir: true,
		}),
		dtsPlugin({
			tsconfig: {
				'compilerOptions': {
					'target': 'ESNext',
					'experimentalDecorators': true,
				},
			},
			outDir: './lib',
		}),
	],
	platform: 'browser',
	target: 'esnext',
	sourcemap: true,
	treeShaking: true,
	entryPoints: ['./src/main.ts'],
	outfile: './lib/nestjs.js',
	bundle: true,
	minify: false,
	format: 'esm',
	external: [
		'@nestjs/microservices',
		'@nestjs/platform-express',
		'class-validator',
		'class-transformer',
		'@nestjs/core',
		'@nestjs/platform-fastify',
		'@nestjs/testing',
	],
	tsconfigRaw: {
		'compilerOptions': {
			'moduleResolution': 'NodeNext',
			'target': 'ESNext',
			'module': 'NodeNext',
			'experimentalDecorators': true,
			'emitDecoratorMetadata': true,
			'strict': true,
		},
	},
});

console.log(result.outputFiles);

await esbuild.stop();
 */