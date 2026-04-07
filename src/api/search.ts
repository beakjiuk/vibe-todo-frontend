import { apiFetch } from './client';
import type { LedgerDoc, NoteDoc, TodoDoc } from '../types/api';

export type SearchDataResult =
  | { unauthorized: true }
  | { todos: TodoDoc[]; ledger: LedgerDoc[]; notes: NoteDoc[] };

/** 검색용: 할 일·가계부·노트를 한 번에 가져옴 (401 시 unauthorized) */
export async function fetchSearchData(): Promise<SearchDataResult> {
  const [tRes, lRes, nRes] = await Promise.all([
    apiFetch('/todos'),
    apiFetch('/ledger'),
    apiFetch('/notes'),
  ]);

  if (tRes.status === 401 || lRes.status === 401 || nRes.status === 401) {
    return { unauthorized: true };
  }

  const apiTodos = tRes.ok ? ((await tRes.json()) as TodoDoc[]) : [];
  const ledgerArr = lRes.ok ? ((await lRes.json()) as LedgerDoc[]) : [];
  const notesArr = nRes.ok ? ((await nRes.json()) as NoteDoc[]) : [];

  return {
    todos: Array.isArray(apiTodos) ? apiTodos : [],
    ledger: Array.isArray(ledgerArr) ? ledgerArr : [],
    notes: Array.isArray(notesArr) ? notesArr : [],
  };
}
