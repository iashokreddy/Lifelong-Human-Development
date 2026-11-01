// Shared helpers for content tooling.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Repository root (two levels up from tools/pdf). */
export const repoRoot = resolve(__dirname, "..", "..");
export const contentRoot = join(repoRoot, "packages", "content");
export const schemaRoot = join(contentRoot, "schema");

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function loadCatalog() {
  return readJson(join(contentRoot, "catalog.json"));
}

/** Load every phase.json that actually exists on disk, in catalog order. */
export function loadPhases() {
  const catalog = loadCatalog();
  const phases = [];
  for (const entry of catalog.phases.sort((a, b) => a.order - b.order)) {
    const file = join(contentRoot, entry.file);
    if (existsSync(file)) {
      phases.push({ entry, phase: readJson(file), file });
    } else {
      phases.push({ entry, phase: null, file });
    }
  }
  return phases;
}

export function loadPhaseSchema() {
  return readJson(join(schemaRoot, "phase.schema.json"));
}
