import sharp from "sharp";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const iconsDir = path.join(publicDir, "icons");
const svgSource = readFileSync(path.join(__dirname, "icon-source.svg"));

const NAVY = { r: 11, g: 19, b: 37, alpha: 1 };

async function renderFullBleed(size) {
  return sharp(svgSource).resize(size, size).png().toBuffer();
}

async function renderMaskable(size) {
  // Adaptive-icon safe zone: keep content within the center ~66% of the
  // canvas so Android/iOS don't clip the cross when applying their own
  // mask shape (circle, squircle, rounded square, etc).
  const contentSize = Math.round(size * 0.62);
  const content = await sharp(svgSource).resize(contentSize, contentSize).png().toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: NAVY },
  })
    .composite([{ input: content, gravity: "center" }])
    .png()
    .toBuffer();
}

async function main() {
  const jobs = [
    { name: "icon-192.png", buffer: await renderFullBleed(192) },
    { name: "icon-512.png", buffer: await renderFullBleed(512) },
    { name: "icon-maskable-192.png", buffer: await renderMaskable(192) },
    { name: "icon-maskable-512.png", buffer: await renderMaskable(512) },
  ];

  for (const job of jobs) {
    await sharp(job.buffer).toFile(path.join(iconsDir, job.name));
    console.log(`Wrote icons/${job.name}`);
  }

  // Apple touch icon: full-bleed, no transparency, iOS applies its own
  // rounding -- a padded/maskable version would look too small on iOS.
  const appleTouchIcon = await renderFullBleed(180);
  await sharp(appleTouchIcon).flatten({ background: NAVY }).toFile(path.join(publicDir, "apple-touch-icon.png"));
  console.log("Wrote apple-touch-icon.png");

  // Favicon
  const favicon32 = await renderFullBleed(32);
  await sharp(favicon32).toFile(path.join(publicDir, "favicon-32.png"));
  console.log("Wrote favicon-32.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
