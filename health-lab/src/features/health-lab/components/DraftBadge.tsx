/**
 * 監修前の仮原稿であることを示すバッジ。
 * NEXT_PUBLIC_HEALTHLAB_SHOW_DRAFT_BADGE=true の環境（プレビュー・開発）でのみ表示する。
 */
export function DraftBadge() {
  if (process.env.NEXT_PUBLIC_HEALTHLAB_SHOW_DRAFT_BADGE !== 'true') return null;
  return (
    <span className="hl-draft-badge" aria-hidden="true">
      文言は監修前の仮原稿です
    </span>
  );
}
