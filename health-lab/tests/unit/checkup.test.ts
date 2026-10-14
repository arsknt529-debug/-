import { describe, expect, it } from 'vitest';
import { checkupItems, findItem } from '@/features/health-lab/content/checkup';
import { buildCheckupResult, buildTrend, checkPlausibility, parseNumber, type CheckupRecord } from '@/features/health-lab/engine/checkup';

const rec = (p: Partial<CheckupRecord>): CheckupRecord => ({ key: 1, itemId: 'hba1c', unitId: '%', value: 5.6, judgment: 'normal', ...p });

describe('数値の入力チェック', () => {
  it.each([
    ['5.6', 5.6],
    ['５．６', 5.6],
    [' 120 ', 120],
    ['0.8', 0.8],
  ])('%s を %d として読む', (raw, value) => {
    expect(parseNumber(raw)).toEqual({ ok: true, value });
  });

  it.each([
    ['', 'empty'],
    ['5,6', 'comma'],
    ['5..6', 'invalid'],
    ['abc', 'invalid'],
    ['1e3', 'invalid'],
    ['-3', 'negative'],
  ])('%s はエラー（%s）', (raw, reason) => {
    expect(parseNumber(raw)).toEqual({ ok: false, reason });
  });
});

describe('単位・桁の確認（医学的な判定ではない）', () => {
  const hba1c = findItem('hba1c')!;
  const cre = findItem('cre')!;
  it('HbA1c を % で 56 と入力すると、mmol/mol の取り違えを確認する', () => {
    const r = checkPlausibility(hba1c, '%', 56);
    expect(r.status).toBe('unit_mismatch');
    if (r.status === 'unit_mismatch') expect(r.suggestedUnit.id).toBe('mmol/mol');
  });
  it('クレアチニンを mg/dL で 80 と入力すると、µmol/L の取り違えを確認する', () => {
    expect(checkPlausibility(cre, 'mg/dL', 80).status).toBe('unit_mismatch');
  });
  it('起こりにくい桁は確認を促す', () => {
    expect(checkPlausibility(findItem('sbp')!, 'mmHg', 1200).status).toBe('out_of_range');
  });
  it('通常の値はそのまま通す', () => {
    expect(checkPlausibility(hba1c, '%', 5.6).status).toBe('ok');
  });
  it('14項目すべてに単位がある', () => {
    expect(checkupItems).toHaveLength(14);
    for (const i of checkupItems) expect(i.units.length).toBeGreaterThan(0);
  });
});

describe('健診の結果', () => {
  it('HbA1c の意味は指示書どおり', () => {
    const r = buildCheckupResult(rec({}), [rec({})]);
    expect(r.discovery[0]).toBe('HbA1cは、最近1〜2か月程度の血糖状態を反映する指標です。');
    expect(r.safety).toBeUndefined();
  });

  it.each(['recheck', 'detailed'] as const)('判定が %s の場合、医療機関の指示を最上部に表示する', (judgment) => {
    const r = buildCheckupResult(rec({ judgment }), []);
    expect(r.safety?.[0]).toMatch(/健診機関の案内に従って/);
  });

  it('入力値の高い・低いは判定しない（値によって文言が変わらない）', () => {
    const a = buildCheckupResult(rec({ value: 5.0 }), []);
    const b = buildCheckupResult(rec({ value: 9.5 }), []);
    expect(a.discovery).toEqual(b.discovery);
    expect(a.understanding).toEqual(b.understanding);
  });

  it('グラフは同じ項目・同じ単位・検査日ありの値が2件以上のときだけ', () => {
    const records = [
      rec({ key: 1, date: '2024-06-01', value: 5.5 }),
      rec({ key: 2, value: 5.7 }), // 日付なし
      rec({ key: 3, date: '2025-06-01', unitId: 'mmol/mol', value: 38 }), // 単位違い
    ];
    expect(buildTrend(records, 'hba1c', '%')).toEqual([]);
    records.push(rec({ key: 4, date: '2025-06-01', value: 5.8 }));
    expect(buildTrend(records, 'hba1c', '%').map((p) => p.value)).toEqual([5.5, 5.8]);
  });
});
