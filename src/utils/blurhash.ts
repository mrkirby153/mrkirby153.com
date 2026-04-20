import { encode } from "blurhash";
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const CACHE_FILE = join(process.cwd(), ".astro", "blurhash-cache.json");

function loadCache(): Record<string, string> {
  try {
    return JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, string>) {
  mkdirSync(dirname(CACHE_FILE), { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

const cache = loadCache();

export async function getBlurhash(imageUrl: string): Promise<string> {
  if (cache[imageUrl]) return cache[imageUrl];

  const response = await fetch(imageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  const { data, info } = await sharp(buffer)
    .raw()
    .ensureAlpha()
    .resize(64, 64, { fit: "inside" })
    .toBuffer({ resolveWithObject: true });

  const hash = encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4,
    4,
  );
  cache[imageUrl] = hash;
  saveCache(cache);
  return hash;
}
