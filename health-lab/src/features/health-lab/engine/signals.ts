import { LINKS, ROUTES } from '../content/links';
import { commonQuestions, followUpQuestions, signalsCopy as C, symptoms, type SymptomId } from '../content/signals';
import type { Answers, CommonResult, NextStep, Question } from '../content/types';
import { single, textOf } from './answers';

const t = (key: string) => textOf(C, key);

/**
 * 受診目安の段階（仮案・医療専門職の監修が公開条件）
 * emergency > seek_soon > consult > reflect
 */
export type TriageLevel = 'emergency' | 'seek_soon' | 'consult' | 'reflect';

const LEVEL_ORDER: TriageLevel[] = ['reflect', 'consult', 'seek_soon', 'emergency'];
const higher = (a: TriageLevel, b: TriageLevel) => (LEVEL_ORDER.indexOf(a) >= LEVEL_ORDER.indexOf(b) ? a : b);

/** 選んだ症状に応じた質問列（共通Q1〜Q5 → 症状別の追加質問） */
export function buildSignalsQuestions(selected: SymptomId[]): Question[] {
  const ordered = symptoms.map((s) => s.id).filter((id) => selected.includes(id));
  return [...commonQuestions, ...ordered.flatMap((id) => followUpQuestions[id])];
}

/** 現在選んでいる症状の質問に対する回答だけを残す（症状を選び直した場合の古い回答を除く） */
export function pickAnswers(selected: SymptomId[], answers: Answers): Answers {
  const ids = new Set(buildSignalsQuestions(selected).map((q) => q.id));
  return Object.fromEntries(Object.entries(answers).filter(([id]) => ids.has(id)));
}

/** 回答の中に「選んだ時点で緊急案内に切り替える」選択肢があるか */
export function hasEmergencyAnswer(answers: Answers): boolean {
  return Object.entries(followUpQuestions).some(([, questions]) =>
    questions.some((q) => q.options.some((o) => o.emergency && answers[q.id] === o.id)),
  );
}

export interface Triage {
  level: TriageLevel;
  /** こころの安全に関わる回答があった（相談窓口を最上部に表示） */
  crisis: boolean;
  /** どの条件で段階が上がったか（監修・テスト用） */
  reasons: string[];
}

/**
 * 受診目安の判定（仮案）。
 * 監修者が条件表として確認できるよう、条件を1行ずつ並べている。
 */
export function triage(selected: SymptomId[], rawAnswers: Answers): Triage {
  const answers = pickAnswers(selected, rawAnswers);
  let level: TriageLevel = 'reflect';
  const reasons: string[] = [];
  const raise = (to: TriageLevel, reason: string) => {
    level = higher(level, to);
    reasons.push(`${to}:${reason}`);
  };
  const a = (id: string) => single(answers, id);

  if (hasEmergencyAnswer(answers)) raise('emergency', 'emergency_option');

  // 共通質問
  if (a('c4_change') === 'sudden') raise('seek_soon', 'c4_sudden');
  if (a('c3_impact') === 'major') raise('seek_soon', 'c3_major');
  if (a('c4_change') === 'gradual') raise('consult', 'c4_gradual');
  if ((a('c1_since') === 'weeks' || a('c1_since') === 'months') && a('c2_frequency') === 'daily') raise('consult', 'long_daily');
  if (a('c1_since') === 'months' && a('c4_change') !== 'better') raise('consult', 'c1_months');

  // 症状別
  if (selected.includes('fatigue')) {
    if (a('fatigue_with') === 'yes') raise('seek_soon', 'fatigue_with');
    if (a('fatigue_rest') === 'always') raise('consult', 'fatigue_rest_always');
  }
  if (selected.includes('edema')) {
    if (a('edema_side') === 'one' && (a('edema_onset') === 'sudden' || a('edema_with') === 'pain')) raise('seek_soon', 'edema_one_side');
    if (a('edema_onset') === 'sudden') raise('seek_soon', 'edema_sudden');
    if (a('edema_with') === 'pain') raise('seek_soon', 'edema_pain');
  }
  if (selected.includes('stress')) {
    if (a('stress_impact') === 'major') raise('seek_soon', 'stress_major');
  }
  if (selected.includes('sleep')) {
    if (a('sleep_morning') === 'rarely' && a('c1_since') !== 'days0' && a('c1_since') !== 'days') raise('consult', 'sleep_unrested');
  }
  if (selected.includes('shoulder_back')) {
    if (a('sb_numb') === 'yes') raise('seek_soon', 'sb_numb');
    if (a('sb_pain') === 'strong') raise('seek_soon', 'sb_strong_pain');
  }
  if (selected.includes('cold')) {
    if (a('cold_with') === 'yes') raise('seek_soon', 'cold_with');
    if (a('cold_where') === 'one_side') raise('consult', 'cold_one_side');
  }
  if (selected.includes('stomach')) {
    if (a('st_blood') === 'yes') raise('seek_soon', 'st_blood');
    if (a('st_pain') === 'strong') raise('seek_soon', 'st_strong_pain');
    if (a('st_bowel') === 'persistent') raise('consult', 'st_bowel');
  }
  if (selected.includes('other')) {
    if (a('other_state') === 'sudden') raise('seek_soon', 'other_sudden');
    if (a('other_state') === 'long' || a('other_state') === 'unknown') raise('consult', 'other_long_or_unknown');
  }

  const crisis = selected.includes('stress') && a('stress_safety') === 'yes';
  return { level, crisis, reasons };
}

