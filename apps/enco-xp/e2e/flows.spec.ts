import { SHOTS, api, expect, nav, open, test } from './fixtures';

test('Findings filter by status and severity', async ({ page, errors }) => {
  await open(page, '/findings');
  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(5);
  await page.getByRole('tab', { name: 'Pending' }).click();
  await expect(rows).toHaveCount(2);
  await page.getByLabel('severity').selectOption('HIGH');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('F-0012');
  await page.getByRole('tab', { name: 'Closed' }).click();
  await expect(page.getByTestId('state-empty')).toBeVisible();
  expect(errors).toEqual([]);
});

test('Full flow: PENDING → Verify/WO → VERIFIED → WO done → Close → CLOSED', async ({ page, errors }) => {
  await open(page, '/findings/F-0012');
  await page.screenshot({ path: `${SHOTS}/flow-1-pending.png` });
  await page.getByRole('button', { name: 'Verify & Create Work Order' }).click();
  await page.screenshot({ path: `${SHOTS}/flow-2-wo-modal.png` });
  await page.getByRole('button', { name: 'ยืนยันและส่ง' }).click();
  await expect(page.getByRole('status').filter({ hasText: /WO-DEMO-\d+/ })).toBeVisible();
  const wo = (await page.locator('dt:text-is("work_order_ref") + dd').textContent())!.trim();
  expect(wo).toMatch(/^WO-DEMO-\d+$/);
  await expect(page.locator('dt:text-is("status") + dd')).toContainText('Verified');
  await page.screenshot({ path: `${SHOTS}/flow-3-verified.png` });

  await page.getByRole('link', { name: 'ดู Work Order' }).click();
  const row = page.locator('tbody tr', { hasText: wo });
  await expect(row).toContainText('IN PROGRESS');
  await page.screenshot({ path: `${SHOTS}/flow-4-work-orders.png` });
  await row.getByRole('button', { name: 'จำลอง: งานเสร็จ' }).click();
  await expect(page).toHaveURL(/verification\?f=F-0012/);
  await expect(page.getByText('ก่อนแก้ไข')).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/flow-5-verification.png` });
  await page.getByRole('button', { name: 'ผ่าน · Close Finding' }).click();
  await expect(page.getByText('ปิด Finding แล้ว')).toBeVisible();
  await nav(page, 'Findings');
  await page.locator('tbody tr', { hasText: 'F-0012' }).click();
  await expect(page.locator('dt:text-is("status") + dd')).toContainText('Closed');
  await page.screenshot({ path: `${SHOTS}/flow-6-closed.png` });
  expect(errors).toEqual([]);
});

test('Verification reopen returns WO to in-progress', async ({ page }) => {
  await open(page, '/work-orders');
  await page.locator('tbody tr', { hasText: 'WO-DEMO-1187' }).getByRole('button', { name: 'จำลอง: งานเสร็จ' }).click();
  await page.getByRole('button', { name: 'ยังไม่ผ่าน · Reopen' }).click();
  await expect(page.getByText('รอ Work Order เสร็จ')).toBeVisible();
});

test('Reject: blank reason blocked; with reason → REJECTED, reason in list, no Create WO', async ({ page, errors }) => {
  await open(page, '/findings/F-0011');
  await page.getByRole('button', { name: 'Reject', exact: true }).click();
  const dlg = page.getByRole('dialog');
  await dlg.getByRole('button', { name: 'Reject' }).click();
  await expect(dlg.getByText('กรุณาระบุเหตุผล')).toBeVisible();
  await expect(dlg).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/reject-1-blank-blocked.png` });
  await dlg.getByLabel('rejection reason').fill('ค่าจาก VSD feedback ผิด (demo)');
  await dlg.getByRole('button', { name: 'Reject' }).click();
  await expect(dlg).toHaveCount(0);
  await expect(page.locator('dt:text-is("status") + dd')).toContainText('Rejected');
  await expect(page.getByRole('button', { name: 'Verify & Create Work Order' })).toHaveCount(0);
  await page.screenshot({ path: `${SHOTS}/reject-2-rejected.png` });
  expect(await api(page, '/api/findings/F-0011/work-order', 'POST', { finding_id: 'F-0011', priority: 'Low', due_date: '2026-11-09' })).toBe(409);
  await nav(page, 'Findings');
  await expect(page.locator('tbody tr', { hasText: 'F-0011' }).getByTestId('rejection-reason')).toContainText('VSD feedback');
  expect(errors).toEqual([]);
});

test('Transition rule: PENDING or REJECTED cannot go to CLOSED; VERIFIED can', async ({ page }) => {
  await open(page, '/');
  expect(await api(page, '/api/findings/F-0012/close')).toBe(409); // PENDING
  expect(await api(page, '/api/findings/F-0007/close')).toBe(409); // REJECTED
  expect(await api(page, '/api/findings/F-0009/close')).toBe(200); // VERIFIED
});

