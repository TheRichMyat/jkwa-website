// Makes fake "before" photos for the placeholder projects, only so the
// before/after slider can be tested until the client uploads real pairs.
// Desaturated, slightly darker, cooler tint. Usage (from web/):
//   node scripts/make-placeholder-befores.mjs
import sharp from "sharp";

const PAIRS = [
  // [after image in public/, project number]
  ["public/images/hero/hero-1.jpg", 1],
  ["public/images/services/services.jpg", 3],
  ["public/images/hero/hero-2.jpg", 7],
];

for (const [after, n] of PAIRS) {
  const img = sharp(after);
  const { width, height } = await img.metadata();
  const coolVeil = await sharp({
    create: { width, height, channels: 4, background: { r: 70, g: 90, b: 120, alpha: 0.16 } },
  })
    .png()
    .toBuffer();
  const dest = `public/images/projects/placeholder-before-${n}.jpg`;
  await img
    .modulate({ saturation: 0.25, brightness: 0.82 })
    .composite([{ input: coolVeil }])
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(dest);
  console.log(`${after} -> ${dest} (${width}×${height})`);
}
