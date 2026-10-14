import { LINKS, ROUTES } from '../content/links';
import { checkupCopy as C, findItem, type CheckupItem, type Judgment, type Unit } from '../content/checkup';
import type { CommonResult } from '../content/types';
import { textOf } from './answers';

const t = (key: string) => textOf(C, key);

// ---------------------------------------------------------------------------
// 数値の入力チェック（医学的な判定ではなく、入力ミスの検出のみ）
// ---------------------------------------------------------------------------

export type ParseResult =
  | { ok: true; value: number }
  | { ok: false; reason: 'empty' | 'comma' | 'invalid' | 'negative' };

/** 全角数字・全角記号を半角にそろえて数値に変換する */
export function parseNumber(raw: string): ParseResult {
  const normalized = raw
    .trim()
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[．。]/g, '.')
    .replace(/[－ー−]/g, '-')
    .replace(/\s/g, '');
  if (normalized === '') return { ok: false, reason: 'empty' };
  if (/[,，、]/.test(normalized)) return { ok: false, reason: 'comma' };
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return { ok: false, reason: 'invalid' };
  const value = Number(normalized);
  if (!Number.isFinite(value)) return { ok: false, reason: 'invalid' };
  if (value < 0) return { ok: false, reason: 'negative' };
  return { ok: true, value };
}

export const PARSE_MESSAGES: Record<Exclude<ParseResult, { ok: true }>['reason'], string> = {
  empty: '検査値を入力してください。',
  comma: '小数点は「.」（ピリオド）で入力してください。',
  invalid: '数字で入力してください（例：5.6）。',
  negative: 'マイナスの値は入力できません。',
};

export type PlausibilityResult =
  | { status: 'ok' }
  /** 別の単位なら自然な値（単位の取り違えの可能性） */
  | { status: 'unit_mismatch'; suggestedUnit: Unit }
  /** どの単位でも起こりにくい値（桁・小数点の誤りの可能性） */
  | { status: 'out_of_range' };

const within = (value: number, [min, max]: [number, number]) => value >= min && value <= max;

export function checkPlausibility(item: CheckupItem, unitId: string, value: number): PlausibilityResult {
  const unit = item.units.find((u) => u.id === unitId) ?? item.units[0];
  if (within(value, unit.plausible)) return { status: 'ok' };
  const other = item.units.find((u) => u.id !== unit.id && within(value, u.plausible));
  if (other) return { status: 'unit_mismatch', suggestedUnit: other };
  return { status: 'out_of_range' };
}

export function plausibilityMessage(item: CheckupItem, unitId: string, result: PlausibilityResult): string | null {
  if (result.status === 'ok') return null;
  const unit = item.units.find((u) => u.id === unitId) ?? item.units[0];
  if (result.status === 'unit_mismatch') {
    return `「${unit.label}」では通常あまり見かけない大きさの値です。単位が「${result.suggestedUnit.label}」ではないか、検査票をもう一度ご確認ください。`;
  }
  return '入力された値は、通常あまり見かけない大きさです。桁や小数点の位置が合っているか、検査票をもう一度ご確認ください。';
}

// ---------------------------------------------------------------------------
// 結果
// ---------------------------------------------------------------------------

export interface CheckupRecord {
  /** 画面内での識別用（保存はしない） */
  key: number;
  itemId: string;
  unitId: string;
  value: number;
  /** YYYY-MM-DD（任意） */
  date?: string;
  /** 検査票に記載された基準範囲（任意・自由記述） */
  referenceRange?: string;
  judgment: Judgment;
}

export interface TrendPoint {
  date: string;
  value: number;
}

/** 同じ項目・同じ単位で、検査日のある値だけを日付順に並べる（2件以上のときのみ返す） */
export function buildTrend(records: CheckupRecord[], itemId: string, unitId: string): TrendPoint[] {
  const points = records
    .filter((r) => r.itemId === itemId && r.unitId === unitId && r.date)
    .map((r) => ({ date: r.date as string, value: r.value }))
    .sort((a, b) => a.date.localeCompare(b.date));
  return points.length >= 2 ? points : [];
}

export interface CheckupResult extends CommonResult {
  item: CheckupItem;
  unitLabel: string;
  trend: TrendPoint[];
  referenceRange?: string;
}

const NEEDS_MEDICAL_FOLLOW_UP: Judgment[] = ['recheck', 'detailed'];

export function buildCheckupResult(record: CheckupRecord, allRecords: CheckupRecord[]): CheckupResult {
  const item = findItem(record.itemId);
  if (!item) throw new Error(`Unknown checkup item: ${record.itemId}`);
  const unit = item.units.find((u) => u.id === record.unitId) ?? item.units[0];
  const judgmentText = t(`checkup.judgment.${record.judgment}`);
  const followUp = NEEDS_MEDICAL_FOLLOW_UP.includes(record.judgment);

  return {
    item,
    unitLabel: unit.label,
    trend: buildTrend(allRecords, item.id, unit.id),
    referenceRange: record.referenceRange?.trim() || undefined,
    // 「要再検査」「要精密検査・要受診」の場合は、医療機関の指示を最上部に表示する
    safety: followUp ? [judgmentText] : undefined,
    discovery: [t(`checkup.meaning.${item.id}`)],
    understanding: followUp ? [] : [judgmentText],
    gift: t('checkup.gift'),
    nextSteps: [
      { label: '他の検査項目の意味を知る', href: `${ROUTES.checkup}#items` },
      { label: 'トレーナーに生活習慣を相談する', href: LINKS.askTrainer },
      { label: '他の3つのセルフチェック', href: ROUTES.hub },
    ],
    footnote: t('checkup.footnote'),
  };
}

export function lifestyleText(item: CheckupItem): string {
  return t(`checkup.lifestyle.${item.category}`);
}

export function askText(): string {
  return t('checkup.ask');
}

export function checkupText(key: string): string {
  return t(key);
}
