const CACHE_PREFIX = 'todoApp.sidebarProfile.v1:';
const LAST_PROFILE_UID_KEY = 'todoApp.lastProfileUid';

function cacheKey(uid: string) {
  return `${CACHE_PREFIX}${uid}`;
}

export function readProfileCache(uid: string): { nickname: string; photoURL: string } | null {
  if (!uid) return null;
  try {
    const raw = localStorage.getItem(cacheKey(uid));
    if (!raw) return null;
    const c = JSON.parse(raw) as unknown;
    if (!c || typeof c !== 'object') return null;
    const o = c as Record<string, unknown>;
    return {
      nickname: typeof o.nickname === 'string' ? o.nickname : '',
      photoURL: typeof o.photoURL === 'string' ? o.photoURL : '',
    };
  } catch {
    return null;
  }
}

function writeProfileCache(uid: string, nickname: string, photoURL: string) {
  if (!uid) return;
  try {
    localStorage.setItem(
      cacheKey(uid),
      JSON.stringify({
        nickname: nickname ?? '',
        photoURL: photoURL ?? '',
      }),
    );
  } catch {
    /* quota */
  }
}

export function clearSidebarProfileCache(uid: string): void {
  if (!uid) return;
  try {
    localStorage.removeItem(cacheKey(uid));
    localStorage.removeItem(LAST_PROFILE_UID_KEY);
  } catch {
    /* ignore */
  }
}

export function syncSidebarUserChip(
  user: {
    uid?: string;
    id?: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
  } | null,
  profile: { nickname?: string; photoURL?: string } | null,
): { nickname: string; photoURL: string; initial: string } {
  const uid = user?.uid ?? user?.id ?? null;
  const fromServer = profile != null && typeof profile === 'object';
  const cached = !fromServer && uid ? readProfileCache(uid) : null;

  const nickname =
    (fromServer &&
      typeof profile?.nickname === 'string' &&
      profile.nickname.trim()) ||
    (!fromServer && cached?.nickname?.trim()) ||
    user?.displayName ||
    (user?.email ? user.email.split('@')[0] : '') ||
    '사용자';

  const photoRaw =
    (fromServer && typeof profile?.photoURL === 'string' && profile.photoURL.trim()) ||
    (!fromServer && cached?.photoURL?.trim()) ||
    (user?.photoURL && String(user.photoURL).trim()) ||
    '';

  const initial = (Array.from(nickname.trim())[0] || '?').toUpperCase();

  if (uid && fromServer) {
    writeProfileCache(uid, nickname, photoRaw);
  }

  if (uid) {
    try {
      localStorage.setItem(LAST_PROFILE_UID_KEY, uid);
    } catch {
      /* ignore */
    }
  }

  return { nickname, photoURL: photoRaw, initial };
}
