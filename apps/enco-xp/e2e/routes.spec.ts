import { ROUTES, SHOTS, axe, expect, open, test } from './fixtures';

for (const [path, heading] of ROUTES) {
  test(`route ${path} renders heading + demo banner, no console errors, axe clean`, async ({ page, errors }) => {
    await open(page, path);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
    await expect(page.getByRole('note')).toContainText('DEMO DATA');
    await expect(page.getByTestId('state-loading')).toHaveCount(0);
    const v = await axe(page);
    expect(v.map((x) => `${x.id} (${x.impact}): ${x.nodes.length} nodes`)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('sidebar nav links reach correct routes', async ({ page, errors }) => {
  await open(page, '/');
  const nav = [['Asset Health', '/assets'], ['Energy', '/energy'], ['Findings', '/findings'], ['Work Orders', '/work-orders'], ['Verification', '/verification'], ['M&V', '/mv'], ['Data Quality', '/data-quality'], ['Overview', '/']];
  for (const [label, url] of nav) {
    await page.getByRole('navigation').getByRole('link', { name: new RegExp(`^${label.replace('&', '\\&')}`) }).click();
    await expect(page).toHaveURL(new RegExp(`${url}$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

for (const width of [1280, 1920]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const [path] of ROUTES) {
      await open(page, path);
      await page.waitForTimeout(300);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, `${path} overflow`).toBeLessThanOrEqual(0);
    }
    await page.screenshot({ path: `${SHOTS}/overview-${width}.png` });
  });
}
