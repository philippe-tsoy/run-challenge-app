/**
 * Download journey images into public/journey/
 * Run: node scripts/fetch-journey-images.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "journey");

const FILES = {
  "hobbiton.jpg":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=85",
  "buckland.jpg":
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=85",
  "old-forest.jpg":
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=85",
  "bree.jpg":
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85",
  "weathertop.jpg":
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85",
  "ford-of-bruinen.jpg":
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=85",
  "rivendell.jpg":
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85",
};

async function main() {
  await mkdir(outDir, { recursive: true });

  for (const [filename, url] of Object.entries(FILES)) {
    const response = await fetch(url, {
      headers: { "User-Agent": "RunChallengePWA/1.0" },
    });
    if (!response.ok) {
      throw new Error(`${filename}: HTTP ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(path.join(outDir, filename), buffer);
    console.log(`Saved ${filename}`);
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
