import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";

async function watch() {
  let ctx = await esbuild
    .context({
      entryPoints: ["src/js/app6.js"],
      mainFields: ["svelte", "browser", "module", "main"],
      conditions: ["svelte", "browser"],
      bundle: true,
      outfile: "dist/js/app6.js",
      plugins: [sveltePlugin({compilerOptions: { css: true }})],
      logLevel: "info",
    })
  await ctx.watch();
  console.log("Watching...");
    // .catch(() => process.exit(1));
}

watch();