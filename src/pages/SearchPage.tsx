import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { logoutRemote } from '../api/auth';
import { fetchSearchData } from '../api/search';
import { effectiveTodoDateKey, normalizeDateKey, todoId } from '../lib/dateKey';
import type { LedgerDoc, NoteDoc, TodoDoc } from '../types/api';

function matchesBlob(blob: string, q: string) {
  return String(blob || '')
    .toLowerCase()
    .includes(q);
}

function blobTodoFromApi(t: TodoDoc) {
  return [t.title, t.completed ? '완료' : '진행', effectiveTodoDateKey(t)].join(' ');
}

function blobLedger(e: LedgerDoc) {
  const amt = e.amount != null ? String(e.amount) : '';
  return [e.category, e.memo, e.dateKey, amt, e.type].join(' ');
}

function blobNote(n: NoteDoc) {
  return [n.title, n.body].join(' ');
}

function formatMoney(n: number) {
  return `${Math.round(Number(n) || 0).toLocaleString('ko-KR')}원`;
}

function Highlight({ text, q }: { text: string; q: string }) {
  const t = String(text || '');
  const low = t.toLowerCase();
  const i = low.indexOf(q);
  const cap = 140;
  if (i < 0) {
    const s = t.slice(0, cap) + (t.length > cap ? '…' : '');
    return <>{s}</>;
  }
  const start = Math.max(0, i - 40);
  const chunk = t.slice(start, start + cap + q.length);
  const rel = i - start;
  return (
    <>
      {start > 0 ? '…' : null}
      {chunk.slice(0, rel)}
      <mark className="search-hit">{chunk.slice(rel, rel + q.length)}</mark>
      {chunk.slice(rel + q.length)}
      {start + chunk.length < t.length ? '…' : null}
    </>
  );
}

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qRaw = searchParams.get('q') || '';
  const q = qRaw.trim().toLowerCase();
  const [loading, setLoading] = useState(false);
  const [todos, setTodos] = useState<(TodoDoc & { id: string })[]>([]);
  const [ledger, setLedger] = useState<(LedgerDoc & { id: string })[]>([]);
  const [notes, setNotes] = useState<(NoteDoc & { id: string })[]>([]);

  useEffect(() => {
    if (!q) {
      setTodos([]);
      setLedger([]);
      setNotes([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const data = await fetchSearchData();

      if (cancelled) return;

      if ('unauthorized' in data) {
        await logoutRemote();
        navigate('/login', { replace: true });
        return;
      }

      const { todos: apiTodos, ledger: ledgerArr, notes: notesArr } = data;

      const nextTodos: (TodoDoc & { id: string })[] = [];
      const nextLedger: (LedgerDoc & { id: string })[] = [];
      const nextNotes: (NoteDoc & { id: string })[] = [];

      if (Array.isArray(apiTodos)) {
        apiTodos.forEach((t) => {
          const id = todoId(t);
          if (!id) return;
          if (matchesBlob(blobTodoFromApi(t), q)) nextTodos.push({ id, ...t });
        });
      }
      if (Array.isArray(ledgerArr)) {
        ledgerArr.forEach((e) => {
          const id = String(e._id);
          if (matchesBlob(blobLedger(e), q)) nextLedger.push({ id, ...e });
        });
      }
      if (Array.isArray(notesArr)) {
        notesArr.forEach((n) => {
          const id = String(n._id);
          if (matchesBlob(blobNote(n), q)) nextNotes.push({ id, ...n });
        });
      }

      if (!cancelled) {
        setTodos(nextTodos);
        setLedger(nextLedger);
        setNotes(nextNotes);
      }
    })().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [q, navigate]);

  const hasAny = todos.length + ledger.length + notes.length > 0;

  return (
    <>
      <header className="content-head">
        <h1 className="content-head__title">검색</h1>
        <p className="content-head__sub">할 일·가계부·노트를 한 번에 찾습니다.</p>
      </header>

      <main className="app-main search-main">
        <div className="search-results" id="searchResults">
          {!q ? (
            <p className="search-empty">
              키워드를 입력해 보세요. 할 일 제목, 가계부 카테고리·메모·금액, 노트 제목·본문이 검색됩니다.
            </p>
          ) : loading ? (
            <p className="search-loading">검색 중…</p>
          ) : !hasAny ? (
            <p className="search-empty">
              「<strong>{qRaw.trim()}</strong>」에 맞는 결과가 없습니다.
            </p>
          ) : (
            <>
              {todos.length > 0 ? (
                <section className="search-section">
                  <h2 className="search-section__title">
                    할 일 <span className="search-count">{todos.length}</span>
                  </h2>
                  <ul className="search-list">
                    {todos.map((t) => {
                      const dk = normalizeDateKey(effectiveTodoDateKey(t));
                      const to = dk ? `/app?date=${encodeURIComponent(dk)}` : '/app';
                      const metaLine = dk
                        ? `${dk} · ${t.completed ? '완료' : '진행'} · 할 일`
                        : `${t.completed ? '완료' : '진행'} · 할 일`;
                      return (
                        <li key={t.id} className="search-row">
                          <Link className="search-row__link" to={to}>
                            {t.title || '(제목 없음)'}
                          </Link>
                          <span className="search-row__meta">{metaLine}</span>
                          <p className="search-row__snip" />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              {ledger.length > 0 ? (
                <section className="search-section">
                  <h2 className="search-section__title">
                    가계부 <span className="search-count">{ledger.length}</span>
                  </h2>
                  <ul className="search-list">
                    {ledger.map((e) => {
                      const typ = e.type === 'income' ? '수입' : '지출';
                      const line = `${typ} · ${e.category || ''} · ${formatMoney(e.amount)} · ${e.dateKey}`;
                      const dateQ = encodeURIComponent(String(e.dateKey || '').trim());
                      const to = dateQ ? `/account?date=${dateQ}` : '/account';
                      return (
                        <li key={e.id} className="search-row">
                          <Link className="search-row__link" to={to}>
                            {line}
                          </Link>
                          <span className="search-row__meta">가계부</span>
                          <p className="search-row__snip">
                            <Highlight text={e.memo || ''} q={q} />
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              {notes.length > 0 ? (
                <section className="search-section">
                  <h2 className="search-section__title">
                    노트 <span className="search-count">{notes.length}</span>
                  </h2>
                  <ul className="search-list">
                    {notes.map((n) => (
                      <li key={n.id} className="search-row">
                        <Link className="search-row__link" to="/notes">
                          {n.title || '(제목 없음)'}
                        </Link>
                        <span className="search-row__meta">노트</span>
                        <p className="search-row__snip">
                          <Highlight text={n.body || ''} q={q} />
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          )}
        </div>
      </main>
    </>
  );
}
