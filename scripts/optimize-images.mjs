#!/usr/bin/env node
/**
 * Optimize the Thoth card scans.
 *
 * Source images are 278x408 PNGs. We keep the native dimensions and emit
 * AVIF + WebP variants so the browser can choose the smallest supported format.
 *
 * Usage:
 *   node scripts/optimize-images.mjs
 *   node scripts/optimize-images.mjs --force
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SOURCE_DIR = join(ROOT, "images");
const OUTPUT_DIR = join(ROOT, "public", "images");
const CARD_DIR = join(OUTPUT_DIR, "cards");
const FORCE = process.argv.includes("--force");

const MAJOR_SLUGS = [
  "major-00-fool",
  "major-01-magus",
  "major-02-priestess",
  "major-03-empress",
  "major-04-emperor",
  "major-05-hierophant",
  "major-06-lovers",
  "major-07-chariot",
  "major-08-adjustment",
  "major-09-hermit",
  "major-10-fortune",
  "major-11-lust",
  "major-12-hanged-man",
  "major-13-death",
  "major-14-art",
  "major-15-devil",
  "major-16-tower",
  "major-17-star",
  "major-18-moon",
  "major-19-sun",
  "major-20-aeon",
  "major-21-universe",
];

const RANKS = [
  "ace",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "princess",
  "prince",
  "queen",
  "knight",
];

const MINOR_SLUGS = ["wands", "cups", "swords", "disks"].flatMap((suit) =>
  RANKS.map((rank) => `${suit}-${rank}`),
);

const CARD_SLUGS = [...MAJOR_SLUGS, ...MINOR_SLUGS];

function runMagick(args) {
  execFileSync("magick", args, { stdio: "inherit" });
}

function optimize(source, baseName, width, height) {
  const webpPath = join(OUTPUT_DIR, `${baseName}.webp`);
  const avifPath = join(OUTPUT_DIR, `${baseName}.avif`);

  if (!FORCE && existsSync(webpPath) && existsSync(avifPath)) {
    return;
  }

  runMagick([
    source,
    "-strip",
    "-colorspace",
    "sRGB",
    "-resize",
    `${width}x${height}!`,
    "-define",
    "webp:method=6",
    "-quality",
    "82",
    webpPath,
  ]);

  runMagick([
    source,
    "-strip",
    "-colorspace",
    "sRGB",
    "-resize",
    `${width}x${height}!`,
    "-define",
    "heic:speed=4",
    "-quality",
    "55",
    avifPath,
  ]);
}

mkdirSync(CARD_DIR, { recursive: true });

if (CARD_SLUGS.length !== 78) {
  throw new Error(`Expected 78 card slugs, found ${CARD_SLUGS.length}`);
}

let converted = 0;

CARD_SLUGS.forEach((slug, index) => {
  const source = join(SOURCE_DIR, `${index}.png`);
  if (!existsSync(source)) {
    throw new Error(`Missing source image: ${source}`);
  }

  const before = existsSync(join(OUTPUT_DIR, `cards/${slug}.webp`))
    ? 0
    : statSync(source).size;
  optimize(source, `cards/${slug}`, 278, 408);
  if (before > 0) converted += 1;
});

const backSource = join(SOURCE_DIR, "back_cover.png");
if (existsSync(backSource)) {
  optimize(backSource, "back-cover", 488, 794);
}

const total = execFileSync("du", ["-sh", OUTPUT_DIR], { encoding: "utf8" }).trim();
console.log(`\nOptimized ${converted} new cards. Optimized asset total: ${total}`);
