//import deno from '../../deno.json' with { type: 'json' };

// https://jsr.io/@luca/esbuild-deno-loader
import * as esbuild from 'esbuild';
// Import the WASM build on platforms where running subprocesses is not
// permitted, such as Deno Deploy, or when running without `--allow-run`.
// import * as esbuild from "https://deno.land/x/esbuild@0.20.2/wasm.js";

import { denoPlugins } from 'jsr:@luca/esbuild-deno-loader';
import { join } from 'std/path';

const result = await esbuild.build({
	plugins: [...denoPlugins({
		loader: 'native',
		configPath: join(Deno.cwd(), 'deno.json'),
	})],
	entryPoints: ['./src/main.ts'],
	outfile: './dist/bytes.esm.js',
	bundle: true,
	format: 'esm',
	tsconfigRaw: {
		compilerOptions: {
			target: 'esnext',
			module: 'esnext',
			experimentalDecorators: true,
			emitDecoratorMetadata: true,
		},
	},
});

console.log(result.outputFiles);

await esbuild.stop();
