#!/usr/bin/env node
/**
 * Smoke check: GET vehicles/brands with X-localization ar vs en.
 * Usage: from store/web, `node scripts/verify-api-localization.mjs`
 * Requires NEXT_PUBLIC_API_BASE_URL in the environment (e.g. .env.local loaded manually or export).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
let base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";

if (!base && existsSync(envPath)) {
  const text = readFileSync(envPath, "utf8");
  const m = text.match(/^\s*NEXT_PUBLIC_API_BASE_URL\s*=\s*(.+)$/m);
  if (m) {
    base = m[1].trim().replace(/^["']|["']$/g, "");
  }
}

function normalize(u) {
  if (!u) return "";
  const protocolMatch = u.match(/^(https?:\/\/)(.*)$/i);
  if (protocolMatch) {
    const rest = protocolMatch[2].replace(/\/+/g, "/").replace(/\/$/, "");
    return `${protocolMatch[1]}${rest}`;
  }
  return u.replace(/\/+/g, "/").replace(/\/$/, "");
}

base = normalize(base);
if (!base) {
  process.stderr.write(
    "Set NEXT_PUBLIC_API_BASE_URL (e.g. http://127.0.0.1:8000/api/v1) in .env.local or the environment.\n",
  );
  process.exit(1);
}

const url = `${base}/vehicles/brands`;

async function fetchBrands(locale) {
  const res = await fetch(url, {
    headers: { "X-localization": locale, Accept: "application/json" },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json, text: text.slice(0, 200) };
}

const ar = await fetchBrands("ar");
const en = await fetchBrands("en");

process.stdout.write(`Base: ${base}\n`);
process.stdout.write(
  `ar: status=${ar.status} brands=${ar.json?.brands?.length ?? "n/a"}\n`,
);
process.stdout.write(
  `en: status=${en.status} brands=${en.json?.brands?.length ?? "n/a"}\n`,
);

if (!ar.ok || !en.ok) {
  process.stderr.write(
    ar.ok ? "" : `ar body preview: ${ar.text}\n`,
  );
  process.stderr.write(
    en.ok ? "" : `en body preview: ${en.text}\n`,
  );
  process.exit(1);
}

process.exit(0);
