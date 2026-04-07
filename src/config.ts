/** 백엔드 API 베이스 (기본: 형제 폴더 todo-backend, PORT 5000) */
export const API_BASE = String(
  import.meta.env.VITE_API_BASE || 'http://localhost:5000/api',
).replace(/\/$/, '');
