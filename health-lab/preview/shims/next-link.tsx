import { forwardRef, type AnchorHTMLAttributes } from 'react';

/** プレビュー用：next/link の代わり。/health-lab/* へのリンクを #posture などの画面切り替えに変換する */
export function toPreviewHref(href: string): string {
  if (!href.startsWith('/health-lab')) return href;
  const route = href.replace(/^\/health-lab\/?/, '').split('#')[0];
  return `#${route || 'top'}`;
}

const Link = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>(function Link({ href, ...rest }, ref) {
  return <a ref={ref} href={toPreviewHref(href)} {...rest} />;
});

export default Link;
