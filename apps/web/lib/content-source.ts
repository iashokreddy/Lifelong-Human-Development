import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { CatalogEntry, Phase } from '@lhd/shared';
import { getPhase as fetchPhase, getPhases as fetchPhases, type Result } from './api';

/**
 * Server-only data source for the curriculum.
 *
 * - Default: delegates to the NestJS API (lib/api.ts).
 * - STATIC_EXPORT=true (GitHub Pages): reads packages/content directly at build
 *   time, so the exported site needs no backend. The curriculum JSON stays the
 *   single source of truth; no curriculum text is duplicated in app code.
 *
 * Only import this from server components / build-time code (it uses node:fs).
 */
const isStaticExport = process.env.STATIC_EXPORT === 'true';

function contentRoot(): string {
  // next build runs with cwd = apps/web; the monorepo root is two levels up.
  const candidates = [
    process.env.LHD_CONTENT_ROOT,
    resolve(process.cwd(), '..', '..', 'packages', 'content'),
    resolve(process.cwd(), 'packages', 'content'),
  ].filter((value): value is string => Boolean(value));
  const found = candidates.find((dir) => existsSync(join(dir, 'catalog.json')));
  if (!found) {
    throw new Error('Could not locate packages/content (catalog.json).');
  }
  return found;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function staticCatalog(): CatalogEntry[] {
  const root = contentRoot();
  const catalog = readJson<{ phases: (CatalogEntry & { file: string })[] }>(
    join(root, 'catalog.json'),
  );
  // Only expose phases that have actually been authored on disk.
  return [...catalog.phases]
    .filter((entry) => existsSync(join(root, entry.file)))
    .sort((a, b) => a.order - b.order);
}

export async function getPhases(): Promise<Result<CatalogEntry[]>> {
  if (!isStaticExport) {
    return fetchPhases();
  }
  try {
    return { ok: true, data: staticCatalog() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getPhase(idOrSlug: string): Promise<Result<Phase>> {
  if (!isStaticExport) {
    return fetchPhase(idOrSlug);
  }
  try {
    const root = contentRoot();
    const entry = staticCatalog().find(
      (candidate) => candidate.id === idOrSlug || candidate.slug === idOrSlug,
    ) as (CatalogEntry & { file: string }) | undefined;
    if (!entry) {
      return { ok: false, error: `Phase "${idOrSlug}" not found` };
    }
    return { ok: true, data: readJson<Phase>(join(root, entry.file)) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Params to pre-render for the dynamic /phases/[idOrSlug] route. Both slug and
 * id are emitted because assistant citations link by id.
 */
export function listPhaseParams(): { idOrSlug: string }[] {
  if (!isStaticExport) {
    return [];
  }
  return staticCatalog().flatMap((entry) => [
    { idOrSlug: entry.slug },
    { idOrSlug: entry.id },
  ]);
}
