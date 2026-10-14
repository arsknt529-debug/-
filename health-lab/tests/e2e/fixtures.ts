import { expect, test as base, type Page } from '@playwright/test';

/**
 * すべてのテストで、外部（localhost 以外）への通信と、POST 等のデータ送信が起きていないことを確認する。
 */
export const test = base.extend<{ network: { external: string[]; writes: string[] } }>({
  network: async ({ page }, use) => {
    const external: string[] = [];
    const writes: string[] = [];
    page.on('request', (req) => {
      const url = new URL(req.url());
      if (!['127.0.0.1', 'localhost'].includes(url.hostname) && url.protocol.startsWith('http')) external.push(req.url());
      if (req.method() !== 'GET' && req.method() !== 'HEAD') writes.push(`${req.method()} ${req.url()}`);
    });
    const record = { external, writes };
    await use(record);
    expect(external, '外部への通信が発生しました').toEqual([]);
    expect(writes, 'データ送信（GET以外）が発生しました').toEqual([]);
  },
});

export { expect };

/** 回答値が URL に含まれていないこと */
export async function expectCleanUrl(page: Page, path: string) {
  const url = new URL(page.url());
  expect(url.pathname).toBe(path);
  expect(url.search).toBe('');
}

export async function choose(page: Page, label: string) {
  await page.getByRole('button', { name: label, exact: true }).click();
}

export async function next(page: Page) {
  await page.getByRole('button', { name: /^(次へ|結果を見る)$/ }).click();
}
