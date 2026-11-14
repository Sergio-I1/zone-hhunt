// Builds the folder the iPhone app ships with: a copy of the game with its libraries
// copied and stored inside the app, so it opens without loading code from the web.
import { mkdir, readFile, writeFile, copyFile, rm } from "node:fs/promises";

const out = "www";
await rm(out, { recursive: true, force: true });
await mkdir(out + "/vendor", { recursive: true });

let html = await readFile("index.html", "utf8");
const libs = [...html.matchAll(/(?:src|href)="(https:\/\/unpkg\.com\/[^"]+)"/g)].map(m => m[1]);
for (const url of libs) {                    // each library comes from node_modules, at the same version the website uses
  const m = url.match(/^https:\/\/unpkg\.com\/((?:@[^/]+\/)?[^@/]+)@[^/]+\/(.+)$/);
  if (!m) throw new Error("Don't know how to bundle " + url);
  const name = m[2].split("/").pop();
  let body = await readFile("node_modules/" + m[1] + "/" + m[2], "utf8");
  if (name.endsWith(".css")) body = body.replace(/url\(images\/[^)]+\)/g, "none");   // Leaflet's default marker images are not used
  await writeFile(out + "/vendor/" + name, body);
  html = html.replaceAll(url, "vendor/" + name);
  console.log("bundled", name);
}
await writeFile(out + "/index.html", html);
for (const f of ["manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png"]) await copyFile(f, out + "/" + f);
console.log("www/ is ready");
