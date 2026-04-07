import { API_BASE } from '../config';
import type { PublicUser } from '../types/api';

/** 이전 버전 localStorage JWT 제거 (HttpOnly 쿠키로 전환) */
const LEGACY_TOKEN_KEY = 'todoApp.token';
const USER_KEY = 'todoApp.user';

function stripLegacyToken() {
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

stripLegacyToken();

export function getSessionUser(): PublicUser | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as unknown;
    if (!u || typeof u !== 'object') return null;
    return u as PublicUser;
  } catch {
    return null;
  }
}

export function setSessionUser(user: PublicUser) {
  try {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* quota */
  }
}

export function clearLocalUser() {
  try {
    sessionStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

export async function apiFetch(
  path: string,
  opts: Omit<RequestInit, 'body'> & { body?: unknown } = {},
) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(opts.headers || {});
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  let body: BodyInit | undefined | null = opts.body as BodyInit | undefined | null;
  if (
    body != null &&
    typeof body === 'object' &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams)
  ) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }
  const credentials = opts.credentials ?? 'include';
  return fetch(url, { ...opts, headers, body, credentials });
}

export async function readError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: string };
    return j.error || res.statusText;
  } catch {
    return res.statusText;
  }
}

