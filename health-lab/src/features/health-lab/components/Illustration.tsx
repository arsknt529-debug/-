import { illustrations, type IllustrationName } from '../content/illustrations';

/** ブランドイラスト（内容はリポジトリ内の固定SVGのみ） */
export function Illustration({ name, label, className = '' }: { name: IllustrationName; label?: string; className?: string }) {
  return (
    <div
      className={`hl-illust ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: illustrations[name] }}
    />
  );
}
