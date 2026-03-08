import { join } from "path";
import { readdir } from "fs/promises";

const ROOT = import.meta.dir;
const PORT = 3000;

function mimeType(path: string): string {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".css"))  return "text/css";
  if (path.endsWith(".js"))   return "application/javascript";
  if (path.endsWith(".map"))  return "application/json";
  if (path.endsWith(".png") || path.endsWith(".jpg")) return "image/png";
  return "text/plain";
}

async function buildIndexHtml(): Promise<string> {
  const template = await Bun.file(join(ROOT, "index.html")).text();
  const slidesDir = join(ROOT, "src", "slides");
  const files = (await readdir(slidesDir))
    .filter(f => f.endsWith(".html"))
    .sort();
  const parts = await Promise.all(files.map(f => Bun.file(join(slidesDir, f)).text()));
  return template.replace("<!-- SLIDES -->", parts.join("\n\n"));
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    if (pathname === "/" || pathname === "/index.html") {
      return new Response(await buildIndexHtml(), {
        headers: { "Content-Type": "text/html" },
      });
    }

    const file = Bun.file(join(ROOT, pathname));
    if (!await file.exists()) return new Response("Not Found", { status: 404 });
    return new Response(file, { headers: { "Content-Type": mimeType(pathname) } });
  },
});

console.log(`Presentation running at http://localhost:${PORT}`);
