import { build, emptyDir } from "@deno/dnt";
import deno from '../../../deno.json' with { type: 'json' };
import { getBunPath } from './getBunPath.ts';
import { join } from '@std/path';
import { AppConstantsService } from '../../services/constants/app-constants.service.ts';

const outDir = 'lib';
const root = await AppConstantsService.projectRoot();
const outDirAbs = join(root, outDir);

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
  async postBuild() {
    await Deno.copyFile("README.md", join(outDirAbs, "README.md"));
  },
});