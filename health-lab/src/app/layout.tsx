import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

// このルートレイアウトは health-lab 単体で動かすためのもの。
// 既存の fitness-line-system に組み込む場合は、既存のルートレイアウトをそのまま使う。
export const metadata: Metadata = {
  title: 'XCOUNT HEALTH LAB',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FAF8F4',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
