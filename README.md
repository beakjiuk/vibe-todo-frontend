# 일정관리앱 (TODO-REACT)

할 일·가계부·노트를 관리하는 웹 앱입니다. 같은 상위 폴더의 **todo-backend** REST API와 연동합니다.

## 기능 요약

- 랜딩, 회원가입·로그인
- 로그인 후: 할 일(`app`), 가계부(`account`), 노트(`notes`), 프로필(`profile`), 검색(`search`)
- API 호출은 `src/api/*` 모듈로만 분리되어 페이지 컴포넌트는 UI·상태에 집중합니다.

---

## 빠른 시작

1. **백엔드** `todo-backend`에서 MongoDB 연결·`.env` 설정 후 서버를 띄웁니다 (기본 포트 예: `5000`).
2. 이 저장소에서 의존성 설치:

   ```bash
   npm install
   ```

3. 환경 변수: 루트에 `.env`를 만들고 [`.env.example`](./.env.example) 내용을 복사한 뒤 `VITE_API_BASE`를 실제 API 주소로 맞춥니다.

4. 개발 서버:

   ```bash
   npm run dev
   ```

   Vite 기본 주소는 `http://localhost:5173` 입니다. 백엔드의 `FRONTEND_ORIGIN`(또는 CORS 허용 출처)을 이 주소와 동일하게 맞춰야 **HttpOnly 쿠키** 기반 로그인이 동작합니다.

---

## 라우트

| 경로 | 설명 | 인증 |
|------|------|------|
| `/` | 랜딩 | 공개 |
| `/login`, `/signup` | 로그인·회원가입 | 공개 |
| `/app` | 할 일 | 필요 |
| `/account` | 가계부 | 필요 |
| `/notes` | 노트 | 필요 |
| `/profile` | 프로필 | 필요 |
| `/search` | 검색 | 필요 |

인증이 필요한 구간은 `RequireAuth`로 감싸고, 공통 사이드바·레이아웃은 `AppLayout`에서 제공합니다. `app`·`account` 등 앱 페이지는 **코드 스플리팅(`React.lazy`)** 으로 로드합니다.

---

## 소스 구조 (요약)

```
src/
  api/           # REST 클라이언트·도메인별 API (auth, todos, ledger, notes, profile, search)
  components/    # AppLayout, Sidebar, Toast, PageFallback 등
  context/       # AuthProvider, 인증 컨텍스트
  pages/         # 페이지 컴포넌트
  routes/        # RequireAuth
  styles/        # app.css 등
  lib/, hooks/   # 유틸·훅
```

---

## 프론트엔드 기술 스택

| 구분 | 기술 | 설명 |
|------|------|------|
| **런타임 / 빌드** | [Vite](https://vite.dev/) 8 | ESM 기반 개발 서버·프로덕션 번들 |
| **UI** | [React](https://react.dev/) 19 | 컴포넌트 기반 UI |
| **언어** | [TypeScript](https://www.typescriptlang.org/) 6 | 정적 타입 |
| **라우팅** | [React Router](https://reactrouter.com/) 7 | SPA 경로·보호 라우트 |
| **품질** | [ESLint](https://eslint.org/) 9 + typescript-eslint, React Hooks / React Refresh | 린트 |

### dependencies

- `react`, `react-dom` — UI
- `react-router-dom` — 클라이언트 라우팅

### devDependencies

- `@vitejs/plugin-react` — Fast Refresh
- `typescript`, `@types/*` — 타입
- `eslint` 및 관련 플러그인

### 빌드

- 프로덕션 번들에서 `react` / `react-dom` / `react-router` 를 **`react-vendor` 청크**로 묶어 로딩을 나눕니다 (`vite.config.ts`의 `manualChunks`).

---

## 백엔드·연동 (`todo-backend`)

프론트는 기본적으로 `http://localhost:5000/api` 를 사용합니다 (`VITE_API_BASE`로 변경).

| 구분 | 기술 | 설명 |
|------|------|------|
| **서버** | [Express](https://expressjs.com/) 5 | HTTP API |
| **DB** | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) 9 | 문서 저장 |
| **인증** | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JWT |
| **비밀번호** | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 해시 |
| **HTTP** | cors, cookie-parser | CORS, 쿠키 |

### 인증 (이 프론트 기준)

- JWT를 **HttpOnly 쿠키**로 받습니다. 브라우저 JS는 토큰 문자열에 접근하지 않습니다.
- `fetch` 는 **`credentials: 'include'`** 를 사용합니다 (`src/api/client.ts`).
- 로그아웃·계정 삭제 시 백엔드가 쿠키를 제거해야 합니다.

### 연결이 안 될 때

- 브라우저 주소의 **출처**(scheme + host + port)와 백엔드 **CORS·`FRONTEND_ORIGIN`** 이 일치하는지 확인합니다.
- 프로덕션에서는 HTTPS와 `Secure` 쿠키 설정이 맞는지 확인합니다.

---

## 스크립트

```bash
npm run dev      # 개발 서버 (Vite)
npm run build    # 타입 검사 + 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint
```

---

## 환경 변수

| 변수 | 설명 |
|------|------|
| `VITE_API_BASE` | API 베이스 URL, **반드시 `/api`까지** (예: `http://localhost:5000/api`) |

자세한 주석은 [`.env.example`](./.env.example) 을 참고하세요. **실제 비밀 값은 Git에 올리지 마세요** (`.env`는 일반적으로 `.gitignore`에 포함).

---

## 요구 사항

- **Node.js** 20+ 권장
- **MongoDB** — 백엔드가 사용

백엔드를 실행한 뒤 이 폴더에서 `npm run dev` 로 프론트를 띄우면 됩니다.
