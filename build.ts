import { join } from "path";
import { readdir, mkdir, cp } from "fs/promises";

const ROOT = import.meta.dir;
const OUT = join(ROOT, "dist");

async function buildIndexHtml(): Promise<string> {
  const template = await Bun.file(join(ROOT, "index.html")).text();
  const slidesDir = join(ROOT, "src", "slides");
  const files = (await readdir(slidesDir))
    .filter(f => f.endsWith(".html"))
    .sort();
  const parts = await Promise.all(files.map(f => Bun.file(join(slidesDir, f)).text()));
  return template.replace("<!-- SLIDES -->", parts.join("\n\n"));
}

// Clean and create output directory
await mkdir(OUT, { recursive: true });

// Build assembled index.html
const html = await buildIndexHtml();
await Bun.write(join(OUT, "index.html"), html);

// Copy static assets
await cp(join(ROOT, "styles"), join(OUT, "styles"), { recursive: true });
await cp(join(ROOT, "assets"), join(OUT, "assets"), { recursive: true });

// Copy only the reveal.js files we need
const revealDist = join(ROOT, "node_modules", "reveal.js", "dist");
const revealOut = join(OUT, "node_modules", "reveal.js", "dist");
await mkdir(revealOut, { recursive: true });
await cp(revealDist, revealOut, { recursive: true });

const revealPlugins = join(ROOT, "node_modules", "reveal.js", "plugin");
const pluginsOut = join(OUT, "node_modules", "reveal.js", "plugin");
await mkdir(pluginsOut, { recursive: true });
await cp(revealPlugins, pluginsOut, { recursive: true });

console.log("Build complete → dist/");
