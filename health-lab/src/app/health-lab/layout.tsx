import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DraftBadge, LiffBootstrap } from '@/features/health-lab';
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
