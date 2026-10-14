/**
 * 結果画面からの導線のリンク先。
 *
 * リンク先（動画・LINEでの質問・無料姿勢チェックの案内など）は未確定のため null にしている。
 * null の項目は画面上「準備中」と表示され、タップできない。
 * 確定したら URL を設定する（LINE のトーク画面を開く場合は https://line.me/R/oaMessage/... 等）。
 */
export const LINKS = {
  selfCare60: null as string | null, // 60秒セルフケア動画
  askTrainer: null as string | null, // トレーナーへの質問（LINEトーク）
  freePostureCheck: null as string | null, // 希望者向け無料姿勢チェックの案内
  habitVideo60: null as string | null, // 60秒の健康習慣動画
  xcountHealthInfo: null as string | null, // XCOUNT の健康情報コンテンツ
};

export const ROUTES = {
  hub: '/health-lab',
  posture: '/health-lab/posture',
  checkup: '/health-lab/checkup',
  signals: '/health-lab/signals',
  future: '/health-lab/future',
} as const;
