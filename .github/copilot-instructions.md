# SmartSolar – Guidance for AI Coding Agents

This repo is a static, multi-page front-end project in Portuguese (pt-BR). There’s no backend, package.json, or build step—HTML + CSS + vanilla JS only. Pages share a common header/nav and optional auth modal; the dashboard is a richer single page with tabs and Chart.js charts.

## Project map and data flow
- Pages: `index.html` (landing), `projeto-smartsolar.html`, `monitoramento-inteligente.html`, `instalacao-suporte.html`, `curiosidade.html`, and `dashboard.html` (app-like UI).
- Assets: `src/images/*`, styles in `src/styles/*`, scripts in `src/scripts/*`:
  - `script.js`: site-wide UI (mobile nav, sliders, animations, forms).
  - `auth.js`: modal auth UI + localStorage based “session” + redirect to dashboard.
  - `dashboard.js`: dashboard logic (tabs, KPIs, charts, settings, users, alerts).
- Flow: user opens `index.html` → clicks “Entrar” → modal → on login/register, `auth.js` sets localStorage and redirects to `dashboard.html` → `dashboard.js` renders simulated data and charts.

## External dependencies and ordering
- CDN: Font Awesome, Google Fonts, and Chart.js (only on `dashboard.html`). Load Chart.js before `src/scripts/dashboard.js`.
- Avatars use the UI Avatars image URL; no network APIs are otherwise called.

## State and conventions
- State is in `localStorage` keys used across pages:
  - Auth: `userLoggedIn`, `userEmail`, `userName`, `userLastAccess`, `users` (object mapping email→{name}).
  - Dashboard prefs: `theme` (light|dark), `lang` (pt|en), notifications `notifyEmail`, `notifySMS`, `alertLowGen`, `userProfileImg`, `alertas` (array), plus simple user perms `userPerms`.
- DOM conventions used by scripts; keep IDs/classes in sync when editing HTML:
  - Header: `.nav-toggle`, `#nav_list`.
  - Auth modal: `#authModal`, `#loginForm`, `#registerForm`, `#authBtn`.
  - Dashboard: sidebar `.tab[data-section]` ↔ sections with ids `#section-<name>`; KPIs/labels by ids like `#powerNow`, `#energyToday`, `#totalPlacas`, etc.; toggle button `#toggleView` and optional selector `#placaMiniSelect`.
- Language/i18n: `dashboard.js` includes `setLanguage(lang)` with a `translations` map for `pt` and `en` that rewrites labels at runtime; extend the map to add strings.

## Dashboard architecture (key patterns)
- Charts: created in `initCharts()` with Chart.js; update theme via `updateChartsTheme()`. Real-time updates with a `setInterval` simulation.
- Tabs: clicking `.tab` toggles the matching `#section-*` and updates `#pageTitle`.
- Placas (solar panels): managed in-memory (array), rendered to a table; edit/remove via delegated events and a custom modal; KPIs recomputed in `atualizarCards()`.
- Settings/backup: preferences stored in localStorage; “Backup” downloads a JSON of selected keys; “Restore” uploads and reloads.

## Gotchas and file-specific notes
- `dashboard.js` contains duplicated/overlapping logic blocks (multiple DOMContentLoaded handlers and similar helpers). Prefer editing the later consolidated blocks (near the bottom) and avoid introducing further duplicates. If refactoring, dedupe helpers and ensure selectors remain valid.
- `localStorage.users` schema differs between files: `auth.js` saves an object mapping email → `{ name }`, while parts of `dashboard.js` treat `users` as an array of strings. Prefer the object shape for new work; when reading in the dashboard, normalize with `Object.keys(usersObj)` or adapt writes accordingly.
- Some pages include the auth modal and `auth.js`; if you add auth to a page, include the modal markup (see `index.html`) and `src/styles/auth.css` + `src/scripts/auth.js`.
- Keep script order: libraries first, then project scripts; ensure elements exist before scripts run (the code relies on `DOMContentLoaded`).
- Theme attribute: CSS targets `body[data-theme=...]` and markup sets `body data-theme="dark"`, while parts of `dashboard.js` toggle `document.documentElement` (`<html>`) instead of `body`. Prefer setting on `body` (or update CSS) and keep it consistent in new code; `updateChartsTheme()` reads from `document.documentElement` today.

## Common tasks (how to)
- Add a new dashboard chart:
  1) Add a `<canvas id="myNewChart"></canvas>` within a `.card` in `dashboard.html`.
  2) In `initCharts()` create a new `Chart` bound to that id, and append it to the charts array in `updateChartsTheme()` so colors update with theme changes.
- Add a new dashboard tab/section:
  1) Add a button `<button class="tab" data-section="meu">…</button>` to the sidebar.
  2) Add `<section id="section-meu" hidden>…</section>` to `<main>`.
  3) No further JS needed; existing tab handler shows/hides sections and updates the title.
- Add a new KPI value: Add an element with a new id to `dashboard.html` and update `atualizarCards()` (the appropriate one) to set its text.
- Extend i18n: add keys in the `translations` map and wire corresponding label selectors.

## Running and debugging locally
- No build required. Open `index.html` or `dashboard.html` in a browser. For best results, use a static server (e.g., VS Code Live Server) to match CDN/script expectations and avoid path issues.
- Clear session/state via the “Sair” button on the dashboard or `localStorage.clear()` in devtools.

## Style and assets
- Global styles in `src/styles/styles.css` and `src/styles/header.css`; page-specific CSS alongside, e.g., `src/styles/monitoramento-inteligente.css`.
- Images live in `src/images/`; reference with relative paths as in existing pages.

If anything above seems inconsistent with how you work in this repo (e.g., which `dashboard.js` block to edit), tell me and I’ll refine these rules.