
import * as esbuild from 'esbuild';
import { dtsPlugin } from 'esbuild-plugin-d.ts';
import { nodeExternals } from 'esbuild-plugin-node-externals';

const result = await esbuild.build({
	plugins: [
		nodeExternals({

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
	platform: 'node',
	target: 'esnext',
	sourcemap: true,
	treeShaking: true,
	
	entryPoints: ['./src/util/api/bootstrap.ts'],
	outfile: './lib/lib-utilities.js',
	bundle: true,
	minify: false,
	format: 'cjs',
	external: [
		'@nestjs/microservices',
		'class-validator',
		'class-transformer',
		'@nestjs/websockets'
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

await esbuild.stop();
