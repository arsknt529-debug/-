/**
 * 7日間のギフトの記録（この端末の localStorage のみ。サーバーには送らない）。
 *
 * 保存するのは「選んだ約束のID」「開始日」「印をつけた日」だけで、セルフチェックの回答は保存しない。
 * localStorage が使えない環境（プライベートブラウズ等）では保存せずに動作する。
 */
export interface GiftRecord {
  version: 1;
  promiseId: string;
  /** 開始日 YYYY-MM-DD（端末の日付） */
  startDate: string;
  /** 1日目〜7日目に印をつけたか */
  done: boolean[];
}

const KEY = 'xcount-health-lab:gift:v1';
export const GIFT_DAYS = 7;

export function todayString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 開始日から数えて今日が何日目か（1始まり。開始前は 0） */
export function dayNumber(startDate: string, now: Date = new Date()): number {
  const [y, m, d] = startDate.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((today.getTime() - start.getTime()) / 86_400_000);
  return diff < 0 ? 0 : diff + 1;
}

export function createGift(promiseId: string, now: Date = new Date()): GiftRecord {
  return { version: 1, promiseId, startDate: todayString(now), done: Array(GIFT_DAYS).fill(false) };
}

function isGiftRecord(value: unknown): value is GiftRecord {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<GiftRecord>;
  return (
    v.version === 1 &&
    typeof v.promiseId === 'string' &&
    typeof v.startDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(v.startDate) &&
    Array.isArray(v.done) &&
    v.done.length === GIFT_DAYS &&
    v.done.every((x) => typeof x === 'boolean')
  );
}

export function loadGift(): GiftRecord | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isGiftRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveGift(record: GiftRecord): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    // 保存できない環境では、画面上の状態だけで動作する
  }
}

export function clearGift(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // noop
  }
}
