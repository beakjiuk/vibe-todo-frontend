import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { createNote, deleteNote, listNotes, updateNote } from '../api/notes';
import type { NoteDoc } from '../types/api';
import { Toast } from '../components/Toast';

type NoteRow = NoteDoc & { id: string };

function formatNoteDate(ts: number | undefined) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleString('ko-KR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '';
  }
}

export function NotesPage() {
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2200);
  };

  const loadNotes = useCallback(async () => {
    try {
      const arr = await listNotes();
      const rows: NoteRow[] = [];
      for (const n of arr) {
        rows.push({ ...n, id: String(n._id) });
      }
      rows.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
      setNotes(rows);
    } catch (e) {
      showToast(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.');
    }
  }, []);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const openNew = () => {
    setEditingId(null);
    setTitle('');
    setBody('');
    setModalOpen(true);
  };

  const openEdit = (n: NoteRow) => {
    setEditingId(n.id);
    setTitle(n.title ?? '');
    setBody(n.body ?? '');
    setModalOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const b = body;
    if (!t && !b.trim()) {
      showToast('제목 또는 내용을 입력해 주세요.');
      return;
    }

    try {
      if (editingId) {
        await updateNote(editingId, { title: t || '(제목 없음)', body: b });
        showToast('저장했습니다.');
      } else {
        await createNote({ title: t || '(제목 없음)', body: b });
        showToast('노트를 추가했습니다.');
      }
      setModalOpen(false);
      await loadNotes();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '저장하지 못했습니다.');
    }
  };

  const onDelete = async () => {
    if (!editingId || !window.confirm('이 노트를 삭제할까요?')) return;
    try {
      await deleteNote(editingId);
      setModalOpen(false);
      showToast('삭제했습니다.');
      await loadNotes();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '삭제하지 못했습니다.');
    }
  };

  return (
    <>
      <header className="content-head">
        <h1 className="content-head__title">노트</h1>
        <p className="content-head__sub">메모를 쌓아 두었다가 검색으로 함께 찾을 수 있어요.</p>
      </header>

      <main className="app-main notes-main">
        <div className="notes-toolbar">
          <button type="button" className="btn-add notes-new-btn" id="btnNewNote" onClick={openNew}>
            새 노트
          </button>
        </div>
        <div className="notes-board" id="notesList">
          {notes.length === 0 ? (
            <p className="notes-empty">
              노트가 없습니다. <strong>새 노트</strong>로 메모를 추가해 보세요.
            </p>
          ) : (
            notes.map((n) => (
              <button key={n.id} type="button" className="note-card" onClick={() => openEdit(n)}>
                <div className="note-card__title">{n.title?.trim() || '(제목 없음)'}</div>
                <div className="note-card__preview">
                  {(() => {
                    const text = (n.body || '').replace(/\s+/g, ' ').trim();
                    return text.slice(0, 160) + (text.length > 160 ? '…' : '') || '내용 없음';
                  })()}
                </div>
                <div className="note-card__meta">{formatNoteDate(n.updatedAt || n.createdAt)}</div>
              </button>
            ))
          )}
        </div>
      </main>

      <div
        className={`modal-backdrop${modalOpen ? ' open' : ''}`}
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) setModalOpen(false);
        }}
      >
        <div className="modal modal--note" role="dialog" aria-modal>
          <h3 id="noteModalHeading">{editingId ? '노트 수정' : '새 노트'}</h3>
          <form id="noteForm" onSubmit={(e) => void onSubmit(e)}>
            <div className="modal-field">
              <label htmlFor="noteModalTitleField">제목</label>
              <input
                id="noteModalTitleField"
                name="title"
                maxLength={200}
                placeholder="제목 (선택)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label htmlFor="noteModalBody">내용</label>
              <textarea
                id="noteModalBody"
                name="body"
                rows={12}
                maxLength={20000}
                placeholder="메모를 입력하세요"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <div className="modal-actions modal-actions--spread">
              <button
                type="button"
                className="btn-note-delete"
                id="noteModalDelete"
                hidden={!editingId}
                onClick={() => void onDelete()}
              >
                삭제
              </button>
              <div className="modal-actions__right">
                <button type="button" id="noteModalCancel" onClick={() => setModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="primary" id="noteModalSave">
                  저장
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Toast message={toast} />
    </>
  );
}