export interface SignalsResult extends CommonResult {
  triage: Triage;
  /** 医療機関への相談が必要な場合の案内（常に表示） */
  medical: string;
  /** こころの相談窓口（crisis のときのみ） */
  crisis?: { title: string; body: string; line: string };
}

export function buildSignalsResult(selected: SymptomId[], rawAnswers: Answers): SignalsResult {
  const answers = pickAnswers(selected, rawAnswers);
  const result = triage(selected, answers);
  const ordered = symptoms.map((s) => s.id).filter((id) => selected.includes(id));
  const primary = ordered[0] ?? 'other';
  const careFirst = result.level === 'seek_soon' || result.level === 'emergency' || result.crisis;

  const safety: string[] = [];
  if (result.level === 'seek_soon' || result.level === 'emergency') safety.push(t('signals.seek_soon'));
  else if (result.level === 'consult') safety.push(t('signals.consult'));

  // 1. あなたが気づいたこと
  const discovery = ordered.map((id) => t(`signals.discovery.${id}`));

  // 2. 見つめ直したい生活のポイント
  const understanding = [t('signals.understanding.general')];
  const c5 = single(answers, 'c5_lifestyle');
  if (c5 && c5 !== 'none') understanding.push(t(`signals.understanding.c5.${c5}`));
  if (ordered.includes('sleep')) understanding.push(t('signals.understanding.sleep'));
  if (ordered.includes('stress')) understanding.push(t('signals.understanding.stress'));

  // 3. 今日の小さなギフト — 受診をすすめる場合はセルフケアを提案しない
  let gift = careFirst ? t('signals.gift.care') : t(`signals.gift.${primary}`);
  if (!careFirst && primary === 'shoulder_back' && single(answers, 'sb_motion') === 'worse') gift = t('signals.gift.fatigue');

  // 次のアクション — 受診をすすめる場合は通常の健康コンテンツへの導線を出さない（誤誘導防止）
  const nextSteps: NextStep[] = careFirst
    ? [
        { label: '不調の記録方法', href: '#record' },
        { label: '他のセルフチェックを見る', href: ROUTES.hub },
      ]
    : [
        { label: '60秒の健康習慣動画', href: LINKS.habitVideo60 },
        { label: '不調の記録方法', href: '#record' },
        { label: '7日後の振り返り', href: '#revisit', description: '7日後にもう一度チェックしてみましょう' },
        { label: 'XCOUNTの健康情報', href: LINKS.xcountHealthInfo },
        { label: '他の3つのセルフチェック', href: ROUTES.hub },
      ];

  return {
    triage: result,
    safety: safety.length ? safety : undefined,
    crisis: result.crisis
      ? { title: t('signals.crisis.title'), body: t('signals.crisis.body'), line: t('signals.crisis.line') }
      : undefined,
    discovery,
    understanding,
    gift,
    nextSteps,
    medical: t('signals.medical'),
    footnote: t('signals.footnote'),
  };
}

export function signalsText(key: string): string {
  return t(key);
}
