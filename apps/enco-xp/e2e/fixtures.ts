import { test as base, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const SHOTS = process.env.E2E_SHOT_DIR ?? 'test-results/shots';

export const ROUTES = [
  ['/', 'Overview'], ['/asset-health', 'Asset Health'], ['/asset-health/ENP-CH-001', 'Chiller #1'], ['/energy', 'Energy'],
  ['/findings', 'Findings'], ['/findings/F-0012', 'Condenser approach'], ['/work-orders', 'Work Orders'],
  ['/verification', 'Verification'], ['/mv', 'M&V'], ['/data-quality', 'Data Quality'],
] as const;

/** Collects console errors / page errors; asserts none at end of each test. */
export const test = base.extend<{ errors: string[] }>({
  errors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/status of (409|500)/.test(m.text())) errors.push(m.text()); });
    await use(errors);
  },
});
export { expect };

export async function open(page: Page, path: string) {
  await page.goto(path);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

export async function axe(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
}

/** Same-page API call; MSW in the page intercepts it. */
export const api = (page: Page, path: string, method = 'POST', body?: unknown) =>
  page.evaluate(async ([p, m, b]) => { const r = await fetch(p as string, { method: m as string, headers: { 'Content-Type': 'application/json' }, body: b ? JSON.stringify(b) : undefined }); return r.status; }, [path, method, body] as const);

/** In-app navigation via sidebar (keeps MSW in-memory state; page.goto would reset it). */
export async function nav(page: Page, label: string) {
  await page.getByRole('navigation').getByRole('link', { name: new RegExp(`^${label}`) }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(label);
}
