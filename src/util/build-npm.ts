import { build, emptyDir } from "@deno/dnt";
import deno from '../../deno.json' with { type: 'json' };

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./lib",
  shims: {
    deno: true,
  },
  rootTestDir: "./src",
  packageManager: '/Users/$USER/.bun/bin/bun',
  package: {
    name: deno.name,
    version: deno.version,
    license: "MIT",
  },
  async postBuild() {
    await Deno.copyFile("README.md", "npm/README.md");
  },
});