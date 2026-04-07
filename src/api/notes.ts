import { apiFetch, readError } from './client';
import type { NoteDoc } from '../types/api';

export async function listNotes(): Promise<NoteDoc[]> {
  const res = await apiFetch('/notes');
  if (res.status === 401) return [];
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as NoteDoc[]) : [];
}

export async function createNote(body: { title: string; body: string }) {
  const res = await apiFetch('/notes', { method: 'POST', body });
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<NoteDoc>;
}

export async function updateNote(id: string, body: { title: string; body: string }) {
  const res = await apiFetch(`/notes/${encodeURIComponent(id)}`, { method: 'PATCH', body });
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<NoteDoc>;
}

export async function deleteNote(id: string) {
  const res = await apiFetch(`/notes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.status === 204) return;
  if (!res.ok) throw new Error(await readError(res));
}
