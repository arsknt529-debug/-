'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { BackIcon } from './icons';

interface HeaderProps {
  title: string;
  /** 戻る操作。文字列ならリンク、関数ならボタン */
  back?: string | (() => void);
  backLabel?: string;
  right?: ReactNode;
}

export function Header({ title, back, backLabel = '戻る', right }: HeaderProps) {
  return (
    <header className="hl-header">
      {typeof back === 'string' ? (
        <Link href={back} className="hl-icon-btn" aria-label={backLabel}>
          <BackIcon />
        </Link>
      ) : back ? (
        <button type="button" className="hl-icon-btn" aria-label={backLabel} onClick={back}>
          <BackIcon />
        </button>
      ) : (
        <span style={{ width: 44 }} />
      )}
      <span className="hl-header-title">{title}</span>
      <span className="hl-header-side">{right}</span>
    </header>
  );
}