test('Keyboard-only Tab/Enter through Verify flow', async ({ page }) => {
  await open(page, '/findings/F-0012');
  const target = page.getByRole('button', { name: 'Verify & Create Work Order' });
  for (let i = 0; i < 40 && !(await target.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(target).toBeFocused();
  await page.keyboard.press('Enter');
  const submit = page.getByRole('dialog').getByRole('button', { name: 'ยืนยันและส่ง' });
  for (let i = 0; i < 10 && !(await submit.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(submit).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('dt:text-is("work_order_ref") + dd')).toContainText('WO-DEMO-');
});

test('M&V: figures hidden unless VERIFIED; PENDING shown', async ({ page }) => {
  await open(page, '/mv');
  const row = (id: string) => page.locator('tbody tr', { hasText: id });
  await expect(row('S-001')).toContainText('VERIFIED');
  await expect(row('S-001')).toContainText('2,300 kWh');
  await expect(row('S-002')).toContainText('PENDING');
  await expect(row('S-002')).not.toContainText('650');
  await expect(row('S-003')).toContainText('DISPUTED');
  await expect(row('S-003')).not.toContainText('860');
  await page.screenshot({ path: `${SHOTS}/mv.png` });
});

test('Data Quality flags on page and on asset charts', async ({ page }) => {
  await open(page, '/data-quality');
  await expect(page.locator('tbody tr', { hasText: 'CHP1_VIB' })).toContainText('SUSPECT');
  await expect(page.locator('tbody tr', { hasText: 'CT1_FAN_HZ' })).toContainText('MISSING');
  await page.screenshot({ path: `${SHOTS}/data-quality.png` });
  await open(page, '/assets/ENP-CHP-001');
  await page.getByLabel('tag').selectOption('CHP1_VIB');
  await expect(page.getByTestId('chart-quality')).toContainText('SUSPECT');
  await open(page, '/assets/ENP-CT-001');
  await expect(page.getByTestId('chart-quality')).toContainText('MISSING');
});

test('Asset Health row opens detail; kW/RT with unit and quality_flag', async ({ page }) => {
  await open(page, '/assets');
  await page.locator('tbody tr', { hasText: 'ENP-CH-002' }).click();
  await expect(page).toHaveURL(/assets\/ENP-CH-002$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Chiller #2');
  const kpi = page.locator('.card', { hasText: 'Efficiency' });
  await expect(kpi).toContainText('0.64');
  await expect(kpi).toContainText('kW/RT');
  await expect(kpi).toContainText('GOOD');
  await page.screenshot({ path: `${SHOTS}/asset-detail.png` });
});

test('Findings rows keyboard reachable via title link', async ({ page }) => {
  await open(page, '/findings');
  const link = page.getByRole('link', { name: 'Low CHW ΔT' });
  for (let i = 0; i < 40 && !(await link.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(link).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/findings\/F-0009$/);
});

test('Heading order and landmarks', async ({ page }) => {
  for (const p of ['/', '/energy', '/verification', '/mv']) {
    await open(page, p);
    const levels = await page.locator('h1,h2,h3,h4').evaluateAll((els) => els.map((e) => +e.tagName[1]));
    expect(levels[0]).toBe(1);
    levels.forEach((l, i) => i && expect(l - levels[i - 1]).toBeLessThanOrEqual(1));
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  }
});

test('M&V shows method + tariff; mock API validates savings math', async ({ page }) => {
  await open(page, '/mv');
  const row = page.locator('tbody tr', { hasText: 'S-001' });
  await expect(row).toContainText('IPMVP Option B');
  await expect(row).toContainText('4.30');
  const base = { savings_id: 'S-T', finding_id: 'F-1', asset_id: 'ENP-X', period_start: '2026-10-01', period_end: '2026-10-31', baseline_energy_kwh: 1000, actual_energy_kwh: 900, savings_energy_kwh: 100, tariff_thb_per_kwh: 4.3, savings_amount_thb: 430, currency: 'THB', method: 'IPMVP_B', mv_status: 'PENDING' };
  expect(await api(page, '/api/savings/validate', 'POST', base)).toBe(200);
  expect(await api(page, '/api/savings/validate', 'POST', { ...base, savings_energy_kwh: 99 })).toBe(422);
  expect(await api(page, '/api/savings/validate', 'POST', { ...base, period_end: '2026-09-01' })).toBe(422);
  expect(await api(page, '/api/savings/validate', 'POST', { ...base, savings_amount_thb: 431 })).toBe(422);
});
