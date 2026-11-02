# Service-Ecosystem · EnCo-XP Pilot Frontend

Pilot UI for chiller-plant Facility Intelligence (RaaS/EaaS, read-only/advisory). Flow: **Detect → Engineer Verify → Work Order (EnPrompt) → Verify result → M&V**.

> ⚠️ All data in this repo is **fake demo data**. Do not commit real customer data, site names, or credentials.

## Setup
Requires Node 24+ (unit tests use native TS type stripping).
```bash
npm install
npm run dev        # http://localhost:5173 (MSW mocks enabled)
```

## Scripts (root)
| Script | What |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build of `apps/enco-xp` |
| `npm run preview` | Serve the build on :4173 |
| `npm run lint` | ESLint (incl. mock-import rule) |
| `npm run typecheck` | `tsc` for contract, mocks, app |
| `npm run test:unit` | Contract unit tests (node:test) |
| `npm run test:e2e` | Playwright E2E + axe (WCAG 2.1 AA serious/critical) against `vite preview` with MSW |

Set `VITE_USE_MOCKS=false` to disable MSW once a real API exists.

## Structure
```
apps/enco-xp/         React + TS + Vite app
  src/api/            ONLY data access layer (TanStack Query hooks → fetch /api/*)
  src/mocks/          MSW worker + handlers (reads fixtures from /mocks)
  src/components/     Layout, KPI cards, status pills, tables, modals, toasts, states, charts
  src/pages/          10 routed pages
  src/styles/tokens.css  Design Tokens v0.1 (UX/UI) → tailwind theme.extend
packages/contract/    Data Contract v0.1 TypeScript types
mocks/                Fake demo fixtures
docs/adr/             ADR-001..006
```

## Pages
Overview `/` · Asset Health `/assets` · Asset Detail `/assets/:id` · Energy `/energy` · Findings `/findings` · Finding Detail `/findings/:id` · Work Orders `/work-orders` · Verification `/verification` · M&V `/mv` · Data Quality `/data-quality`

## Mock rule
Pages and components **must not import mocks**. They call hooks from `src/api`, which hit `/api/*`; MSW intercepts those in the browser. ESLint fails the build if `src/pages` or `src/components` import `@enco/mocks` or any `mocks` path.

## Mock scenarios (testing states)
Set `localStorage['enco-mock-scenario']` to `loading`, `empty` or `error` to force skeleton / empty (with รีเฟรช) / red error bar (with ลองใหม่) on every page. Remove the key to return to normal data. Mock state is in-memory and resets on full page reload.

## Contract
`@enco/contract` is **v0.2.0** — see `packages/contract/CHANGELOG.md`. Finding `CLOSED` only from `VERIFIED`; M&V figures shown only when `mv_status = VERIFIED`.

## Styling rule
Use Tailwind classes mapped to design tokens (`bg-panel`, `text-muted`, `bg-pill-crit-bg` …). Charts read tokens at runtime. No hex colors in app code.
