'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 画面（トップ → 質問 → 結果）の切り替えをブラウザ履歴と連動させるフック。
 *
 * - LINE 内ブラウザのスワイプ「戻る」でも、直前の質問に戻れるようにする。
 * - 履歴に載せるのは画面名（例: "q:3"）だけで、回答内容は URL にも履歴にも載せない。
 * - 再読み込みすると回答は消えるため、最初の画面に戻す（回答のない結果画面を出さない）。
 * - Next.js が history.state に持っている内部情報は残したまま、hlScreen だけを追加する。
 */
export function useScreenHistory<T extends string>(initial: T) {
  const [screen, setScreen] = useState<T>(initial);
  const initialRef = useRef(initial);

  useEffect(() => {
    // 再読み込み時は回答が残っていないため、常に最初の画面から始める
    window.history.replaceState({ ...(window.history.state ?? {}), hlScreen: initialRef.current }, '');
    const onPop = (event: PopStateEvent) => {
      const next = event.state?.hlScreen as T | undefined;
      // ページ内リンク（#record など）への移動でも popstate が発生する。その場合は画面を変えない
      if (next === undefined) return;
      setScreen(next);
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /** 次の画面へ進む（履歴に追加） */
  const navigate = useCallback((next: T) => {
    window.history.pushState({ ...(window.history.state ?? {}), hlScreen: next }, '');
    setScreen(next);
    window.scrollTo(0, 0);
  }, []);

  /** 画面を置き換える（履歴に追加しない） */
  const replace = useCallback((next: T) => {
    window.history.replaceState({ ...(window.history.state ?? {}), hlScreen: next }, '');
    setScreen(next);
    window.scrollTo(0, 0);
  }, []);

  /** 1つ前の画面へ戻る */
  const back = useCallback(() => {
    window.history.back();
  }, []);

  return { screen, navigate, replace, back };
}
