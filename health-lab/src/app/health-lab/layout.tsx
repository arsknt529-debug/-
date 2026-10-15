import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DraftBadge, LiffBootstrap } from '@/features/health-lab';
// 書体はパッケージから自前で配信する（外部のフォントサーバーには通信しない）
import '@fontsource/zen-maru-gothic/500.css';
import '@fontsource/zen-maru-gothic/700.css';
import '@fontsource/biz-udpgothic/400.css';
import '@fontsource/biz-udpgothic/700.css';
import '@/features/health-lab/styles/health-lab.css';

export const metadata: Metadata = {
  title: { default: '私の身体を知る | XCOUNT HEALTH LAB', template: '%s | XCOUNT HEALTH LAB' },
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function HealthLabLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LiffBootstrap />
      {children}
      <DraftBadge />
    </>
  );
}
