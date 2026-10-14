import type { Metadata } from 'next';
import { isSignalsEnabled, SignalsApp } from '@/features/health-lab';

export const metadata: Metadata = { title: '不調のサインを知る' };

export default function Page() {
  return (
    <div className="hl" data-accent="signals">
      <SignalsApp enabled={isSignalsEnabled()} />
    </div>
  );
}
