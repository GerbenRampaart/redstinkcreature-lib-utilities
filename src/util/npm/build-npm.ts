import { build, emptyDir } from "@deno/dnt";
import deno from '../../../deno.json' with { type: 'json' };
import { getBunPath } from './getBunPath.ts';
import { join } from '@std/path';
import { AppConstantsService } from '../../services/constants/app-constants.service.ts';
import { expandGlob } from '@std/fs';

const outDir = 'lib';
const outDirAbs = join(AppConstantsService.projectRoot, outDir);

await emptyDir(outDirAbs);

await build({
  entryPoints: ["./mod.ts"],
  outDir: outDirAbs,
  shims: {
    deno: true,
  },
  rootTestDir: "./src",
  packageManager: await getBunPath(),
  package: {
    name: deno.name,
    version: deno.version,
    license: "MIT",
  },
  importMap: './deno.json',
  esModule: true,
  scriptModule: 'cjs',
  skipSourceOutput: true,
  compilerOptions:{
    emitDecoratorMetadata: true,
  },
  async postBuild() {
    await Deno.copyFile("README.md", join(outDirAbs, "README.md"));

    const dotEnvPath = join(AppConstantsService.projectRoot, '**', '.env.*');
		const filesPromise = expandGlob(dotEnvPath);
		const files = await Array.fromAsync(filesPromise);

    const newDotEnvPath = join(AppConstantsService.projectRoot, outDir, 'dotenv');
    await Deno.mkdir(newDotEnvPath);

    files.forEach(async f => {
      await Deno.copyFile(f.path, join(newDotEnvPath, f.name));
    })
  },
});