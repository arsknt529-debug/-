import type { Metadata } from 'next';
import { PostureApp } from '@/features/health-lab';

export const metadata: Metadata = { title: '骨格・姿勢を知る' };

export default function Page() {
  return (
    <div className="hl" data-accent="posture">
      <PostureApp />
    </div>
  );
}
