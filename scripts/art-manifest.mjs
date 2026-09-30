// Lists the template art in public/art/<templateId>/ into
// lib/artManifest.generated.json, so art slots know which images exist
// without requesting missing ones (they fall back to drawn art). Runs
// before `dev` and `build`; re-run after adding images.
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = "public/art";
const IMAGE = /\.(webp|avif|png|jpe?g)$/i;
const manifest = {};
for (const template of readdirSync(root).sort()) {
  const dir = join(root, template);
  if (!statSync(dir).isDirectory()) continue;
  const files = readdirSync(dir).filter((f) => IMAGE.test(f)).sort();
  if (files.length) manifest[template] = files;
}
writeFileSync("lib/artManifest.generated.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`art manifest: ${Object.values(manifest).flat().length} images`);
