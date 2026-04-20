#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const API_URL = "https://media.mrkirby153.com/api/images";
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, "..", "src", "data", "photos.json");

const response = await fetch(API_URL);
if (!response.ok) {
  console.error(`Failed to fetch: ${response.status} ${response.statusText}`);
  process.exit(1);
}

const data = await response.json();
mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
console.log(`Wrote ${OUTPUT_PATH}`);
