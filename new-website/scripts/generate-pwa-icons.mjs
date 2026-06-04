import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "public/assets/images/logo-100.jpg");
const outDir = path.join(root, "public/icons");

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-512-maskable.png", size: 512, padding: 0.12 },
];

await mkdir(outDir, { recursive: true });
const input = await readFile(source);

for (const { name, size, padding = 0 } of sizes) {
  const inner = Math.round(size * (1 - padding * 2));
  const offset = Math.round((size - inner) / 2);
  const resized = await sharp(input).resize(inner, inner, { fit: "contain", background: "#ffffff" }).png().toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: padding ? "#2D6A4F" : "#ffffff",
    },
  })
    .composite([{ input: resized, top: offset, left: offset }])
    .png()
    .toFile(path.join(outDir, name));
  console.log(`Wrote public/icons/${name}`);
}
