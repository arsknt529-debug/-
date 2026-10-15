import { choose, expect, next, test } from './fixtures';

const COMMON_CALM = ['数日前から', 'ときどき', '気になるが普段どおり過ごせる', 'あまり変わらない', '特に思い当たらない'];

test('最初の画面で急を要する症状への119番の案内を1行で示し、専用ページは出さない', async ({ page, network }) => {
  void network;
  await page.goto('/health-lab/signals');
  await expect(page.getByText(/このチェックを使わずにすぐ119番へ/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'ある', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '気になる不調を選んでください（複数可）' })).toBeVisible();
});

test('通常の流れ：複数の症状を選び、症状別の質問に答えて「身体からの手紙」を受け取る', async ({ page, network }) => {
  void network;
  await page.goto('/health-lab/signals');
  await expect(page.getByRole('button', { name: '選ぶと次へ進めます' })).toBeDisabled();
  await choose(page, '疲れ・だるさ');
  await choose(page, '睡眠の悩み');
  await page.getByRole('button', { name: '2つを選んで次へ' }).click();

  for (const label of COMMON_CALM) {
    await choose(page, label);
    await next(page);
  }
  await choose(page, 'ときどきある');
  await next(page);
  await choose(page, 'ない');
  await next(page);
  for (const label of ['ときどきある', 'ときどきある', '多くの日にある']) {
    await choose(page, label);
    await next(page);
  }
  await expect(page.getByRole('heading', { level: 1, name: '身体からの手紙' })).toBeVisible();
  await expect(page.getByText('最近、疲れやだるさを感じることがあるようです。')).toBeVisible();
  await expect(page.getByRole('heading', { name: '医療機関への相談が必要な場合' })).toBeVisible();
  await expect(page.getByText('60秒の健康習慣動画')).toBeVisible();

  // ページ内リンクをたどっても結果画面は消えない
  await page.getByRole('link', { name: '不調の記録方法' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '身体からの手紙' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: '身体からの手紙' })).toBeVisible();
});

test('急に悪化した場合は受診を優先し、通常コンテンツへ誘導しない', async ({ page, network }) => {
  void network;
  await page.goto('/health-lab/signals');
  await choose(page, 'その他の不調');
  await page.getByRole('button', { name: '1つを選んで次へ' }).click();
  const answers = ['今日・昨日から', 'ほぼ毎日', '少し影響している', '急に悪くなった', '特に思い当たらない', 'よくわからない'];
  for (const label of answers) {
    await choose(page, label);
    await next(page);
  }
  await expect(page.getByRole('note', { name: '医療機関への相談をおすすめします' })).toBeVisible();
  await expect(page.getByText('60秒の健康習慣動画')).toHaveCount(0);
});

test('息苦しさを選ぶと、その場で119番の案内を表示し、結果の最上部にも出す', async ({ page, network }) => {
  void network;
  await page.goto('/health-lab/signals');
  await choose(page, 'むくみ');
  await page.getByRole('button', { name: '1つを選んで次へ' }).click();
  for (const label of COMMON_CALM) {
    await choose(page, label);
    await next(page);
  }
  await choose(page, '両側');
  await next(page);
  await choose(page, '少しずつ気になってきた');
  await next(page);
  await choose(page, '息苦しさがある');
  await expect(page.getByRole('note', { name: 'すぐに119番へ' })).toBeVisible();
  await next(page);
  await expect(page.getByRole('heading', { level: 1, name: '身体からの手紙' })).toBeVisible();
  await expect(page.getByRole('note', { name: 'すぐに119番へ' })).toBeVisible();
  await expect(page.getByText('60秒の健康習慣動画')).toHaveCount(0);
});
