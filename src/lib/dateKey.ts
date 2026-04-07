import type { TodoDoc } from '../types/api';

export function normalizeDateKey(s: string | undefined | null): string {
  const t = String(s || '').trim();
  const m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return '';
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const day = Number(m[3]);
  if (mo < 1 || mo > 12 || day < 1 || day > 31) return '';
  const test = new Date(y, mo - 1, day);
  if (test.getFullYear() !== y || test.getMonth() !== mo - 1 || test.getDate() !== day) return '';
  return `${y}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function effectiveTodoDateKey(t: TodoDoc | undefined | null): string {
  const dk = normalizeDateKey(t?.dateKey);
  if (dk) return dk;
  if (t?.createdAt) {
    const d = new Date(t.createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return '';
}

export function todoId(t: TodoDoc | { _id?: unknown } | null | undefined): string {
  if (!t || t._id == null) return '';
  return String(t._id);
}

export function todayKey(): string {
  const d = new Date();
  return toKey(d);
}

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
