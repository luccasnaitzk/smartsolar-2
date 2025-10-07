## SmartSolar – AI Agent Quick Guide
Static multi‑page front-end (pt-BR). No build, no bundler: pure HTML/CSS/JS. Core experience: landing pages + authenticated `dashboard.html` (tabbed app UI with simulated solar data + Chart.js). Keep changes minimal, avoid introducing frameworks.

### Pages & Scripts
- Pages: `index.html` (hero + auth modal), `projeto-smartsolar.html`, `monitoramento-inteligente.html`, `instalacao-suporte.html`, `curiosidade.html`, `dashboard.html`, `meus-tickets.html`.
- Scripts (`src/scripts`):
  - `script.js` navigation, sliders, scroll/animation helpers.
  - `auth.js` modal login/registro + recuperação de senha (fluxo em 2 etapas, códigos em `resetCodes`). Redirect to dashboard when logado.
  - `dashboard.js` (consolidated, single IIFE): state, placas CRUD, KPIs, charts, análises, suporte/tickets inline, perfil, tema, simulação.
  - `ticket.js` floating ticket widget (gera protocolo, persiste em `tickets`).

### State (localStorage Keys)
Auth: `userLoggedIn`, `userEmail`, `userName`, `userLastAccess`, `users` (obj email → { name, password? }).
Dashboard prefs & data: `theme`, `lang`, `alertas` (array), `notifyEmail`, `notifySMS`, `alertLowGen`, `userProfileImg`, `userPerms`, plus simulation-driven arrays kept in memory (`SS.placas`, `SS.panelEvents`). Tickets: `tickets`. Password reset: `resetCodes`.

### DOM / Conventions
- IDs for KPIs (e.g. `powerNow`, `energyToday`, `totalPlacas`) must remain stable; charts rely on existing canvases created in `dashboard.html`.
- Sidebar tabs: `.tab[data-section]` ↔ `<section id="section-<name>">` (hidden attribute toggled). Title updates via `#pageTitle`.
- Placas table: row buttons rely on delegated click listener (ensure `bindPlacaTable()` called after `renderPlacas()`). CRUD mutates `SS.placas` then calls `ensurePanelState()`, `renderPlacas()`, `atualizarCards()`, `updatePlacasDoughnut()`.
- Theme: prefer setting `data-theme` on `<body>`; `updateChartsTheme()` currently reads `document.documentElement`—keep consistent if adjusting.

### Charts & Simulation
`initCharts()` builds all Chart.js instances once; recurring data updates happen in simulation tick (`TICK_MS=2000`). Add a chart: add `<canvas id="X">` then extend `initCharts()` and include it in theme updates. Avoid re-instantiating on tab changes (use existing registry in `SS.charts`).

### i18n
`setLanguage(lang)` rewrites text using a `translations` map (`pt`, `en`). When adding UI strings, add keys for both languages and update selectors.

### Tickets & Support
Inline support panel + floating widget reuse localStorage only. Creating a ticket appends to `tickets` array; no server—so avoid assuming persistence beyond browser storage.

### Common Additions
- Nova placa: push { nome, potencia, status } → call refresh helpers above.
- Novo KPI: add element id + set in `atualizarCards()`.
- Backup/Restore: update included keys list if you add new persistent keys.
- Permissions: extend `userPerms` (object) and reflect in UI (lookup done each render).

### Gotchas
- Do NOT add multiple `DOMContentLoaded` listeners in `dashboard.js`; use existing `init()` path.
- Maintain object schema for `users`; normalize if legacy array variant appears.
- Always re-bind or delegate events after dynamic re-render (placas uses a single delegated listener—do not attach per-row listeners).
- Keep external script order: Chart.js CDN before `dashboard.js`.

### Local Dev
Open HTML files directly or via a simple static server (e.g. VS Code Live Server) for proper relative paths and CDN loading. Reset state by clicking “Sair” (clears auth subset) or manually `localStorage.clear()` in DevTools.

### When Extending
Favor small pure functions inside existing IIFE; reuse `SS` namespace for new shared state. Avoid global leaks (only `window.SmartSolar = SS` is exposed for debug). Keep Portuguese user-facing text unless toggling via i18n system.

Have doubts about a selector or key? Search in `dashboard.js` before renaming—many IDs are cross-referenced for KPIs, charts, and analysis rendering.