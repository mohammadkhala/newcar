/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS script run via npx sharp */
/**
 * Regenerates solid-brand-color PWA icons when /public/logo.png is absent.
 * Run: npm run generate:pwa-icons
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "public", "icons");
const BG = { r: 241, g: 90, b: 36 };

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const s of [180, 192, 512]) {
    await sharp({
      create: { width: s, height: s, channels: 3, background: BG },
    })
      .png()
      .toFile(path.join(OUT, `icon-${s}.png`));
  }
  fs.copyFileSync(path.join(OUT, "icon-180.png"), path.join(OUT, "apple-touch-icon.png"));
}

main().catch((e) => {
  process.stderr.write(String(e) + "\n");
  process.exit(1);
});
