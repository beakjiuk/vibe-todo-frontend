import { useState, type FormEvent } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { syncSidebarUserChip } from '../lib/sidebarCache';

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void | Promise<void>;
};

const icoCalendar = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const icoLedger = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

const icoNotes = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 13h8M8 17h6" />
  </svg>
);

const icoProfile = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20a8 8 0 1 1 16 0" />
  </svg>
);

export function Sidebar({ collapsed, onToggle, onLogout }: SidebarProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const chip = user
    ? syncSidebarUserChip(
        {
          id: user.id,
          email: user.email,
          displayName: user.nickname,
          photoURL: user.photoURL,
        },
        { nickname: user.nickname, photoURL: user.photoURL },
      )
    : { nickname: '…', photoURL: '', initial: '?' };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    navigate(t ? `/search?q=${encodeURIComponent(t)}` : '/search');
  };

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `sidebar-nav__link${isActive ? ' is-active' : ''}`;

  return (
    <aside className="app-sidebar" aria-label="메인 메뉴">
      <button
        type="button"
        className="sidebar-toggle"
        aria-expanded={!collapsed}
        aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
        onClick={onToggle}
      >
        <span className="sidebar-toggle__icon" aria-hidden>
          ‹
        </span>
      </button>

      <div className="sidebar-brand">
        <span className="sidebar-mark" aria-hidden />
        <span className="sidebar-brand__text">일정관리앱</span>
      </div>

      <NavLink className="sidebar-user" to="/profile" title="마이페이지">
        {loading && !user ? (
          <span
            className="app-avatar app-avatar--sidebar skel"
            id="profileAvatar"
            aria-hidden
            style={{ borderRadius: '50%', width: 44, height: 44 }}
          />
        ) : (
          <span
            className={`app-avatar app-avatar--sidebar${chip.photoURL ? ' app-avatar--photo' : ''}`}
            id="profileAvatar"
            aria-hidden
            style={chip.photoURL ? { backgroundImage: `url(${JSON.stringify(chip.photoURL)})` } : undefined}
          >
            {!chip.photoURL ? chip.initial : null}
          </span>
        )}
        <div className="sidebar-user__meta">
          <span className="app-nickname sidebar-nickname" id="userNickname">
            {loading && !user ? (
              <span className="skel skel-line" style={{ width: 92, display: 'inline-block' }} aria-hidden />
            ) : (
              chip.nickname
            )}
          </span>
        </div>
      </NavLink>

      <nav className="sidebar-nav">
        <form className="sidebar-search" role="search" onSubmit={onSearch}>
          <label className="visually-hidden" htmlFor="sidebarSearchInput">
            키워드 검색
          </label>
          <input
            id="sidebarSearchInput"
            name="q"
            placeholder="검색…"
            maxLength={120}
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" className="sidebar-search__submit" aria-label="검색">
            ⌕
          </button>
        </form>
        <NavLink to="/app" className={navCls} end>
          <span className="sidebar-nav__ico sidebar-nav__ico--svg" aria-hidden>
            {icoCalendar}
          </span>
          <span className="sidebar-nav__label">할 일</span>
        </NavLink>
        <NavLink to="/account" className={navCls}>
          <span className="sidebar-nav__ico sidebar-nav__ico--svg" aria-hidden>
            {icoLedger}
          </span>
          <span className="sidebar-nav__label">가계부</span>
        </NavLink>
        <NavLink to="/notes" className={navCls}>
          <span className="sidebar-nav__ico sidebar-nav__ico--svg" aria-hidden>
            {icoNotes}
          </span>
          <span className="sidebar-nav__label">노트</span>
        </NavLink>
        <NavLink to="/profile" className={navCls}>
          <span className="sidebar-nav__ico sidebar-nav__ico--svg" aria-hidden>
            {icoProfile}
          </span>
          <span className="sidebar-nav__label">마이페이지</span>
        </NavLink>
      </nav>

      <button type="button" className="sidebar-logout" onClick={onLogout}>
        로그아웃
      </button>
    </aside>
  );
}
