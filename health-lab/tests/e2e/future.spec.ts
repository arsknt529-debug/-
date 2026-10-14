import { choose, expect, next, test } from './fixtures';

test('10問に答え、7日間のギフトを始めて記録できる（端末内のみ）', async ({ page, network }) => {
  void network;
  await page.goto('/health-lab/future');
  await page.getByRole('button', { name: /10問ではじめる/ }).click();
  const answers = ['ほぼ毎日ある', 'ときどき動く', 'わからない', 'わからない', '足りない日が多い', 'ほとんどない', '取れている', '定期的にある', '答えたくない', '答えたくない'];
  for (const [i, label] of answers.entries()) {
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', String(i + 1));
    await choose(page, label);
    await next(page);
  }
  await expect(page.getByRole('heading', { level: 1, name: '未来の自分に贈りたいこと' })).toBeVisible();
  const cared = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '今、大切にできている習慣' }) });
  await expect(cared).toContainText('身体を動かす');
  await expect(cared).toContainText('心の余白');
  const room = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '見直す余地がある習慣' }) });
  await expect(room).toContainText('睡眠と回復');
  await expect(room).not.toContainText('身体をつくる食事'); // わからない は数えない
  await expect(page.getByText('答えなかった・わからなかった領域は、今回は結果に含めていません。')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('健康年齢は');

  // 7日間のギフト
  const gift = page.locator('#gift');
  await expect(gift.getByRole('button', { name: '約束を1つ選んでください' })).toBeDisabled();
  await gift.getByRole('button', { name: /寝る前に10分/ }).click();
  await gift.getByRole('button', { name: 'この約束で始める' }).click();
  const day1 = gift.getByRole('button', { name: /^1日目/ });
  await expect(gift.getByRole('button', { name: /^2日目/ })).toBeDisabled();
  await day1.click();
  await expect(day1).toHaveAttribute('aria-pressed', 'true');
  await expect(gift).toContainText('これまでに1日、自分を大切にする時間がありました。');

  // 再読み込み後も端末内に残っている（トップから続きを開ける）
  await page.goto('/health-lab/future');
  await page.getByRole('button', { name: '7日間のギフトの続きを見る' }).click();
  await expect(page.locator('#gift').getByRole('button', { name: /^1日目/ })).toHaveAttribute('aria-pressed', 'true');

  // 記録を消せる
  await page.getByRole('button', { name: /約束を選び直す/ }).click();
  await expect(page.locator('#gift').getByRole('button', { name: '約束を1つ選んでください' })).toBeVisible();
  const stored = await page.evaluate(() => Object.keys(window.localStorage));
  expect(stored).toEqual([]);
});
