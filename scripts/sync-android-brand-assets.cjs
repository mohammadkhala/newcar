/* eslint-disable @typescript-eslint/no-require-imports -- maintenance script */
/**
 * Writes Android launcher assets (separate source) + splash bitmaps (separate source)
 * + iOS Splash.imageset + iOS AppIcon (1024).
 *
 * Local files (under public/brand/):
 *   Splash (Android overlay + iOS Launch): first match
 *     1) splash-logo.png
 *     2) splash-logo.webp
 *     3) ../logo.png (store hero / full logo)
 *     4) fallback: same as app icon source (see below)
 *
 *   App icon (adaptive + mipmaps):
 *     1) app-icon.png
 *     2) header-wordmark.png
 *     3) header-wordmark.webp
 *     4) ../logo.png
 *     5) ../icons/icon-512.png
 *
 * Optional: npm run sync:android-assets -- --from-api
 *   Splash image: logo_full_url → app_logo_full_url → storefront_app_icon_url
 *   App icon image: storefront_app_icon_url → app_logo_full_url → logo_full_url
 *
 * Run from store/web: npm run sync:android-assets [-- --from-api]
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const ANDROID_RES = path.join(ROOT, "android", "app", "src", "main", "res");
const DRAWABLE = path.join(ANDROID_RES, "drawable");
const DRAWABLE_NODPI = path.join(ANDROID_RES, "drawable-nodpi");
const BRAND = path.join(ROOT, "public", "brand");
const SPLASH_LOGO_PNG = path.join(BRAND, "splash-logo.png");
const SPLASH_LOGO_WEBP = path.join(BRAND, "splash-logo.webp");
const APP_ICON_PNG = path.join(BRAND, "app-icon.png");
const HEADER_WORDMARK_PNG = path.join(BRAND, "header-wordmark.png");
const HEADER_WORDMARK_WEBP = path.join(BRAND, "header-wordmark.webp");
const PUBLIC_LOGO = path.join(ROOT, "public", "logo.png");
const PUBLIC_ICON_512 = path.join(ROOT, "public", "icons", "icon-512.png");
const IOS_SPLASH_DIR = path.join(
  ROOT,
  "ios",
  "App",
  "App",
  "Assets.xcassets",
  "Splash.imageset",
);
const IOS_APP_ICON_FILE = path.join(
  ROOT,
  "ios",
  "App",
  "App",
  "Assets.xcassets",
  "AppIcon.appiconset",
  "AppIcon-512@2x.png",
);

const ICON_CANVAS = 512;
const ADAPTIVE_SAFE_BOX = Math.floor((ICON_CANVAS * 72) / 108);
// Near full 72dp safe zone — readable on launcher; mask may clip wide lockups slightly.
const ADAPTIVE_LOGO_DIAGONAL_FRAC = 0.95;
const ICON_PLATE = { r: 255, g: 255, b: 255 };

const SPLASH_LOGO_FULL_MAX = 2800;
const IOS_SPLASH_SIZE = 2732;
const IOS_SPLASH_LOGO_MAX = 2000;

function loadEnvLocal() {
  const p = path.join(ROOT, ".env.local");
  if (!fs.existsSync(p)) {
    return;
  }
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) {
      continue;
    }
    const m = t.match(/^NEXT_PUBLIC_API_BASE_URL=(.+)$/);
    if (m) {
      process.env.NEXT_PUBLIC_API_BASE_URL = m[1].trim().replace(/^["']|["']$/g, "");
    }
  }
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { headers: { Accept: "application/json,image/*,*/*" } }, (r) => {
        if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
          fetchBuffer(new URL(r.headers.location, url).href)
            .then(resolve)
            .catch(reject);
          return;
        }
        if (r.statusCode !== 200) {
          reject(new Error(`HTTP ${r.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        r.on("data", (c) => chunks.push(c));
        r.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

function pickFirstUrl(obj, keys) {
  for (const k of keys) {
    const v = String(obj[k] ?? "").trim();
    if (v && /^https?:\/\//i.test(v)) {
      return v;
    }
  }
  return "";
}

function readFirstExistingBuffer(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) {
      return { buffer: fs.readFileSync(p), path: p };
    }
  }
  return null;
}

/**
 * Splash-only sources (full / marketing lockup). Does not use app-icon path unless fallback.
 */
function resolveLocalSplashBuffer(iconFallbackBuffer) {
  const found = readFirstExistingBuffer([
    SPLASH_LOGO_PNG,
    SPLASH_LOGO_WEBP,
    PUBLIC_LOGO,
  ]);
  if (found) {
    return found.buffer;
  }
  if (iconFallbackBuffer) {
    process.stderr.write(
      "sync-android-brand-assets: splash: no splash-logo.png|.webp or public/logo.png — using app icon asset for splash.\n",
    );
    return iconFallbackBuffer;
  }
  return null;
}

/** Launcher / adaptive icon sources (compact mark). */
function resolveLocalIconBuffer() {
  const found = readFirstExistingBuffer([
    APP_ICON_PNG,
    HEADER_WORDMARK_PNG,
    HEADER_WORDMARK_WEBP,
    PUBLIC_LOGO,
    PUBLIC_ICON_512,
  ]);
  return found ? found.buffer : null;
}

async function toOpaqueLauncherSquarePng(sourceBuffer) {
  const srcMeta = await sharp(sourceBuffer).metadata();
  const w0 = srcMeta.width ?? 512;
  const h0 = srcMeta.height ?? 512;
  const intrinsicDiag = Math.hypot(w0, h0) || 1;
  const maxDiag = ADAPTIVE_SAFE_BOX * ADAPTIVE_LOGO_DIAGONAL_FRAC;
  const scale = maxDiag / intrinsicDiag;
  const targetW = Math.max(1, Math.round(w0 * scale));
  const inner = await sharp(sourceBuffer)
    .resize(targetW, null, {
      background: { ...ICON_PLATE, alpha: 1 },
    })
    .flatten({ background: ICON_PLATE })
    .png()
    .toBuffer();
  const meta = await sharp(inner).metadata();
  const iw = meta.width ?? targetW;
  const ih = meta.height ?? targetW;
  const padX = Math.max(0, Math.round((ICON_CANVAS - iw) / 2));
  const padY = Math.max(0, Math.round((ICON_CANVAS - ih) / 2));
  return sharp({
    create: {
      width: ICON_CANVAS,
      height: ICON_CANVAS,
      channels: 3,
      background: { ...ICON_PLATE, alpha: 1 },
    },
  })
    .composite([{ input: inner, left: padX, top: padY }])
    .png()
    .toBuffer();
}

async function writeMipmaps(iconPaddedPngBuffer) {
  const densities = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
  };
  for (const [folder, size] of Object.entries(densities)) {
    const dir = path.join(ANDROID_RES, folder);
    fs.mkdirSync(dir, { recursive: true });
    const png = await sharp(iconPaddedPngBuffer)
      .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(dir, "ic_launcher.png"), png);
    fs.writeFileSync(path.join(dir, "ic_launcher_round.png"), png);
  }
}

async function writeIosAppIcon(iconPaddedPngBuffer) {
  fs.mkdirSync(path.dirname(IOS_APP_ICON_FILE), { recursive: true });
  await sharp(iconPaddedPngBuffer)
    .resize(1024, 1024, {
      fit: "contain",
      background: { ...ICON_PLATE, alpha: 1 },
    })
    .png()
    .toFile(IOS_APP_ICON_FILE);
}

async function writeAndroidSplashLogoFull(sourceBuffer) {
  fs.mkdirSync(DRAWABLE_NODPI, { recursive: true });
  const target = path.join(DRAWABLE_NODPI, "splash_logo_full.png");
  await sharp(sourceBuffer)
    .resize(SPLASH_LOGO_FULL_MAX, SPLASH_LOGO_FULL_MAX, {
      fit: "inside",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(target);
}

async function writeIosSplashAssets(sourceBuffer) {
  fs.mkdirSync(IOS_SPLASH_DIR, { recursive: true });
  const logoLayer = await sharp(sourceBuffer)
    .resize(IOS_SPLASH_LOGO_MAX, IOS_SPLASH_LOGO_MAX, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const pngBuf = await sharp({
    create: {
      width: IOS_SPLASH_SIZE,
      height: IOS_SPLASH_SIZE,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([{ input: logoLayer, gravity: "center" }])
    .png()
    .toBuffer();

  for (const name of [
    "splash-2732x2732-2.png",
    "splash-2732x2732-1.png",
    "splash-2732x2732.png",
  ]) {
    fs.writeFileSync(path.join(IOS_SPLASH_DIR, name), pngBuf);
  }
}

async function main() {
  const fromApi = process.argv.includes("--from-api");
  loadEnvLocal();

  let iconBuffer;
  let splashBuffer;

  if (fromApi) {
    const base = String(process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
    if (!base) {
      throw new Error("Set NEXT_PUBLIC_API_BASE_URL or add it to .env.local for --from-api");
    }
    const configUrl = `${base}/config`;
    const body = await fetchBuffer(configUrl);
    const json = JSON.parse(body.toString("utf8"));
    const iconUrl = pickFirstUrl(json, [
      "storefront_app_icon_url",
      "app_logo_full_url",
      "logo_full_url",
    ]);
    const splashUrl = pickFirstUrl(json, [
      "logo_full_url",
      "app_logo_full_url",
      "storefront_app_icon_url",
    ]);
    if (!iconUrl) {
      throw new Error("API: missing icon URL (storefront_app_icon_url / app_logo_full_url / logo_full_url)");
    }
    if (!splashUrl) {
      throw new Error("API: missing splash URL (logo_full_url / …)");
    }
    iconBuffer = await fetchBuffer(iconUrl);
    splashBuffer = splashUrl === iconUrl ? iconBuffer : await fetchBuffer(splashUrl);
  } else {
    iconBuffer = resolveLocalIconBuffer();
    if (!iconBuffer) {
      throw new Error(
        "Missing app icon: add public/brand/app-icon.png or header-wordmark.png|.webp (or public/logo.png / icons/icon-512.png)",
      );
    }
    splashBuffer = resolveLocalSplashBuffer(iconBuffer);
    if (!splashBuffer) {
      throw new Error("Could not resolve splash image buffer");
    }
  }

  fs.mkdirSync(DRAWABLE, { recursive: true });

  const paddedIconPng = await toOpaqueLauncherSquarePng(iconBuffer);
  fs.writeFileSync(path.join(DRAWABLE, "ic_store_logo.png"), paddedIconPng);
  await writeMipmaps(paddedIconPng);
  await writeIosAppIcon(paddedIconPng);
  await writeAndroidSplashLogoFull(splashBuffer);
  await writeIosSplashAssets(splashBuffer);

  const legacySplash = path.join(DRAWABLE, "splash.png");
  if (fs.existsSync(legacySplash)) {
    fs.unlinkSync(legacySplash);
  }

  process.stdout.write(
    "sync-android-brand-assets: launcher from app-icon chain; splash from splash-logo chain; wrote ic_store_logo, mipmaps, iOS AppIcon, splash_logo_full, iOS Splash.imageset\n",
  );
}

main().catch((e) => {
  process.stderr.write(String(e) + "\n");
  process.exit(1);
});
