import { apiFetch, readError } from './client';
import type { PublicUser } from '../types/api';

export async function updateProfile(body: { nickname: string; photoURL: string }): Promise<PublicUser> {
  const res = await apiFetch('/profile', { method: 'PATCH', body });
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<PublicUser>;
}
