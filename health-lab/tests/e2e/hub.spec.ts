import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { choose, expect, expectCleanUrl, next, test } from './fixtures';

// @axe-core/playwright が参照する playwright-core の型とバージョン差があるため変換する
type AxePage = ConstructorParameters<typeof AxeBuilder>[0]['page'];
const axe = (page: Page) => new AxeBuilder({ page: page as unknown as AxePage });

test('一覧に4つのコンテンツが並び、それぞれに移動できる', async ({ page, network }) => {
  void network;
  await page.goto('/health-lab');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('あなたの身体、');
  const nav = page.getByRole('navigation', { name: '4つの健康コンテンツ' });
  for (const name of ['骨格・姿勢を知る', '健康診断を読み解く', '不調のサインを知る', '未来の健康を考える']) {
    await expect(nav.getByRole('link', { name: new RegExp(name) })).toBeVisible();
  }
  await expect(page.getByText('セルフチェックは医療診断ではありません。')).toBeVisible();
  await nav.getByRole('link', { name: /未来の健康を考える/ }).click();
  await expect(page).toHaveURL(/\/health-lab\/future$/);
});

test('/liff から一覧へ移動する', async ({ page, network }) => {
  void network;
  await page.goto('/liff');
  await expect(page).toHaveURL(/\/health-lab$/);
});

test('アクセシビリティ：一覧と結果画面に重大な問題がない', async ({ page, network }) => {
  void network;
  await page.goto('/health-lab');
  const hub = await axe(page).analyze();
  expect(hub.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);

  await page.goto('/health-lab/posture');
  await page.getByRole('button', { name: 'はじめる' }).click();
  for (const label of ['背中が丸くなりやすい', '首・肩', '片脚に体重を乗せがち', '頭が前に出ている', '脚を組むことが多い', '無理なく上がる', '頭が壁から離れやすい', '姿勢を整えるヒント']) {
    await choose(page, label);
    await next(page);
  }
  await expectCleanUrl(page, '/health-lab/posture');
  const result = await axe(page).analyze();
  expect(result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
});
