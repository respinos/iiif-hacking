import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";

esbuild
  .build({
    entryPoints: ["src/js/app7.js"],
    mainFields: ["svelte", "browser", "module", "main"],
    conditions: ["svelte", "browser"],
    bundle: true,
    outfile: "dist/js/app7.js",
    plugins: [sveltePlugin({compilerOptions: { css: true }})],
    logLevel: "info",
  })
  .catch(() => process.exit(1));