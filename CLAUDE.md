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

**Frontend** — vanilla JS ES modules, no framework. `index.html` contains every screen and overlay as static markup; JS only toggles classes and fills containers via `innerHTML`.
- `src/main.js` wires all DOM event listeners (mostly event delegation) and boots via `init()` from `auth.js`. New interactive elements are registered here.
- `src/state.js` is a single shared mutable `state` object (current user, `allEntries`, calendar month, filters). Modules import and mutate it directly.
- Screens are `.screen` divs; navigation = remove `active` from all, add to one (`nav.js`, `form.js`, `auth.js`). Overlays/sheets show via a `visible` / `open` class.
- Entries are referenced by **index into `state.allEntries`** (`data-idx` on list items → `openDetail(idx)` → `state.detailEntryIndex`). Anything that reorders or filters must preserve the original index (see `records.js` using `allEntries.indexOf(x)`).
- Excel import/export uses the global `XLSX` loaded from a CDN `<script>` in `index.html`, not an npm package.
- Styling lives entirely in `src/style.css` (Toss Design System–style tokens on `:root`). JS-generated markup depends on these class names, so renaming a class means updating both the CSS and the template strings in `form.js`, `detail.js`, `records.js`, `excel.js`.

**Auth & roles** — no real auth. `/api/members` GET returns `{ users: {id: name}, adminId }` from the Supabase `members` table. A regular user logs in by entering a known 사번 (employee ID, uppercased); only the admin ID requires a password (checked by POST `/api/members`). The logged-in user is persisted in `localStorage['bm_user']`. Admin mode (`isAdmin()`) adds `.admin-mode` to `#app`, which hides registration UI via CSS; admins see all users' entries and never sync writes.

**Data sync** — whole-list replacement, not per-record CRUD:
- `loadFromServer()` GETs `/api/entries?userId=…`; the server filters to that user unless they are admin. On failure it falls back to `localStorage['bm_entries_v1']`.
- Every mutation (submit, edit, delete, Excel import) mutates `state.allEntries` then calls `syncToServer()`, which PUTs `{ userId, entries }`. The server **deletes all rows for that user and re-inserts** the list.
- `api/entries.js` maps between camelCase client entries (`userId`, `createdAt`) and snake_case Supabase rows (`user_id`, `created_at`) via `toRow` / `toEntry`.

**Backend — two implementations that have diverged:**
- `api/*.js` are the Vercel serverless functions used in production (routes in `vercel.json`); both members and entries are backed by Supabase.
- `server.js` is the local dev server. Its `/api/members` matches production, but its `/api/entries` still reads/writes `data.json` and expects a bare array on PUT, so local saves of the client's `{ userId, entries }` payload return 400. Update both when changing API behavior.
