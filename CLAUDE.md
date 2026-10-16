# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

BM 영업일지 — a mobile-first (max-width 430px) web app for sales staff to log daily branch visits ("일정" / schedule) and future visit plans ("계획" / plan), browse them by period, and import/export Excel. UI text is Korean.

## Commands

- `npm run dev` — runs the local Express API (`server.js`, port 3001) and Vite together; Vite proxies `/api` to 3001.
- `npm run build` — Vite build to `dist/` (this is also Vercel's build command).
- `npm run preview` — serve the built output.

There is no test suite or linter configured. Changesets (`.changeset/`) is set up for versioning.

Environment: `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`, read from `.env.local` (gitignored).

## Architecture

**Frontend** — vanilla JS ES modules, no framework. `index.html` holds every screen and overlay as static markup; JS toggles classes and fills containers via `innerHTML`. Layers (`src/`), dependencies point downward only:
- `main.js` — composition root. Creates repositories → providers → controllers via `create*({ deps })` factories and calls each controller's `bind()`. No module-level singletons; wire new dependencies here.
- `controllers/` — one per screen/feature (navigator, login, session, home, form, records, detail, excel). Own DOM event binding (mostly delegation) and screen-local UI state. Cross-controller calls are injected callbacks (e.g. `openDetail`, `openForm`, `getFiltered`), not imports.
- `widgets/` — HTML-string renderers, no state. `entryFields.js` is shared by the register form and the edit sheet (fields addressed by `data-field`).
- `providers/` — app state. `authProvider` (members, current user, admin) and `entryProvider` (entries list + persistence policy). Controllers re-render by subscribing to `entries.subscribe`, never by calling each other's render.
- `domain/` — pure rules: entry creation/edit/validation, period calculation, Excel row mapping.
- `data/` — repositories over `/api/*` and localStorage. `core/` — DOM/date/emitter/viewport helpers.

Conventions that span files:
- Entries are referenced by **index into `entries.all()`** (`data-idx` → `detail.open(idx)`). Filtering/grouping must map back with `entries.indexOf(x)`.
- User-supplied text must go through `escapeHtml` (`core/dom.js`) in every widget.
- Excel uses the global `XLSX` from a CDN `<script>` in `index.html`, not an npm package.
- Styling lives in `src/style.css` (Toss Design System tokens on `:root`); widget markup depends on its class names.

**Auth & roles** — no real auth. GET `/api/members` returns `{ users: {id: name}, adminId }` from the Supabase `members` table. A regular user logs in with a known 사번 (uppercased); only the admin ID needs a password (POST `/api/members`). Session persists in `localStorage['bm_user']`. Admin mode adds `.admin-mode` to `#app` (hides registration UI via CSS); admins see all users' entries and their changes are never persisted.

**Data sync** — whole-list replacement, not per-record CRUD. `entryProvider.load()` GETs `/api/entries?userId=…` (server returns only that user's rows unless admin), falling back to `localStorage['bm_entries_v1']` on failure. Every mutation updates the list, notifies subscribers, then PUTs `{ userId, entries }`; the server **deletes all rows for that user and re-inserts**.

**Backend** — `api/members.js`, `api/entries.js` are Vercel functions (routes in `vercel.json`). Shared code is in `api/_lib/` (underscore = not deployed as a route): Supabase client, CORS/method wrapper, and repositories that map camelCase entries ↔ snake_case rows. `server.js` (local dev) mounts the same handlers on Express, so dev and production behave identically.

## 커뮤니케이션
- 사용자가 영어로 물어봐도 한국어로 대답
- /compact 후에는 반드시 이 지침을 명시적으로 리로드 해야 한다

## 실행 / Git
- app run 금지. 사용자가 직접 실행해야 함
- git add, commit, push 금지. 사용자가 지시할때만 수행
- remote push 할때 api key, id/pw, 휴대폰번호, 주민번호 포함 파일 push 절대 금지

## 디자인
- UI는 토스 디자인 시스템(TDS) 스타일. 색·반경 등은 `src/style.css` 의 `:root` 토큰으로만 지정

## 코드 품질
- 변경 후 lint/test 스크립트가 있으면 실행하여 에러 없는지 확인 (현재 미설정)
- fix all major linting and avoid minor via analysis options
- avoid all the cSpell via settings json of .vscode
- 사용을 완료한 로그 및 디버그 코드는 가급적 제거. 재확인 가능성 높은 경우 주석처리

## 설계 원칙
- clean architecture and widgetize the codebase
- 협업을 하기 좋은 코드구조 유지
- 기능을 구현하기 전에 리팩터링 까지 고려하여 설계
- 의존성 주입, 상태관리, 모듈화
- provider, repository, controller 분리 적극 권장

## 문서
- markdown 등 문서를 만들때 한글깨짐 유의하여 UTF-8로 작성
- markdown 에 소스코드는 넣지 말아라. 실제 소스와 중복이고 업데이트 안된다
- 모든 문서는 필수, 핵심만 간결하게 정리
- 완료된 항목이 있으면 `MILESTONE.md` 마일스톤 업데이트

## Windows Batch (.bat)
- windows 용 .bat 파일 작성시 ANSI 인코딩 사용
- .bat 의 echo 에 ( ) 를 쓰면 오류 난다. ^( ^) 로 escape

## WORKLOG 규칙
- 매 작업완료 시마다 `WORKLOG.md` 에 사용자 프롬프트, 작업완료 시간(연월일시분초), 간략한 작업내용 기술
- 시각은 KST(Asia/Seoul) 기준. 웹/클라우드 세션은 `TZ=Asia/Seoul date` 로 확인
