/**
 * Resolves an API path to an absolute URL.
 *
 * In production (Vercel), VITE_API_URL points to the Render backend.
 * In local development, VITE_API_URL is empty so calls go to the same host.
 *
 * Usage: apiUrl("/api/admin/login")
 */
const _base = (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/+$/, "") ?? "";

export function apiUrl(path: string): string {
  return `${_base}${path}`;
}

export const API_BASE = _base;
