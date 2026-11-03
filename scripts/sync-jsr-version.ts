/**
 * Copies the package.json version into jsr.json. It runs as the "version"
 * lifecycle script, so `bun pm version` (or `npm version`) bumps both
 * files in the same commit.
 */
const { version } = await Bun.file("package.json").json();
const jsrConfig = await Bun.file("jsr.json").text();

await Bun.write(
  "jsr.json",
  jsrConfig.replace(/"version": "[^"]*"/, `"version": "${version}"`),
);
