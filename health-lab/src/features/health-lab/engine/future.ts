import { ROUTES } from '../content/links';
import { domains, futureCopy as C, futureQuestions, promises, type DomainId, type Tone } from '../content/future';
import type { Answers, CommonResult } from '../content/types';
import { single, textOf } from './answers';

const t = (key: string) => textOf(C, key);

export type DomainStatus = 'cared' | 'room' | 'skipped';

/**
 * 領域ごとの整理（点数としては表示しない）
 *  - 「わからない」「答えたくない」は数えない
 *  - 見直す余地（room）の回答が1つでもあれば → room
 *  - 大切にできている（cared）の回答があれば → cared
 *  - ときどき（partial）だけの場合 → room（「見直す余地」はやさしい表現で表示）
 *  - すべて数えない回答 → skipped（結果に表示しない）
 */
export function classifyDomains(answers: Answers): Record<DomainId, DomainStatus> {
  const result = {} as Record<DomainId, DomainStatus>;
  for (const domain of domains) {
    const tones: Tone[] = futureQuestions
      .filter((q) => q.domain === domain.id)
      .map((q) => {
        const answer = single(answers, q.id);
        return answer ? q.tones[answer] ?? 'neutral' : 'neutral';
      })
      .filter((tone) => tone !== 'neutral');
    if (tones.length === 0) result[domain.id] = 'skipped';
    else if (tones.includes('room')) result[domain.id] = 'room';
    else if (tones.includes('cared')) result[domain.id] = 'cared';
    else result[domain.id] = 'room';
  }
  return result;
}

export interface FutureResult extends CommonResult {
  cared: { domain: DomainId; name: string; text: string }[];
  room: { domain: DomainId; name: string; text: string }[];
  skippedAny: boolean;
  /** 7日間のギフトで先頭に並べる約束（見直す余地のある領域を優先） */
  promiseOrder: string[];
}

export function buildFutureResult(answers: Answers): FutureResult {
  const status = classifyDomains(answers);
  const cared = domains.filter((d) => status[d.id] === 'cared').map((d) => ({ domain: d.id, name: d.name, text: t(`future.cared.${d.id}`) }));
  const room = domains.filter((d) => status[d.id] === 'room').map((d) => ({ domain: d.id, name: d.name, text: t(`future.room.${d.id}`) }));
  const skippedAny = domains.some((d) => status[d.id] === 'skipped');

  const roomDomains = room.map((r) => r.domain);
  const promiseOrder = [
    ...promises.filter((p) => roomDomains.includes(p.domain)),
    ...promises.filter((p) => !roomDomains.includes(p.domain)),
  ].map((p) => p.id);
  const first = promises.find((p) => p.id === promiseOrder[0]) ?? promises[0];

  const discovery: string[] = [];
  if (cared.length === 0 && room.length === 0) discovery.push(t('future.all_skipped'));
  else if (cared.length === 0) discovery.push(t('future.none_cared'));
  else if (room.length === 0) discovery.push(t('future.none_room'));

  return {
    cared,
    room,
    skippedAny,
    promiseOrder,
    discovery,
    understanding: [t('future.understanding'), ...(skippedAny ? [t('future.skipped')] : [])],
    gift: `今日は「${first.text}」から始めてみませんか？`,
    nextSteps: [
      { label: '7日間のギフトに参加する', href: '#gift' },
      { label: '他の3つのセルフチェック', href: ROUTES.hub },
    ],
    footnote: t('future.footnote'),
  };
}
