import { LINKS, ROUTES } from '../content/links';
import { postureCopy as C } from '../content/posture';
import type { Answers, CommonResult } from '../content/types';
import { has, single, textOf } from './answers';

const t = (key: string) => textOf(C, key);

/** DISCOVERY に載せる質問の優先順（上から最大3件） */
const DISCOVERY_ORDER = ['q2_fatigue', 'q4_mirror', 'q1_sitting', 'q6_arms', 'q7_wall', 'q3_weight', 'q5_chair'];
const MAX_DISCOVERY = 3;

/** Q6・Q7 で「痛みがある・試せない」を選んだか（運動の提案を止める） */
export function hasPainSignal(answers: Answers): boolean {
  return single(answers, 'q6_arms') === 'pain';
}

export function buildPostureResult(answers: Answers): CommonResult {
  const pain = hasPainSignal(answers);

  // 1. あなたが気づいたこと — 回答から直接言えることのみ
  const discovery: string[] = [];
  for (const qid of DISCOVERY_ORDER) {
    const answer = single(answers, qid);
    const key = `posture.discovery.${qid}.${answer}`;
    if (answer && has(C, key)) discovery.push(t(key));
    if (discovery.length >= MAX_DISCOVERY) break;
  }
  if (discovery.length === 0) discovery.push(t('posture.discovery.none'));

  // 2. 身体をもっと知るヒント
  const understanding: string[] = [];
  const sitting = single(answers, 'q1_sitting');
  const chair = single(answers, 'q5_chair');
  const weight = single(answers, 'q3_weight');
  if ((sitting && sitting !== 'none') || (chair && chair !== 'none')) understanding.push(t('posture.understanding.sitting'));
  if (weight && weight !== 'unknown') understanding.push(t('posture.understanding.standing'));
  const goal = single(answers, 'q8_goal');
  // 痛みがある場合は「運動の始め方」のヒントを出さない
  if (goal && !(pain && goal === 'start_exercise')) understanding.push(t(`posture.understanding.goal.${goal}`));
  understanding.push(t('posture.understanding.scope'));

  // 3. 今日からできる小さな一歩
  const fatigue = single(answers, 'q2_fatigue');
  const mirror = single(answers, 'q4_mirror');
  let gift: string;
  if (pain) gift = t('posture.gift.rest');
  else if (fatigue === 'neck_shoulder' || sitting === 'rounded' || mirror === 'head_forward') gift = t('posture.gift.stand_up');
  else if (chair === 'cross_legs' || weight === 'one_leg') gift = t('posture.gift.both_feet');
  else if (fatigue === 'lower_back') gift = t('posture.gift.walk_hourly');
  else if (goal === 'start_exercise') gift = t('posture.gift.walk_longer');
  else gift = t('posture.gift.breathe');

  return {
    safety: pain ? [t('posture.safety.pain')] : undefined,
    discovery,
    understanding,
    gift,
    nextSteps: [
      // 痛みがある場合はセルフケア動画（運動）への導線を出さない
      ...(pain ? [] : [{ label: '60秒セルフケア', href: LINKS.selfCare60 }]),
      { label: 'トレーナーに質問する', href: LINKS.askTrainer },
      { label: '無料姿勢チェックについて', description: 'ご希望の方のみ', href: LINKS.freePostureCheck },
      { label: '他の3つのセルフチェック', href: ROUTES.hub },
    ],
    footnote: t('posture.footnote'),
  };
}
