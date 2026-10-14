import { describe, expect, it } from 'vitest';
import { signalsCopy } from '@/features/health-lab/content/signals';

/**
 * 公開ゲート：「不調のサインを知る」は、文言がすべて監修済み（reviewed）になるまで本番で有効にしない。
 * CI で HEALTHLAB_RELEASE=production を指定したビルド前チェックとして実行する想定。
 */
describe('不調のサインの公開ゲート', () => {
  const draftKeys = Object.entries(signalsCopy)
    .filter(([, c]) => c.review !== 'reviewed')
    .map(([k]) => k);

  it.runIf(process.env.HEALTHLAB_RELEASE === 'production' && process.env.NEXT_PUBLIC_HEALTHLAB_SIGNALS_ENABLED === 'true')(
    '本番で有効にする場合、監修前の文言が残っていない',
    () => {
      expect(draftKeys).toEqual([]);
    },
  );

  it('監修前の文言の一覧を取得できる（監修依頼用）', () => {
    expect(Array.isArray(draftKeys)).toBe(true);
  });
});
