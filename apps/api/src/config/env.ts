/**
 * Typed environment accessors for the LHD API.
 *
 * Reads from process.env with safe defaults so the app builds, boots, and tests
 * without a database, network, or secrets. DATABASE_URL being unset is the signal
 * that selects the in-memory persistence implementation (see PersistenceModule).
 */

/** Development-only default JWT secret. Override via JWT_SECRET in any real deployment. */
export const DEV_JWT_SECRET = 'lhd-dev-insecure-secret-change-me';

/** PostgreSQL connection string, or undefined to use in-memory persistence. */
export function getDatabaseUrl(): string | undefined {
  const value = process.env.DATABASE_URL;
  return value && value.trim().length > 0 ? value : undefined;
}

/** True when a database URL is configured (Prisma persistence is selected). */
export function hasDatabaseUrl(): boolean {
  return getDatabaseUrl() !== undefined;
}

/** Secret used to sign/verify JWTs. Falls back to a development default. */
export function getJwtSecret(): string {
  const value = process.env.JWT_SECRET;
  return value && value.trim().length > 0 ? value : DEV_JWT_SECRET;
}

/** Optional override for the curriculum content root (packages/content). */
export function getContentRootOverride(): string | undefined {
  const value = process.env.LHD_CONTENT_ROOT;
  return value && value.trim().length > 0 ? value : undefined;
}

/** HTTP port the API listens on. Default 3001. */
export function getPort(): number {
  const raw = process.env.PORT;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3001;
}
