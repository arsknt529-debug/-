import type { Metadata } from 'next';
import { FutureApp } from '@/features/health-lab';

export const metadata: Metadata = { title: '未来の健康を考える' };

export default function Page() {
  return (
    <div className="hl" data-accent="future">
      <FutureApp />
    </div>
  );
}
