'use client';

import { useEffect, useRef } from 'react';
import { signalsText } from '../engine/signals';
import { AlertIcon, PhoneIcon } from './icons';

/** 緊急症状がある場合の案内。通常のセルフチェックは表示しない */
export function EmergencyScreen({ onReselect }: { onReselect: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="hl-page hl-emergency">
      <div className="hl-emergency-bar" aria-hidden="true" />
      <main className="hl-main">
        <section className="hl-hero" style={{ paddingTop: 36 }}>
          <span className="hl-emergency-label">
            <AlertIcon />
            セルフチェックを中止しました
          </span>
          <h1 className="hl-title" ref={headingRef} tabIndex={-1}>
            {signalsText('signals.emergency.title')}
          </h1>
          <p className="hl-lead" style={{ color: 'var(--hl-text)' }}>
            {signalsText('signals.emergency.body')}
          </p>
        </section>
        <div className="hl-section">
          <a className="hl-btn hl-btn-danger" href="tel:119">
            <PhoneIcon />
            119に電話する
          </a>
          <p className="hl-sub" style={{ fontSize: 14, lineHeight: 1.8 }}>
            {signalsText('signals.emergency.help')}
          </p>
        </div>
        <p className="hl-note" style={{ background: '#F4F1EC' }}>
          {signalsText('signals.emergency.unsure')}
        </p>
        <div className="hl-actions">
          <button type="button" className="hl-text-btn" style={{ alignSelf: 'center' }} onClick={onReselect}>
            回答を選び直す
          </button>
        </div>
      </main>
    </div>
  );
}
