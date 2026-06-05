/**
 * The Render backend URL. Hardcoded for production reliability.
 * For local dev, override with VITE_API_URL env var pointing to localhost.
 */
// API calls go to the same origin — Vercel proxies /api/* to Render
const _base = "";

export function apiUrl(path: string): string {
  return `${_base}${path}`;
}

export const API_BASE = _base;
