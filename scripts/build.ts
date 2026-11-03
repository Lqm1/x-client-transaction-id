/**
 * Builds the npm package into dist/: an ESM and a CommonJS bundle, each
 * next to a copy of the type declarations. dist/cjs carries its own
 * package.json so Node.js and TypeScript treat that directory as CommonJS.
 */

import { cp, rm } from "node:fs/promises";
import { $ } from "bun";

const outdir = "dist";

await rm(outdir, { recursive: true, force: true });

for (const format of ["esm", "cjs"] as const) {
  await Bun.build({
    entrypoints: ["src/index.ts"],
    outdir: `${outdir}/${format}`,
    format,
    target: "node",
    packages: "external",
  });
}

await $`bunx tsc -p tsconfig.build.json`;
await cp(`${outdir}/types`, `${outdir}/esm`, { recursive: true });
await cp(`${outdir}/types`, `${outdir}/cjs`, { recursive: true });
await rm(`${outdir}/types`, { recursive: true });
await Bun.write(`${outdir}/cjs/package.json`, '{ "type": "commonjs" }\n');
