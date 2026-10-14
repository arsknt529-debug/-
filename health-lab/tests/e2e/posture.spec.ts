import { choose, expect, expectCleanUrl, next, test } from './fixtures';

const ANSWERS = ['背中が丸くなりやすい', '首・肩', '片脚に体重を乗せがち', '頭が前に出ている', '脚を組むことが多い', '無理なく上がる', '頭が壁から離れやすい', '姿勢を整えるヒント'];

test('8問に答えて結果が出る／未回答では進めない／戻ると回答が残っている', async ({ page, network }) => {
  void network;
  await page.goto('/health-lab/posture');
  await page.getByRole('button', { name: 'はじめる' }).click();

  await expect(page.getByRole('button', { name: '選ぶと次へ進めます' })).toBeDisabled();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');

  await choose(page, ANSWERS[0]);
  await next(page);
  await expect(page.getByRole('heading', { name: '普段、どこに疲れを感じやすいですか？' })).toBeVisible();

  // ブラウザの戻る（LINE のスワイプ戻る相当）で前の質問に戻り、回答が残っている
  await page.goBack();
  await expect(page.getByRole('heading', { name: '長時間座った後、どんな姿勢になりやすいですか？' })).toBeVisible();
  await expect(page.getByRole('button', { name: ANSWERS[0], exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.goForward();
  await expect(page.getByRole('heading', { name: '普段、どこに疲れを感じやすいですか？' })).toBeVisible();

  // 画面内の「戻る」
  await page.getByRole('button', { name: '戻る', exact: true }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await next(page);

  for (const label of ANSWERS.slice(1)) {
    await choose(page, label);
    await next(page);
  }
  await expect(page.getByRole('heading', { name: /見つけたこと/ })).toBeVisible();
  await expect(page.getByText('首・肩まわりへの負担が気になっているようです。')).toBeVisible();
  await expect(page.getByText('今日は一度、席から立って身体を動かしてみませんか？')).toBeVisible();
  await expect(page.getByText('60秒セルフケア')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('猫背です');
  await expectCleanUrl(page, '/health-lab/posture');

  // やり直すと最初に戻り、回答が消える
  await page.getByRole('button', { name: 'やり直す' }).click();
  await page.getByRole('button', { name: 'はじめる' }).click();
  await expect(page.getByRole('button', { name: ANSWERS[0], exact: true })).toHaveAttribute('aria-pressed', 'false');
});

test('痛みがある場合は運動を提案しない', async ({ page, network }) => {
  void network;
  await page.goto('/health-lab/posture');
  await page.getByRole('button', { name: 'はじめる' }).click();
  const answers = [...ANSWERS];
  answers[5] = '痛みがある・試せない';
  answers[6] = 'わからない・試せない';
  for (const label of answers) {
    await choose(page, label);
    await next(page);
  }
  await expect(page.getByText(/無理に身体を動かさないでください/)).toBeVisible();
  await expect(page.getByText('60秒セルフケア')).toHaveCount(0);
  await expect(page.getByText(/休む時間を作ってみませんか/)).toBeVisible();
});
