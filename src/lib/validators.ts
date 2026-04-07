const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailFormat(value: string): boolean {
  return EMAIL_RE.test(String(value || '').trim());
}

export function isValidNickname(value: string): boolean {
  const s = String(value || '').trim();
  if (s.length < 2 || s.length > 20) return false;
  return /^[\p{L}\p{N}\s._-]+$/u.test(s);
}
