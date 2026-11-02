import { ROUTES, SHOTS, expect, test } from './fixtures';

const setScenario = () => (v: string | null) => { if (v) localStorage.setItem('enco-mock-scenario', v); else localStorage.removeItem('enco-mock-scenario'); };

for (const [path] of ROUTES) {
  test(`states on ${path}: loading skeleton, empty/error with retry`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate(setScenario(), 'loading');
    await page.goto(path);
    await expect(page.getByTestId('state-loading').first()).toBeVisible();

    await page.evaluate(setScenario(), 'error');
    await page.goto(path);
    const err = page.getByTestId('state-error').first();
    await expect(err).toBeVisible({ timeout: 15_000 });
    await expect(err.getByRole('button', { name: 'ลองใหม่' })).toBeVisible();
    if (path === '/') await page.screenshot({ path: `${SHOTS}/state-error.png` });
    await page.evaluate(setScenario(), null);
    // a page may have several independent queries; retry each error bar
    for (let i = 0; i < 5 && (await page.getByTestId('state-error').count()) > 0; i++) {
      await page.getByTestId('state-error').first().getByRole('button', { name: 'ลองใหม่' }).click();
      await page.waitForTimeout(500);
    }
    await expect(page.getByTestId('state-error')).toHaveCount(0, { timeout: 15_000 });

    await page.evaluate(setScenario(), 'empty');
    await page.goto(path);
    if (!/^\/(energy|findings\/|assets\/)$/.test(path) && !/\/(findings|assets)\/.+/.test(path) && path !== '/energy') {
      const empty = page.getByTestId('state-empty').first();
      await expect(empty).toBeVisible();
      await expect(empty.getByRole('button', { name: 'รีเฟรช' })).toBeVisible();
      if (path === '/findings') await page.screenshot({ path: `${SHOTS}/state-empty.png` });
    }
    await page.evaluate(setScenario(), null);
  });
}
