/**
 * シーン別の写真（店舗・スタッフの実写真から scripts/build-images.py で自動生成）。
 * 画像は public/health-lab/images/ に置く。共有用プレビューでは、このモジュールを
 * 画像を埋め込んだ版に差し替えている（preview/build.mjs）。
 */
export type PhotoName = 'hub' | 'posture' | 'checkup' | 'signals' | 'future' | 'gift';

export const photoAlt: Record<PhotoName, string> = {
  hub: 'XCOUNT Fitness の受付と観葉植物',
  posture: '明るいトレーニングスペースとバランスボード',
  checkup: 'やわらかな灯りのデスクスペース',
  signals: '植物と窓辺のくつろげるコーナー',
  future: 'XCOUNT のスタッフ',
  gift: 'みずみずしい観葉植物',
};

export function photoSrc(name: PhotoName, size: 'lg' | 'sm' = 'lg'): string {
  return `/health-lab/images/${name}${size === 'sm' ? '-sm' : ''}.webp`;
}
