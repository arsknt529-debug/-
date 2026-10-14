'use client';

import Script from 'next/script';
import { initLiffIfAvailable } from '../lib/liff';

/**
 * NEXT_PUBLIC_LIFF_ID が設定されている場合だけ LIFF SDK を読み込んで初期化する。
 * 未設定なら何も読み込まない（通常ブラウザでそのまま動作）。
 */
export function LiffBootstrap() {
  if (!process.env.NEXT_PUBLIC_LIFF_ID) return null;
  return (
    <Script
      src="https://static.line-scdn.net/liff/edge/2/sdk.js"
      strategy="afterInteractive"
      onLoad={() => {
        void initLiffIfAvailable();
      }}
    />
  );
}
