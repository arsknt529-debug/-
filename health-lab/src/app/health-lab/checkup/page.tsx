import type { Metadata } from 'next';
import { CheckupApp } from '@/features/health-lab';

export const metadata: Metadata = { title: '健康診断を読み解く' };

export default function Page() {
  return (
    <div className="hl" data-accent="checkup">
      <CheckupApp />
    </div>
  );
}
