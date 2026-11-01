import type { CatalogEntry, Phase, UserRole } from '@lhd/shared';

/**
 * Base URL for the NestJS API. Defaults to the local dev server. The web app
 * reads this from the environment so deployments can point at a real backend.
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

/**
 * Discriminated result returned by every API call. API calls NEVER throw: a
 * network failure or non-2xx response resolves to { ok: false, error } so that
 * `next build` and server components cannot crash when the API is unavailable.
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Shape of the AI assistant response. Mirrors apps/api ai.service.ts; defined
 * locally so the web app does not import from apps/api.
 */
export interface AskResult {
  answer: string;
  routedToHuman: boolean;
  citations: { phaseId: string; citation: string }[];
}

interface RegisterPayload {
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unknown error';
}

/**
 * Perform a fetch and decode JSON into a Result. Always uses no-store so data
 * pages are rendered fresh and never cached at build time.
 */
async function request<T>(url: string, init?: RequestInit): Promise<Result<T>> {
  try {
    const response = await fetch(url, { cache: 'no-store', ...init });
    if (!response.ok) {
      return {
        ok: false,
        error: `Request to ${url} failed with status ${response.status}`,
      };
    }
    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function getPhases(): Promise<Result<CatalogEntry[]>> {
  return request<CatalogEntry[]>(`${API_BASE}/phases`);
}

export async function getPhase(idOrSlug: string): Promise<Result<Phase>> {
  return request<Phase>(`${API_BASE}/phases/${idOrSlug}`);
}

export async function askAssistant(
  question: string,
  token?: string,
): Promise<Result<AskResult>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return request<AskResult>(`${API_BASE}/ai/ask`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ question }),
  });
}

export async function login(
  email: string,
  password: string,
): Promise<Result<{ accessToken: string }>> {
  return request<{ accessToken: string }>(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  payload: RegisterPayload,
): Promise<Result<{ accessToken: string }>> {
  return request<{ accessToken: string }>(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
