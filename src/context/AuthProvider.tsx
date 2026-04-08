import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { API_BASE } from '../config';
import { getSessionUser, setSessionUser } from '../api/client';
import { fetchMe, logoutRemote } from '../api/auth';
import type { PublicUser } from '../types/api';
import { AuthContext } from './auth-context';

const FETCH_NETWORK_HINTS = new Set([
  'Failed to fetch',
  'Load failed',
  'NetworkError when attempting to fetch resource.',
]);

function networkErrorMessage(cause: unknown): Error {
  const msg = cause instanceof Error ? cause.message : String(cause);
  if (!FETCH_NETWORK_HINTS.has(msg)) {
    return cause instanceof Error ? cause : new Error(msg);
  }
  const localhostHint = API_BASE.includes('localhost')
    ? ' [지금 빌드의 API가 localhost입니다. Vercel Environment Variables에 VITE_API_BASE를 넣고 Redeploy 하세요.]'
    : '';
  return new Error(
    `서버에 연결하지 못했습니다.${localhostHint} 현재 API 주소: ${API_BASE} · 주소창의 이 사이트 주소와 Heroku의 FRONTEND_ORIGIN이 정확히 같은지(끝의 /, www 유무 포함), 백엔드 https://…/api/health 가 브라우저에서 열리는지 확인해 주세요.`,
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const me = await fetchMe();
    if (me) {
      setUser(me);
      return me;
    }
    setUser(null);
    return null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchMe();
        if (cancelled) return;
        const u = me ?? getSessionUser();
        setUser(u);
      } catch {
        if (!cancelled) setUser(getSessionUser());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
    } catch (e) {
      throw networkErrorMessage(e);
    }
    const data = (await res.json().catch(() => ({}))) as {
      user?: PublicUser;
      error?: string;
    };
    if (!res.ok) throw new Error(data.error || '로그인에 실패했습니다.');
    if (!data.user) throw new Error('서버 응답이 올바르지 않습니다.');
    setSessionUser(data.user);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, password: string, nickname: string) => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password, nickname }),
        credentials: 'include',
      });
    } catch (e) {
      throw networkErrorMessage(e);
    }
    const data = (await res.json().catch(() => ({}))) as {
      user?: PublicUser;
      error?: string;
    };
    if (!res.ok) throw new Error(data.error || '회원가입에 실패했습니다.');
    if (!data.user) throw new Error('서버 응답이 올바르지 않습니다.');
    setSessionUser(data.user);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await logoutRemote();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      apiBase: API_BASE,
      refreshUser,
      login,
      register,
      logout,
    }),
    [user, loading, refreshUser, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
