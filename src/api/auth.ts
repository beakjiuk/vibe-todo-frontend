import { apiFetch, clearLocalUser, readError, setSessionUser } from './client';
import type { PublicUser } from '../types/api';

export async function fetchMe(): Promise<PublicUser | null> {
  const res = await apiFetch('/auth/me');
  if (!res.ok) {
    clearLocalUser();
    return null;
  }
  const me = (await res.json()) as PublicUser;
  setSessionUser(me);
  return me;
}

export async function logoutRemote() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    /* 네트워크 실패해도 로컬은 정리 */
  }
  clearLocalUser();
}

export async function deleteAccount(password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await apiFetch('/auth/account', { method: 'DELETE', body: { password } });
  if (res.status === 204) return { ok: true };
  return { ok: false, error: await readError(res) };
}
