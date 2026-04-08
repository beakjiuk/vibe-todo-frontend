import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createLedgerEntry, deleteLedgerEntry, listLedger } from '../api/ledger';
import { normalizeDateKey, parseKey, toKey, todayKey } from '../lib/dateKey';
import type { LedgerDoc } from '../types/api';
import { Toast } from '../components/Toast';

const CAT_INCOME = ['급여', '용돈', '부수입', '이자·배당', '기타'];
const CAT_EXPENSE = ['식비', '교통', '쇼핑', '문화·여가', '의료', '통신', '구독', '기타'];

function formatMoney(n: number) {
  const v = Math.round(Number(n) || 0);
  return `${v.toLocaleString('ko-KR')}원`;
}

export function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allLedger, setAllLedger] = useState<Record<string, LedgerDoc & { id: string }>>({});
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [view, setView] = useState(() => new Date());
  const [selectedKey, setSelectedKey] = useState(() => todayKey());
  const [modalOpen, setModalOpen] = useState(false);
  const [ledgerType, setLedgerType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('기타');
  const [ledgerDate, setLedgerDate] = useState(selectedKey);
  const [memo, setMemo] = useState('');
  const [savingEntry, setSavingEntry] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2200);
  };

  useEffect(() => {
    const q = searchParams.get('date');
    const normalized = normalizeDateKey(q);
    if (!normalized) return;
    setSelectedKey(normalized);
    const d = parseKey(normalized);
    setView(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [searchParams]);

  const categories = ledgerType === 'income' ? CAT_INCOME : CAT_EXPENSE;

  useEffect(() => {
    const list = ledgerType === 'income' ? CAT_INCOME : CAT_EXPENSE;
    setCategory((c) => (list.includes(c) ? c : list[0] ?? '기타'));
  }, [ledgerType]);

  const loadLedger = useCallback(async () => {
    setLoadingLedger(true);
    try {
      const arr = await listLedger();
      const next: Record<string, LedgerDoc & { id: string }> = {};
      for (const e of arr) {
        const id = String(e._id);
        next[id] = {
          id,
          type: e.type,
          amount: e.amount,
          category: e.category,
          dateKey: e.dateKey,
          memo: e.memo,
          createdAt: e.createdAt,
        };
      }
      setAllLedger(next);
    } catch (e) {
      showToast(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.');
    } finally {
      setLoadingLedger(false);
    }
  }, []);

  useEffect(() => {
    void loadLedger();
  }, [loadLedger]);

  const dayTotals = useCallback(
    (dateKey: string) => {
      const want = normalizeDateKey(dateKey);
      let inc = 0;
      let exp = 0;
      Object.values(allLedger).forEach((e) => {
        if (!e || normalizeDateKey(e.dateKey) !== want) return;
        const n = Math.round(Number(e.amount) || 0);
        if (e.type === 'income') inc += n;
        else exp += n;
      });
      return { inc, exp, net: inc - exp };
    },
    [allLedger],
  );

  const monthTotals = useMemo(() => {
    const y = view.getFullYear();
    const m = view.getMonth();
    let inc = 0;
    let exp = 0;
    Object.values(allLedger).forEach((e) => {
      if (!e?.dateKey) return;
      const [ty, tm] = e.dateKey.split('-').map(Number);
      if (ty !== y || tm - 1 !== m) return;
      const n = Math.round(Number(e.amount) || 0);
      if (e.type === 'income') inc += n;
      else exp += n;
    });
    return { inc, exp, net: inc - exp };
  }, [allLedger, view]);

  const entriesForDate = useCallback(
    (dateKey: string) => {
      const want = normalizeDateKey(dateKey);
      return Object.values(allLedger)
        .filter((e) => normalizeDateKey(e.dateKey) === want)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    },
    [allLedger],
  );

  const calendarCells = useMemo(() => {
    const y = view.getFullYear();
    const m = view.getMonth();
    const first = new Date(y, m, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevDays = new Date(y, m, 0).getDate();
    const today = new Date();
    const selectedNorm = normalizeDateKey(selectedKey);

    const leading: { kind: 'other'; day: number }[] = [];
    for (let i = 0; i < startWeekday; i++) {
      leading.push({ kind: 'other', day: prevDays - startWeekday + i + 1 });
    }

    const current: { kind: 'current'; dateKey: string; d: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      current.push({ kind: 'current', dateKey, d });
    }

    const cells = [...leading, ...current];
    const remainder = cells.length % 7;
    const trailing: { kind: 'other'; day: number }[] = [];
    if (remainder !== 0) {
      for (let d = 1; d <= 7 - remainder; d++) trailing.push({ kind: 'other', day: d });
    }
    return { cells: [...cells, ...trailing], today, selectedNorm, y, m };
  }, [view, selectedKey]);

  const openModal = () => {
    setLedgerDate(selectedKey);
    setModalOpen(true);
  };

  const onSubmitLedger = async (e: FormEvent) => {
    e.preventDefault();
    const type = ledgerType;
    const amt = Math.round(Number(amount));
    if (!amt || amt < 1) return;
    setSavingEntry(true);
    let saved = false;
    try {
      await createLedgerEntry({
        type,
        amount: amt,
        category,
        dateKey: ledgerDate,
        memo,
      });
      saved = true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : '저장하지 못했습니다.');
    } finally {
      setSavingEntry(false);
    }
    if (!saved) return;
    const dk = normalizeDateKey(ledgerDate) || ledgerDate;
    setSelectedKey(dk);
    const p = parseKey(dk);
    setView(new Date(p.getFullYear(), p.getMonth(), 1));
    setSearchParams(dk !== todayKey() ? { date: dk } : {});
    setModalOpen(false);
    setAmount('');
    setMemo('');
    showToast('저장했습니다.');
    await loadLedger();
  };

  const items = entriesForDate(selectedKey);
  const dayLabel = parseKey(selectedKey).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const { inc: mi, exp: me, net: mn } = monthTotals;

  return (
    <>
      <header className="content-head">
        <h1 className="content-head__title">가계부</h1>
        <p className="content-head__sub">달력에서 날짜를 고른 뒤 수입·지출을 기록합니다.</p>
      </header>

      <main className="app-main">
        <div className="ledger-month-bar" id="ledgerMonthBar">
          <div className="ledger-stat">
            <span className="ledger-stat__label">이번 달 수입</span>
            <strong className="ledger-stat__val ledger-stat__val--in">
              {loadingLedger ? <span className="skel skel-line skel-line--lg" style={{ width: 110 }} /> : formatMoney(mi)}
            </strong>
          </div>
          <div className="ledger-stat">
            <span className="ledger-stat__label">이번 달 지출</span>
            <strong className="ledger-stat__val ledger-stat__val--out">
              {loadingLedger ? <span className="skel skel-line skel-line--lg" style={{ width: 110 }} /> : formatMoney(me)}
            </strong>
          </div>
          <div className="ledger-stat">
            <span className="ledger-stat__label">순액</span>
            <strong
              className={`ledger-stat__val ledger-stat__val--net${mn < 0 ? ' ledger-stat__val--net-neg' : ''}`}
            >
              {loadingLedger ? (
                <span className="skel skel-line skel-line--lg" style={{ width: 130 }} />
              ) : (
                (mn >= 0 ? '+' : '−') + formatMoney(Math.abs(mn))
              )}
            </strong>
          </div>
        </div>

        <div className="cal-card ledger-cal">
          <div className="cal-head">
            <h2>{view.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</h2>
            <div className="cal-nav">
              <button
                type="button"
                aria-label="이전 달"
                onClick={() => {
                  const v = new Date(view.getFullYear(), view.getMonth() - 1, 1);
                  setView(v);
                  setSelectedKey(toKey(v));
                }}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="다음 달"
                onClick={() => {
                  const v = new Date(view.getFullYear(), view.getMonth() + 1, 1);
                  setView(v);
                  setSelectedKey(toKey(v));
                }}
              >
                ›
              </button>
            </div>
          </div>
          <div className="cal-weekdays">
            <span>일</span>
            <span>월</span>
            <span>화</span>
            <span>수</span>
            <span>목</span>
            <span>금</span>
            <span>토</span>
          </div>
          <div className="cal-grid ledger-cal-grid">
            {calendarCells.cells.map((cell, idx) => {
              if (cell.kind === 'other') {
                return (
                  <button key={`o-${idx}`} type="button" className="cal-cell other-month" tabIndex={-1}>
                    <span className="cal-day-num">{cell.day}</span>
                  </button>
                );
              }
              const { dateKey, d } = cell;
              const { net } = dayTotals(dateKey);
              const sub =
                net !== 0 ? (
                  <span
                    className={`ledger-cell-net ${net >= 0 ? 'ledger-cell-net--in' : 'ledger-cell-net--out'}`}
                  >
                    {net >= 0 ? '+' : '−'}
                    {Math.abs(net) >= 10000
                      ? `${(Math.abs(net) / 10000).toFixed(Math.abs(net) % 10000 === 0 ? 0 : 1)}만`
                      : Math.abs(net).toLocaleString('ko-KR')}
                  </span>
                ) : null;
              const isToday =
                calendarCells.y === calendarCells.today.getFullYear() &&
                calendarCells.m === calendarCells.today.getMonth() &&
                d === calendarCells.today.getDate();
              return (
                <button
                  key={dateKey}
                  type="button"
                  className={`cal-cell ledger-cal-cell${isToday ? ' today' : ''}${
                    dateKey === calendarCells.selectedNorm ? ' selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedKey(dateKey);
                    setSearchParams(dateKey !== todayKey() ? { date: dateKey } : {});
                  }}
                >
                  <span className="cal-day-num">{d}</span>
                  {sub ? <span className="ledger-cell-wrap">{sub}</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <section className="task-card ledger-day-card">
            <h3>내역 · {dayLabel}</h3>
            <ul className="ledger-list" id="ledgerList">
              {loadingLedger
                ? Array.from({ length: 6 }).map((_, i) => (
                    <li key={`sk-${i}`} className="ledger-item" aria-hidden>
                      <span className="skel skel-line" style={{ width: 56, height: 22, borderRadius: 999 }} />
                      <div className="ledger-item__body">
                        <div className="skel skel-line skel-line--lg" style={{ width: `${52 + i * 6}%` }} />
                        <div className="skel skel-line skel-line--sm" style={{ width: `${40 + i * 4}%`, marginTop: 8 }} />
                      </div>
                      <div className="skel skel-line skel-line--lg" style={{ width: 96 }} />
                      <div className="ledger-item__actions" style={{ opacity: 0.7 }}>
                        <span className="skel skel-block" style={{ width: 48, height: 30, borderRadius: 10 }} />
                      </div>
                    </li>
                  ))
                : items.map((e) => (
                    <li key={e.id} className="ledger-item">
                      <span
                        className={`ledger-item__tag ${e.type === 'income' ? 'ledger-item__tag--in' : 'ledger-item__tag--out'}`}
                      >
                        {e.type === 'income' ? '수입' : '지출'}
                      </span>
                      <div className="ledger-item__body">
                        <div className="ledger-item__cat">{e.category || '기타'}</div>
                        <div className="ledger-item__memo">{e.memo ? String(e.memo).slice(0, 80) : ' '}</div>
                      </div>
                      <div
                        className={`ledger-item__amt ${
                          e.type === 'income' ? 'ledger-item__amt--in' : 'ledger-item__amt--out'
                        }`}
                      >
                        {(e.type === 'income' ? '+' : '−') + formatMoney(Math.round(Number(e.amount) || 0))}
                      </div>
                      <div className="ledger-item__actions">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm('이 내역을 삭제할까요?')) return;
                            try {
                              await deleteLedgerEntry(e.id);
                              showToast('삭제했습니다.');
                              await loadLedger();
                            } catch (err) {
                              showToast(err instanceof Error ? err.message : '삭제하지 못했습니다.');
                            }
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </li>
                  ))}
            </ul>
            {!loadingLedger && items.length === 0 ? (
              <p className="empty-hint" id="ledgerEmptyHint">
                이 날짜에는 내역이 없습니다.
              </p>
            ) : null}
            <button type="button" className="btn-add" id="btnAddLedger" onClick={openModal}>
              내역 추가
            </button>
          </section>
        </div>
      </main>

      <div
        className={`modal-backdrop${modalOpen ? ' open' : ''}`}
        role="presentation"
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) setModalOpen(false);
        }}
      >
        <div className="modal" role="dialog" aria-modal>
          <h3>내역 추가</h3>
          <form onSubmit={(e) => void onSubmitLedger(e)}>
            <div className="modal-field">
              <label htmlFor="ledgerType">유형</label>
              <select
                id="ledgerType"
                value={ledgerType}
                onChange={(e) => setLedgerType(e.target.value === 'income' ? 'income' : 'expense')}
              >
                <option value="expense">지출</option>
                <option value="income">수입</option>
              </select>
            </div>
            <div className="modal-field">
              <label htmlFor="ledgerCategory">카테고리</label>
              <select
                id="ledgerCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-field">
              <label htmlFor="ledgerAmount">금액</label>
              <input
                id="ledgerAmount"
                type="number"
                min={1}
                step={1}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label htmlFor="ledgerDate">날짜</label>
              <input
                id="ledgerDate"
                type="date"
                required
                value={ledgerDate}
                onChange={(e) => setLedgerDate(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label htmlFor="ledgerMemo">메모</label>
              <input id="ledgerMemo" value={memo} onChange={(e) => setMemo(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setModalOpen(false)}>
                취소
              </button>
              <button type="submit" className="primary" disabled={savingEntry}>
                <span className="btn-skel">
                  {savingEntry ? <span className="skel btn-skel__bar" aria-hidden /> : null}
                  <span style={savingEntry ? { opacity: 0.92 } : undefined}>{savingEntry ? '저장 중' : '저장'}</span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <Toast message={toast} />
    </>
  );
}
