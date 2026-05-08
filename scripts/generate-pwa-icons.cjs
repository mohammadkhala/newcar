/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS script run via npx sharp */
/**
 * Regenerates PWA icons for mobile home-screen installs.
 *
 * Priority:
 * 1) Use /public/brand/app-icon.png (logo artwork) and pad it so it doesn't get cropped by masks.
 * 2) Fallback to solid brand color squares if the source is missing.
 *
 * Run: npm run generate:pwa-icons
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "public", "icons");
const BG = { r: 241, g: 90, b: 36 };

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const src = path.join(__dirname, "..", "public", "brand", "app-icon.png");
  const hasSrc = fs.existsSync(src);

  // Keep a generous safe area so "maskable" icons don't crop the glyph.
  // scale=0.68 yields ~16% padding each side on a square.
  const scale = 0.68;

  async function writeIcon(size) {
    const out = path.join(OUT, `icon-${size}.png`);
    if (!hasSrc) {
      await sharp({
        create: { width: size, height: size, channels: 3, background: BG },
      })
        .png()
        .toFile(out);
      return;
    }

    const inner = Math.round(size * scale);
    const inset = Math.floor((size - inner) / 2);
    const logo = await sharp(src).resize(inner, inner, { fit: "contain" }).png().toBuffer();

    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
    })
      .composite([{ input: logo, top: inset, left: inset }])
      .png()
      .toFile(out);
  }

  for (const s of [180, 192, 512]) {
    await writeIcon(s);
  }

  fs.copyFileSync(path.join(OUT, "icon-180.png"), path.join(OUT, "apple-touch-icon.png"));
}

main().catch((e) => {
  process.stderr.write(String(e) + "\n");
  process.exit(1);
});
