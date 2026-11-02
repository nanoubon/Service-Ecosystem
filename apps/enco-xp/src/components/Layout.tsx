import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useFindings } from '../api';

const NAV = [
  { group: 'Monitor', items: [['/', 'Overview'], ['/assets', 'Asset Health'], ['/energy', 'Energy']] },
  { group: 'Act', items: [['/findings', 'Findings'], ['/work-orders', 'Work Orders'], ['/verification', 'Verification']] },
  { group: 'Report', items: [['/mv', 'M&V'], ['/data-quality', 'Data Quality']] },
] as const;

const TITLES: [RegExp, string][] = [
  [/^\/$/, 'Overview'], [/^\/assets\/.+/, 'Asset Health / Asset Detail'], [/^\/assets/, 'Asset Health'], [/^\/energy/, 'Energy'],
  [/^\/findings\/.+/, 'Findings / Finding Detail'], [/^\/findings/, 'Findings'], [/^\/work-orders/, 'Work Orders'],
  [/^\/verification/, 'Verification'], [/^\/mv/, 'M&V'], [/^\/data-quality/, 'Data Quality'],
];

export function Layout() {
  const { pathname } = useLocation();
  const pending = useFindings().data?.filter((f) => f.status === 'PENDING').length ?? 0;
  const title = TITLES.find(([re]) => re.test(pathname))?.[1] ?? '';
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-sidebar shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="flex items-center gap-3 p-5">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-primary to-accent font-bold">E</div>
          <div><b className="block text-md">EnCo-XP</b><small className="text-xs text-subtle">Facility Intelligence · Pilot</small></div>
        </div>
        <div className="mx-3 mb-2 rounded-md border border-border px-3 py-2 text-sm"><span className="text-subtle">Site</span><b className="block">Demo Site · Chiller Plant</b></div>
        <nav className="flex-1 overflow-y-auto">
          {NAV.map((g) => (
            <div key={g.group}>
              <div className="px-5 pb-1 pt-4 text-xs uppercase tracking-widest text-subtle">{g.group}</div>
              {g.items.map(([to, label]) => (
                <NavLink key={to} to={to} end={to === '/'}
                  className={({ isActive }) => `mx-2 flex items-center rounded-md px-3 py-2 font-medium ${isActive ? 'bg-panel-2 text-text shadow-[inset_3px_0_0_var(--color-primary)]' : 'text-muted hover:bg-panel hover:text-text'}`}>
                  {label}
                  {to === '/findings' && pending > 0 && <span className="ml-auto rounded-pill bg-crit px-2 text-xs text-text">{pending}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-3 border-t border-border p-4">
          <div className="grid h-8 w-8 place-items-center rounded-pill bg-panel-2 text-sm font-semibold">DE</div>
          <div><b className="block">Demo Engineer</b><small className="text-xs text-subtle">Facility Engineer</small></div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-header items-center gap-4 border-b border-border bg-bg px-6">
          <div className="text-muted">EnCo-XP / <b className="text-text">{title}</b></div>
          <input aria-label="search" placeholder="ค้นหา Asset ID, Finding…" className="input ml-auto w-72" />
          <button aria-label="notifications" className="btn relative">🔔{pending > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-pill bg-crit" />}</button>
        </header>
        <div role="note" className="border-b border-border bg-pill-warn-bg px-6 py-1 text-sm text-pill-warn-fg">
          DEMO DATA · ข้อมูลจำลองสำหรับ Pilot เท่านั้น (Read-only / Advisory · ไม่มีการสั่งงาน BMS)
        </div>
        <main className="w-full max-w-[1440px] p-6"><Outlet /></main>
      </div>
    </div>
  );
}
