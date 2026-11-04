import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { getContentRootOverride } from '../config/env';
import { Catalog, CatalogEntry, Phase } from '../shared/contract';

/**
 * Read-only loader and in-memory cache for the curriculum content.
 *
 * At module init the service resolves the content root (packages/content),
 * reads catalog.json, and loads every referenced phase.json that exists on
 * disk — mirroring the loader in tools/pdf/lib.mjs. It NEVER hardcodes the
 * phase list: phases 02..13 appear automatically as they are authored. Each
 * phase is defensively validated against the Phase shape; malformed or missing
 * phases are logged and skipped rather than crashing the app.
 */
@Injectable()
export class ContentService implements OnModuleInit {
  private readonly logger = new Logger(ContentService.name);

  private catalogEntries: CatalogEntry[] = [];
  private readonly phasesById = new Map<string, Phase>();
  private readonly phasesBySlug = new Map<string, Phase>();

  onModuleInit(): void {
    this.load();
  }

  /** The catalog entries, in catalog order. */
  getCatalogEntries(): CatalogEntry[] {
    return this.catalogEntries;
  }

  /** Look up a loaded phase by its id or its slug. Returns null if not found. */
  getPhase(idOrSlug: string): Phase | null {
    return this.phasesById.get(idOrSlug) ?? this.phasesBySlug.get(idOrSlug) ?? null;
  }

  /**
   * Resolve, read, validate and cache the catalog and all authored phases.
   * Safe to call more than once (clears and rebuilds the caches).
   */
  private load(): void {
    this.catalogEntries = [];
    this.phasesById.clear();
    this.phasesBySlug.clear();

    const contentRoot = this.resolveContentRoot();
    const catalogPath = join(contentRoot, 'catalog.json');

    let catalog: Catalog;
    try {
      catalog = this.readJson<Catalog>(catalogPath);
    } catch (error) {
      this.logger.error(`Failed to read catalog at ${catalogPath}: ${describe(error)}`);
      return;
    }

    if (!catalog || !Array.isArray(catalog.phases)) {
      this.logger.error(`Catalog at ${catalogPath} is malformed (missing phases[]); no content loaded.`);
      return;
    }

    const entries = [...catalog.phases].sort((a, b) => a.order - b.order);
    this.catalogEntries = entries;

    for (const entry of entries) {
      const file = join(contentRoot, entry.file);
      if (!existsSync(file)) {
        this.logger.warn(`Phase "${entry.id}" not yet authored (missing ${entry.file}); skipping.`);
        continue;
      }

      let phase: unknown;
      try {
        phase = this.readJson<unknown>(file);
      } catch (error) {
        this.logger.warn(`Phase "${entry.id}" could not be parsed (${entry.file}): ${describe(error)}; skipping.`);
        continue;
      }

      if (!isValidPhase(phase)) {
        this.logger.warn(`Phase "${entry.id}" (${entry.file}) failed shape validation; skipping.`);
        continue;
      }

      if (phase.id !== entry.id) {
        this.logger.warn(
          `Phase file ${entry.file} has id "${phase.id}" but catalog entry id is "${entry.id}"; skipping.`,
        );
        continue;
      }

      this.phasesById.set(phase.id, phase);
      this.phasesBySlug.set(phase.slug, phase);
    }

    this.logger.log(
      `Loaded ${this.phasesById.size} phase(s) of ${this.catalogEntries.length} catalog entries from ${contentRoot}.`,
    );
  }

  /**
   * Resolve the curriculum content root. Honours the LHD_CONTENT_ROOT override;
   * otherwise walks up from this module's directory (works from both dist and
   * src) to the directory that contains packages/content, mirroring the resolve
   * pattern in tools/pdf/lib.mjs.
   */
  private resolveContentRoot(): string {
    const override = getContentRootOverride();
    if (override) {
      return resolve(override);
    }

    let current = __dirname;
    // Walk up until packages/content is found, or we reach the filesystem root.
    for (let depth = 0; depth < 10; depth += 1) {
      const candidate = join(current, 'packages', 'content');
      if (existsSync(candidate)) {
        return candidate;
      }
      const parent = dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }

    // Fall back to the conventional monorepo layout relative to apps/api/<dist|src>/content.
    return resolve(__dirname, '..', '..', '..', '..', 'packages', 'content');
  }

  private readJson<T>(path: string): T {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Defensive structural validation of a loaded phase against the Phase contract.
 * Checks required scalar keys and that array-valued keys are arrays. It does not
 * deeply validate nested shapes — that is the job of the content schema gate
 * (tools/pdf) — it only guards the API from serving obviously malformed data.
 */
export function isValidPhase(value: unknown): value is Phase {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const phase = value as Record<string, unknown>;

  const requiredStrings = ['id', 'slug', 'title', 'primaryObjective', 'summary'];
  for (const key of requiredStrings) {
    if (typeof phase[key] !== 'string' || (phase[key] as string).length === 0) {
      return false;
    }
  }

  if (typeof phase.order !== 'number') {
    return false;
  }

  if (typeof phase.ageRange !== 'object' || phase.ageRange === null) {
    return false;
  }

  const requiredArrays = [
    'developmentDomains',
    'yearPlans',
    'milestones',
    'safety',
    'outcomes',
    'projects',
    'appFeatures',
    'sources',
  ];
  for (const key of requiredArrays) {
    if (!Array.isArray(phase[key])) {
      return false;
    }
  }

  return true;
}
