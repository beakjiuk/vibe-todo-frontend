import { apiFetch, readError } from './client';
import type { LedgerDoc } from '../types/api';

export async function listLedger(): Promise<LedgerDoc[]> {
  const res = await apiFetch('/ledger');
  if (res.status === 401) return [];
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as LedgerDoc[]) : [];
}

export async function createLedgerEntry(body: {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  dateKey: string;
  memo: string;
}) {
  const res = await apiFetch('/ledger', { method: 'POST', body });
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<LedgerDoc>;
}

export async function deleteLedgerEntry(id: string) {
  const res = await apiFetch(`/ledger/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.status === 204) return;
  if (!res.ok) throw new Error(await readError(res));
}
