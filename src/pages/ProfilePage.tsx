import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteAccount } from '../api/auth';
import { updateProfile } from '../api/profile';
import { useAuth } from '../context/useAuth';
import { resolveProfilePhotoUrl } from '../lib/photoUrl';
import { isValidNickname } from '../lib/validators';
import { clearSidebarProfileCache } from '../lib/sidebarCache';
import { Toast } from '../components/Toast';

export function ProfilePage() {
  const { user, loading, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteErr, setDeleteErr] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email ?? '');
      setNickname(user.nickname ?? '');
      setPhotoURL(user.photoURL ?? '');
    }
  }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2200);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!user) return;
    const n = nickname.trim();
    if (!isValidNickname(n)) {
      setErr('닉네임은 2~20자이며, 글자·숫자·공백·._- 만 사용할 수 있어요.');
      return;
    }

    setSaving(true);
    try {
      const photoRaw = photoURL.trim();
      const photoResult = await resolveProfilePhotoUrl(photoRaw);
      if (!photoResult.ok) {
        setErr(photoResult.error);
        return;
      }
      const photoFinal = photoResult.url;
      setPhotoURL(photoFinal);

      try {
        await updateProfile({ nickname: n, photoURL: photoFinal });
      } catch (e) {
        setErr(e instanceof Error ? e.message : '저장에 실패했습니다.');
        return;
      }
      await refreshUser();
      const resolvedFromPage = photoRaw && photoFinal && photoRaw.trim() !== photoFinal;
      showToast(resolvedFromPage ? '페이지에서 이미지를 찾아 저장했습니다.' : '저장했습니다.');
    } catch {
      setErr('저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const onDeleteAccount = async () => {
    setDeleteErr('');
    if (!user) return;
    if (!deletePassword) {
      setDeleteErr('비밀번호를 입력해 주세요.');
      return;
    }
    setDeleting(true);
    try {
      const result = await deleteAccount(deletePassword);
      if (result.ok) {
        clearSidebarProfileCache(user.id);
        await logout();
        setDeleteOpen(false);
        navigate('/', { replace: true });
        return;
      }
      setDeleteErr(result.error || '탈퇴 처리에 실패했습니다.');
    } catch {
      setDeleteErr('네트워크 오류입니다.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <header className="content-head">
        <h1 className="content-head__title">마이페이지</h1>
        <p className="content-head__sub">닉네임과 프로필 사진 주소를 관리합니다.</p>
      </header>

      <main className="app-main profile-page-main">
        {loading && !user ? (
          <div className="task-card profile-card" aria-hidden>
            <h2 className="profile-heading">
              <span className="skel skel-line skel-line--lg" style={{ width: 160, display: 'inline-block' }} />
            </h2>
            <p className="profile-lead">
              <span className="skel skel-line" style={{ width: '72%', display: 'inline-block' }} />
            </p>
            <div className="modal-field profile-field">
              <span className="skel skel-line skel-line--sm" style={{ width: 90, display: 'inline-block' }} />
              <div className="skel skel-block" style={{ width: '100%', height: 40, marginTop: 8, borderRadius: 12 }} />
            </div>
            <div className="modal-field profile-field">
              <span className="skel skel-line skel-line--sm" style={{ width: 140, display: 'inline-block' }} />
              <div className="skel skel-block" style={{ width: '100%', height: 40, marginTop: 8, borderRadius: 12 }} />
            </div>
            <div className="modal-field profile-field">
              <span className="skel skel-line skel-line--sm" style={{ width: 220, display: 'inline-block' }} />
              <div className="skel skel-block" style={{ width: '100%', height: 40, marginTop: 8, borderRadius: 12 }} />
            </div>
            <div style={{ marginTop: 12 }}>
              <span className="skel skel-block" style={{ width: 110, height: 40, borderRadius: 12, display: 'inline-block' }} />
            </div>
          </div>
        ) : null}
        <div className="task-card profile-card">
          <h2 className="profile-heading">내 프로필</h2>
          <p className="profile-lead">닉네임은 회원가입 때 정한 값이 기본이에요. 여기서 바꿀 수 있어요.</p>
          <div id="profileErr" className={`profile-err${err ? ' visible' : ''}`}>
            {err}
          </div>
          <form id="profileForm" onSubmit={(e) => void onSubmit(e)}>
            <div className="modal-field profile-field">
              <label htmlFor="profEmail">이메일</label>
              <input id="profEmail" type="text" readOnly value={email} disabled={!user} />
            </div>
            <div className="modal-field profile-field">
              <label htmlFor="profNickname">닉네임 (2~20자)</label>
              <input
                id="profNickname"
                name="nickname"
                required
                minLength={2}
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={!user}
              />
            </div>
            <div className="modal-field profile-field">
              <label htmlFor="profPhoto">프로필 사진 / 페이지 주소 (선택)</label>
              <input
                id="profPhoto"
                name="photoURL"
                type="text"
                inputMode="url"
                autoComplete="off"
                placeholder="이미지 URL 또는 블로그·홈페이지 링크"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                disabled={!user}
              />
            </div>
            <p className="profile-hint">
              이미지 파일 주소(<code>.jpg</code>, <code>.png</code> 등)는 그대로 쓰고, 블로그·홈페이지처럼 글 페이지 주소를 넣으면
              대표 이미지(og:image 등)를 자동으로 찾아 프로필에 맞춥니다. 일부 사이트는 차단으로 실패할 수 있어요.
            </p>
            <button type="submit" className="btn-add profile-save" id="profileSave" disabled={saving || !user}>
              저장
            </button>
          </form>
        </div>

        <div className="task-card profile-card profile-danger-card">
          <h2 className="profile-heading profile-heading--danger">회원 탈퇴</h2>
          <p className="profile-lead">
            탈퇴하면 할 일·프로필 등 이 앱에 저장된 데이터가 모두 삭제되고, 계정도 제거됩니다. 복구할 수 없습니다.
          </p>
          <button type="button" className="btn-delete-account" id="btnOpenDelete" onClick={() => setDeleteOpen(true)}>
            회원 탈퇴하기
          </button>
        </div>
      </main>

      <div
        className={`modal-backdrop${deleteOpen ? ' open' : ''}`}
        id="deleteModal"
        aria-hidden={!deleteOpen}
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) setDeleteOpen(false);
        }}
      >
        <div className="modal modal--danger" role="dialog" aria-modal aria-labelledby="deleteModalTitle">
          <h3 id="deleteModalTitle">정말 탈퇴할까요?</h3>
          <p className="modal-note">
            진행하려면 로그인 비밀번호를 입력해 주세요. 서버에 저장된 계정과 할 일·가계부·노트가 모두 삭제됩니다.
          </p>
          <div id="deleteErr" className={`profile-err delete-modal-err${deleteErr ? ' visible' : ''}`}>
            {deleteErr}
          </div>
          <div className="modal-field">
            <label htmlFor="deletePassword">비밀번호</label>
            <input
              id="deletePassword"
              type="password"
              autoComplete="current-password"
              placeholder="현재 비밀번호"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" id="deleteCancel" onClick={() => setDeleteOpen(false)}>
              취소
            </button>
            <button
              type="button"
              className="primary btn-danger-confirm"
              id="deleteConfirm"
              disabled={deleting}
              onClick={() => void onDeleteAccount()}
            >
              <span className="btn-skel">
                {deleting ? <span className="skel btn-skel__bar" aria-hidden /> : null}
                <span style={deleting ? { opacity: 0.92 } : undefined}>{deleting ? '처리 중' : '탈퇴하기'}</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <Toast message={toast} />
    </>
  );
}
