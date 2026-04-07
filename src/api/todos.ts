import { apiFetch, readError } from './client';
import { normalizeDateKey } from '../lib/dateKey';
import type { TodoDoc } from '../types/api';

export async function listTodos(): Promise<TodoDoc[]> {
  const res = await apiFetch('/todos');
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as TodoDoc[]) : [];
}

export async function createTodo(title: string, dateKey: string | undefined) {
  const body: { title: string; dateKey?: string } = { title };
  const dk = normalizeDateKey(dateKey || '');
  if (dk) body.dateKey = dk;
  const res = await apiFetch('/todos', { method: 'POST', body });
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<TodoDoc>;
}

export async function updateTodo(
  id: string,
  body: Partial<{ title: string; completed: boolean; dateKey: string }>,
) {
  const res = await apiFetch(`/todos/${encodeURIComponent(id)}`, { method: 'PATCH', body });
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<TodoDoc>;
}

export async function deleteTodo(id: string) {
  const res = await apiFetch(`/todos/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.status === 204) return;
  if (!res.ok) throw new Error(await readError(res));
}
