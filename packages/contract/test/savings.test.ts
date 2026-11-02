import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSavings, type Savings } from '../src/index.ts';
import { savings } from '../../../mocks/src/index.ts';

const ok: Savings = { savings_id: 'S-T', finding_id: 'F-1', asset_id: 'ENP-X', period_start: '2026-10-01', period_end: '2026-10-31',
  baseline_energy_kwh: 1000, actual_energy_kwh: 876.5, savings_energy_kwh: 123.5, tariff_thb_per_kwh: 4.37, savings_amount_thb: 539.7, currency: 'THB', method: 'IPMVP_B', mv_status: 'PENDING' };

test('valid savings passes', () => assert.deepEqual(validateSavings(ok), []));
test('all fixtures are valid', () => savings.forEach((s) => assert.deepEqual(validateSavings(s), [], s.savings_id)));
test('savings_energy_kwh must equal baseline - actual', () => assert.match(validateSavings({ ...ok, savings_energy_kwh: 120 }).join(), /baseline_energy_kwh - actual/));
test('period_end must be after period_start', () => {
  assert.match(validateSavings({ ...ok, period_end: '2026-10-01' }).join(), /period_end/);
  assert.match(validateSavings({ ...ok, period_end: '2026-09-30' }).join(), /period_end/);
});
test('amount within ±0.01 THB of energy * tariff (123.5 * 4.37 = 539.695)', () => {
  assert.deepEqual(validateSavings({ ...ok, savings_amount_thb: 539.695 }), []); // exact
  assert.deepEqual(validateSavings({ ...ok, savings_amount_thb: 539.705 }), []); // +0.01 passes
  assert.deepEqual(validateSavings({ ...ok, savings_amount_thb: 539.685 }), []); // -0.01 passes
  assert.match(validateSavings({ ...ok, savings_amount_thb: 539.715 }).join(), /savings_amount_thb/); // +0.02 fails
  assert.match(validateSavings({ ...ok, savings_amount_thb: 539.675 }).join(), /savings_amount_thb/); // -0.02 fails
});
test('method must be IPMVP_A|B|C|D', () => assert.match(validateSavings({ ...ok, method: 'IPMVP Option B' as never }).join(), /method/));
test('tariff must be > 0', () => assert.match(validateSavings({ ...ok, tariff_thb_per_kwh: 0 }).join(), /tariff/));
