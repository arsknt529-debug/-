import { expect, expectCleanUrl, test } from './fixtures';

test('単位の取り違えを確認し、受診指示を優先表示する', async ({ page, network }) => {
  void network;
  await page.goto('/health-lab/checkup');
  await page.getByRole('button', { name: /気になる数値を入力する/ }).click();

  await page.getByLabel('検査項目').selectOption('hba1c');
  // 未入力
  await page.getByRole('button', { name: '確認して意味を見る' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('検査値を入力してください');
  // カンマ
  await page.getByLabel('検査値').fill('5,6');
  await page.getByRole('button', { name: '確認して意味を見る' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('ピリオド');
  // 判定未選択
  await page.getByLabel('検査値').fill('56');
  await page.getByRole('button', { name: '確認して意味を見る' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('判定を選んでください');
  await page.getByRole('button', { name: '要再検査' }).click();
  // 単位の確認
  await page.getByRole('button', { name: '確認して意味を見る' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('mmol/mol');
  // 単位を直す
  await page.getByLabel('単位').selectOption('mmol/mol');
  await page.getByLabel('検査日').fill('2025-06-01');
  await page.getByRole('button', { name: '確認して意味を見る' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'HbA1c' })).toBeVisible();
  await expect(page.getByText('HbA1cは、最近1〜2か月程度の血糖状態を反映する指標です。')).toBeVisible();
  const safety = page.getByRole('note', { name: '大切なお知らせ' });
  await expect(safety).toContainText('再検査を受けてください');
  await expectCleanUrl(page, '/health-lab/checkup');

  // 別の検査日の値を追加するとグラフが出る
  await page.getByRole('button', { name: '別の検査日の値を追加する' }).click();
  await expect(page.getByLabel('単位')).toHaveValue('mmol/mol');
  await page.getByLabel('検査値').fill('40');
  await page.getByLabel('検査日').fill('2026-06-01');
  await page.getByRole('button', { name: '異常なし' }).click();
  await page.getByRole('button', { name: '確認して意味を見る' }).click();
  await expect(page.getByRole('img', { name: /HbA1cの推移/ })).toBeVisible();
});

test('検査項目の意味から知る', async ({ page, network }) => {
  void network;
  await page.goto('/health-lab/checkup');
  await page.getByRole('button', { name: /腎臓の働き/ }).click();
  await expect(page.getByRole('heading', { name: 'eGFR' })).toBeVisible();
  await page.getByRole('button', { name: 'この項目の数値を入力する' }).first().click();
  await expect(page.getByLabel('検査項目')).toHaveValue('cre');
});
