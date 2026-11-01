#!/usr/bin/env node
// Validates the phase catalog and every existing phase.json against the JSON Schemas.
// Exits non-zero if anything is invalid so it can gate CI and `npm test`.
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { loadCatalog, loadPhases, loadPhaseSchema, readJson, schemaRoot } from "./lib.mjs";
import { join } from "node:path";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const phaseSchema = loadPhaseSchema();
const catalogSchema = readJson(join(schemaRoot, "catalog.schema.json"));

const validatePhase = ajv.compile(phaseSchema);
const validateCatalog = ajv.compile(catalogSchema);

let errors = 0;
let authored = 0;

const catalog = loadCatalog();
if (!validateCatalog(catalog)) {
  errors++;
  console.error("✖ catalog.json is invalid:");
  for (const e of validateCatalog.errors) console.error(`   ${e.instancePath} ${e.message}`);
} else {
  console.log(`✓ catalog.json valid (${catalog.phases.length} phases indexed)`);
}

for (const { entry, phase, file } of loadPhases()) {
  if (!phase) {
    console.log(`… ${entry.id} not yet authored (${entry.file})`);
    continue;
  }
  if (!validatePhase(phase)) {
    errors++;
    console.error(`✖ ${entry.id} (${file}) is invalid:`);
    for (const e of validatePhase.errors) console.error(`   ${e.instancePath} ${e.message}`);
  } else {
    if (phase.id !== entry.id) {
      errors++;
      console.error(`✖ ${entry.id}: phase.id "${phase.id}" does not match catalog id`);
    } else {
      authored++;
      console.log(`✓ ${entry.id} valid — "${phase.title}"`);
    }
  }
}

console.log(`\n${authored} phase(s) authored and valid, ${errors} error(s).`);
process.exit(errors > 0 ? 1 : 0);
