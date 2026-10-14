/**
 * 機能フラグ。
 *
 * 「不調のサインを知る」は、症状別の安全基準について医療専門職の監修が完了するまで公開しない。
 * NEXT_PUBLIC_HEALTHLAB_SIGNALS_ENABLED=true を設定した環境（プレビュー・開発）でのみ表示する。
 * 本番で有効にするのは、監修完了と承認の後に限る（tests/unit/review-gate.test.ts も参照）。
 */
export function isSignalsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_HEALTHLAB_SIGNALS_ENABLED === 'true';
}
