// Copies a photo from the root images/ folder into web/public/images/, ready for
// the site: longest side at most 2400px (never upscaled), JPG quality 82, and
// metadata stripped (sharp drops EXIF/GPS unless told to keep it).
//
// Usage (from web/):
//   node scripts/optimize-images.mjs "<source>" "<destination>" [<source> <destination> ...]
//   node scripts/optimize-images.mjs "../images/About image.jpg" public/images/about/about.jpg
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAX_SIDE = 2400;
const QUALITY = 82;

const args = process.argv.slice(2);
if (args.length === 0 || args.length % 2 !== 0) {
  console.error('Usage: node scripts/optimize-images.mjs "<source>" "<destination>" [...]');
  process.exit(1);
}

for (let i = 0; i < args.length; i += 2) {
  const [src, dest] = [args[i], args[i + 1]];
  await mkdir(path.dirname(dest), { recursive: true });
  const info = await sharp(src)
    .rotate() // apply EXIF orientation before the metadata is dropped
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(dest);
  console.log(`${src} -> ${dest} (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);
}
