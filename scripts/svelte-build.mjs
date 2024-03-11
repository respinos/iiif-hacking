import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";

esbuild
  .build({
    entryPoints: ["src/js/app5.js"],
    mainFields: ["svelte", "browser", "module", "main"],
    conditions: ["svelte", "browser"],
    bundle: true,
    outfile: "dist/js/app5.js",
    plugins: [sveltePlugin()],
    logLevel: "info",
    watch: true,
  })
  .catch(() => process.exit(1));