import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createTodo, deleteTodo, listTodos, updateTodo } from '../api/todos';
import {
  effectiveTodoDateKey,
  normalizeDateKey,
  parseKey,
  todoId,
  toKey,
  todayKey,
} from '../lib/dateKey';
import type { TodoDoc } from '../types/api';
import { Toast } from '../components/Toast';
import { API_BASE } from '../config';

const TODO_API_LABEL = 'REST API';

export function TodosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allTodos, setAllTodos] = useState<TodoDoc[]>([]);
  const [view, setView] = useState(() => new Date());
  const [selectedKey, setSelectedKey] = useState(() => todayKey());
  const [apiStatus, setApiStatus] = useState('');
  const [apiErr, setApiErr] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDate, setModalDate] = useState(selectedKey);
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

  const loadTodos = useCallback(async () => {
    setApiStatus('할 일 불러오는 중…');
    setApiErr(false);
    try {
      const list = await listTodos();
      setAllTodos(list);
      setApiStatus(`전체 ${list.length}건 · ${TODO_API_LABEL}`);
    } catch (e) {
      console.error(e);
      setAllTodos([]);
      setApiStatus(e instanceof Error ? e.message : '서버에 연결할 수 없습니다.');
      setApiErr(true);
      showToast('할 일 목록을 불러오지 못했습니다.');
    }
  }, []);

  useEffect(() => {
    void loadTodos();
  }, [loadTodos]);

  const todosForDay = useCallback(
    (dateKey: string) => {
      const want = normalizeDateKey(dateKey);
      return allTodos
        .filter((t) => effectiveTodoDateKey(t) === want)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    },
    [allTodos],
  );

  const countForDay = useCallback(
    (dateKey: string) => todosForDay(dateKey).length,
    [todosForDay],
  );

  const pendingCountForDay = useCallback(
    (dateKey: string) => todosForDay(dateKey).filter((t) => !t.completed).length,
    [todosForDay],
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

  const openModalAdd = () => {
    setEditingId(null);
    setModalTitle('');
    setModalDate(selectedKey);
    setModalOpen(true);
  };

  const openModalEdit = (t: TodoDoc) => {
    setEditingId(todoId(t));
    setModalTitle(t.title ?? '');
    setModalDate(effectiveTodoDateKey(t) || selectedKey);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const onModalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const title = modalTitle.trim();
    const dk = normalizeDateKey(modalDate);
    if (!title) return;
    if (!dk) {
      showToast('날짜를 선택해 주세요.');
      return;
    }
    try {
      if (editingId) {
        await updateTodo(editingId, { title, dateKey: dk });
        showToast('수정했습니다.');
      } else {
        await createTodo(title, dk);
        showToast('저장했습니다.');
      }
      setSelectedKey(dk);
      const p = parseKey(dk);
      setView(new Date(p.getFullYear(), p.getMonth(), 1));
      setSearchParams(dk !== todayKey() ? { date: dk } : {});
      closeModal();
      await loadTodos();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '저장하지 못했습니다.');
    }
  };

  const dayLabel = parseKey(selectedKey).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const todos = todosForDay(selectedKey);

  return (
    <>
      <header className="content-head">
        <h1 className="content-head__title">할 일</h1>
        <p className="content-head__sub">
          달력에서 날짜를 고른 뒤 그날 할 일을 관리합니다. 데이터는{' '}
          <code>{API_BASE}</code> · MongoDB에 저장됩니다.
        </p>
      </header>

      <main className="app-main">
        <div className="cal-card todo-cal">
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
          <div className="cal-grid todo-cal-grid">
            {calendarCells.cells.map((cell, idx) => {
              if (cell.kind === 'other') {
                return (
                  <button key={`o-${idx}`} type="button" className="cal-cell other-month" tabIndex={-1}>
                    <span className="cal-day-num">{cell.day}</span>
                  </button>
                );
              }
              const { dateKey, d } = cell;
              const total = countForDay(dateKey);
              const pending = pendingCountForDay(dateKey);
              const sub =
                total > 0 ? (
                  <span
                    className={`todo-cell-count${pending === 0 ? ' todo-cell-count--done' : ''}`}
                  >
                    {pending > 0 ? `${pending}/${total}` : `${total}✓`}
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
                  className={`cal-cell todo-cal-cell${isToday ? ' today' : ''}${
                    dateKey === calendarCells.selectedNorm ? ' selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedKey(dateKey);
                    setSearchParams(dateKey !== todayKey() ? { date: dateKey } : {});
                  }}
                >
                  <span className="cal-day-num">{d}</span>
                  {sub ? <span className="todo-cell-wrap">{sub}</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel panel--todos">
          <section className="task-card">
            <h3>할 일 · {dayLabel}</h3>
            <p className={`api-status${apiErr ? ' api-status--err' : ''}`} aria-live="polite">
              {apiStatus}
            </p>
            <ul className="task-list">
              {todos.map((t) => {
                const id = todoId(t);
                const completed = Boolean(t.completed);
                const created = t.createdAt
                  ? new Date(t.createdAt).toLocaleString('ko-KR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : '';
                return (
                  <li key={id} className={`task-item${completed ? ' done' : ''}`}>
                    <div className="task-body">
                      <div className="task-title">{t.title || '(제목 없음)'}</div>
                      <div className="task-meta">
                        {[completed ? '완료' : '진행 중', created].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <div className="task-actions">
                      <button
                        type="button"
                        className={completed ? 'task-btn task-btn--reopen' : 'task-btn task-btn--complete'}
                        onClick={async (ev) => {
                          ev.currentTarget.disabled = true;
                          try {
                            await updateTodo(id, { completed: !completed });
                            await loadTodos();
                          } catch (err) {
                            showToast(err instanceof Error ? err.message : '상태를 바꾸지 못했습니다.');
                          } finally {
                            ev.currentTarget.disabled = false;
                          }
                        }}
                      >
                        {completed ? '완료 취소' : '완료'}
                      </button>
                      <button type="button" onClick={() => openModalEdit(t)}>
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('이 할 일을 삭제할까요?')) return;
                          try {
                            await deleteTodo(id);
                            showToast('삭제했습니다.');
                            await loadTodos();
                          } catch (err) {
                            showToast(err instanceof Error ? err.message : '삭제하지 못했습니다.');
                          }
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {todos.length === 0 ? (
              <p className="empty-hint">이 날짜에는 할 일이 없습니다.</p>
            ) : null}
            <button type="button" className="btn-add" onClick={openModalAdd}>
              할 일 추가
            </button>
          </section>
          <section className="task-card">
            <h3>안내</h3>
            <p className="empty-hint" style={{ textAlign: 'left', padding: 0 }}>
              날짜별로 할 일이 저장됩니다. <strong>완료</strong> 버튼을 눌러야 완료 처리되며, 완료 후에는{' '}
              <strong>완료 취소</strong>로 되돌릴 수 있어요.
            </p>
          </section>
        </div>
      </main>

      <div
        className={`modal-backdrop${modalOpen ? ' open' : ''}`}
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="modal" role="dialog" aria-modal aria-labelledby="modalTitle">
          <h3 id="modalTitle">{editingId ? '할 일 수정' : '할 일 추가'}</h3>
          <form
            onSubmit={(e) => {
              void onModalSubmit(e);
            }}
          >
            <div className="modal-field">
              <label htmlFor="todoTitle">제목</label>
              <input
                id="todoTitle"
                required
                maxLength={120}
                autoComplete="off"
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label htmlFor="todoDate">날짜</label>
              <input
                id="todoDate"
                name="date"
                type="date"
                required
                value={modalDate}
                onChange={(e) => setModalDate(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={closeModal}>
                취소
              </button>
              <button type="submit" className="primary">
                저장
              </button>
            </div>
          </form>
        </div>
      </div>

      <Toast message={toast} />
    </>
  );
}
