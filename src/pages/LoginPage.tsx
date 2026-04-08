import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useBodyClass } from '../hooks/useBodyClass';
import { isValidEmailFormat } from '../lib/validators';

export function LoginPage() {
  useBodyClass('auth-body auth-body--split');
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/app', { replace: true });
  }, [user, loading, navigate]);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr('');
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') ?? '').trim();
    const password = String(fd.get('password') ?? '');

    if (!isValidEmailFormat(email)) {
      setErr('이메일 형식으로 입력해 주세요. (예: name@example.com)');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/app', { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : '로그인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-hero" aria-hidden>
        <div className="auth-hero__inner">
          <div className="auth-hero__task" aria-hidden>
            <span className="auth-hero__check" />
            <span className="auth-hero__line" />
            <span className="auth-hero__line auth-hero__line--short" />
          </div>
          <div className="auth-hero__calendar">
            <svg className="auth-hero__cal-svg" viewBox="0 0 140 160" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect x="14" y="28" width="112" height="118" rx="14" fill="#fff" stroke="#fecdd3" strokeWidth="2" />
              <rect x="14" y="28" width="112" height="34" rx="10" fill="#fdba74" />
              <rect x="36" y="18" width="10" height="22" rx="3" fill="#fca5a5" />
              <rect x="94" y="18" width="10" height="22" rx="3" fill="#fca5a5" />
              <circle cx="42" cy="78" r="3.5" fill="#fda4af" opacity="0.7" />
              <circle cx="100" cy="86" r="3" fill="#fda4af" opacity="0.6" />
              <circle cx="94" cy="118" r="2.5" fill="#fda4af" opacity="0.55" />
              <ellipse cx="70" cy="95" rx="38" ry="34" fill="#fff" stroke="#fde68a" strokeWidth="1.5" />
              <ellipse cx="70" cy="92" rx="28" ry="26" fill="#fff" />
              <circle cx="56" cy="88" r="4" fill="#1e293b" />
              <circle cx="84" cy="88" r="4" fill="#1e293b" />
              <circle cx="52" cy="98" r="5" fill="#fed7aa" opacity="0.85" />
              <circle cx="88" cy="98" r="5" fill="#fed7aa" opacity="0.85" />
              <path
                d="M62 104 Q70 110 78 104"
                stroke="#1e293b"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </aside>

      <div className="auth-main">
        <div className="auth-card">
          <p className="auth-kicker">일정관리의 모든 것!</p>
          <h1 className="auth-brand">할꺼지?</h1>
          <h2 className="auth-heading">로그인</h2>
          <p className="sub">이메일 형식만 맞으면 됩니다. 가짜 주소도 괜찮아요.</p>
          <div className={`auth-error${err ? ' visible' : ''}`}>{err}</div>
          <form onSubmit={onSubmit}>
            <div className="auth-field">
              <label htmlFor="email">이메일</label>
              <input id="email" name="email" type="text" inputMode="email" autoComplete="username" required />
            </div>
            <div className="auth-field">
              <label htmlFor="password">비밀번호</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            <button type="submit" className="btn-auth" disabled={submitting}>
              <span className="btn-auth__label">
                {submitting ? <span className="btn-auth__skel" aria-hidden /> : null}
                <span style={submitting ? { opacity: 0.92 } : undefined}>{submitting ? '확인 중' : '들어가기'}</span>
              </span>
            </button>
          </form>
          <div className="auth-footer">
            계정이 없나요? <Link to="/signup">회원가입</Link> · <Link to="/">처음으로</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
