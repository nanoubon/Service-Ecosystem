# ADR-006: Frontend repo structure and stack
- Status: Accepted (Tech Lead, UX/UI)
- Decision: npm workspaces monorepo — `apps/enco-xp` (React + TypeScript + Vite, Tailwind with `theme.extend` mapped to `tokens.css`, ECharts, TanStack Query, React Router), `packages/contract` (Data Contract types), `mocks/` (fake fixtures served by MSW).
- Rules: pages call `src/api` only; mocks are wired solely in `src/mocks` (enforced by ESLint `no-restricted-imports`); no hardcoded colors.
- CI: lint, typecheck, build on every PR.
