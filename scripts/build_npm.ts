// ex. scripts/build_npm.ts
import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  compilerOptions: {
    lib: ["ESNext", "DOM"],
  },
  importMap: "deno.json",
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "x-client-transaction-id",
    version: Deno.args[0],
    description:
      "Client Transaction ID generator library for X (formerly Twitter) API requests",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/Lqm1/x-client-transaction-id.git",
    },
    bugs: {
      url: "https://github.com/Lqm1/x-client-transaction-id/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
    Deno.copyFileSync("README_JA.md", "npm/README_JA.md");
    Deno.copyFileSync("README_CN.md", "npm/README_CN.md");
  },
});
