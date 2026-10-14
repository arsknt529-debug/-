/**
 * LIFF の最小限の初期化。
 *
 * - NEXT_PUBLIC_LIFF_ID が設定されていて、LIFF SDK（window.liff）が読み込まれている場合だけ初期化する。
 * - プロフィール・IDトークン・友だち情報は取得しない（健康情報と LINE ユーザーを紐づけない）。
 * - LIFF が使えない環境（通常ブラウザ・LIFF 未設定）では何もしない。画面はそのまま動く。
 */
type LiffLike = {
  init: (config: { liffId: string }) => Promise<void>;
  isInClient: () => boolean;
};

declare global {
  interface Window {
    liff?: LiffLike;
  }
}

let initPromise: Promise<boolean> | null = null;

export function initLiffIfAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (!liffId || !window.liff) return Promise.resolve(false);
  if (!initPromise) {
    initPromise = window.liff
      .init({ liffId })
      .then(() => true)
      .catch(() => false);
  }
  return initPromise;
}
