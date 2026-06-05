/**
 * The Render backend URL. Hardcoded for production reliability.
 * For local dev, override with VITE_API_URL env var pointing to localhost.
 */
const _base = (
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://kalakendra-api.onrender.com"
).replace(/\/+$/, "");

export function apiUrl(path: string): string {
  return `${_base}${path}`;
}

export const API_BASE = _base;
