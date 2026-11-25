// Builds dist/ev-cockpit-card.js: the pictures (as data URIs) followed by src/*.js in name order.
// No dependencies: node scripts/build.mjs
import { readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const types = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

// Pictures: src/images/<make>/<scene|side|xray>.<ext>  →  window.__evcImages["<make>/<name>"]
const imgDir = join(root, "src/images");
let images = "(function(){var i=window.__evcImages=window.__evcImages||{};\n";
for (const make of readdirSync(imgDir).sort()) {
  const dir = join(imgDir, make);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir).sort()) {
    const ext = extname(f).toLowerCase(), name = basename(f, extname(f));
    if (!types[ext] || name === "source") continue;
    const b64 = readFileSync(join(dir, f)).toString("base64");
    images += `i[${JSON.stringify(`${make}/${name}`)}]="data:${types[ext]};base64,${b64}";\n`;
  }
}
images += "window.dispatchEvent(new Event(\"evc-images\"));})();\n";

const src = readdirSync(join(root, "src")).filter(f => f.endsWith(".js")).sort()
  .map(f => `// ---- ${f} ----\n` + readFileSync(join(root, "src", f), "utf8")).join("\n");

const code = `/*! EV Cockpit Card ${pkg.version} | MIT | https://github.com/${pkg.repo} */\n(function(){\n${src}\n})();\n`
  .replace(/__VERSION__/g, pkg.version).replace(/__REPO__/g, pkg.repo);

writeFileSync(join(root, "dist/ev-cockpit-card.js"), images + code);
// 4K scenes: src/hires/<name>.webp → dist/ev-cockpit-<name>.webp (attached to each release; HACS installs them)
for (const f of readdirSync(join(root, "src/hires")).filter(f => f.endsWith(".webp")))
  writeFileSync(join(root, "dist/ev-cockpit-" + f), readFileSync(join(root, "src/hires", f)));
console.log(`Built ${pkg.version}: ${(Buffer.byteLength(images + code) / 1024).toFixed(0)} KB (code ${(Buffer.byteLength(code) / 1024).toFixed(0)} KB)`);
