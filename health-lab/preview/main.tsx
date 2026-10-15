import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CheckupApp, FutureApp, Hub, PostureApp, SignalsApp } from '@/features/health-lab';
import { DraftBadge } from '@/features/health-lab/components/DraftBadge';

/**
 * 共有用プレビュー：本番と同じコンポーネントを、1ページの中で画面切り替えして動かす。
 * 画面は #top / #posture / #checkup / #signals / #future で切り替える（それ以外のページ内リンクは無視）。
 */
type Route = 'top' | 'posture' | 'checkup' | 'signals' | 'future';
const ROUTES: Route[] = ['top', 'posture', 'checkup', 'signals', 'future'];

function routeFromHash(): Route | null {
  const h = window.location.hash.replace('#', '');
  return (ROUTES as string[]).includes(h) ? (h as Route) : null;
}

function App() {
  const [route, setRoute] = useState<Route>(() => routeFromHash() ?? 'top');
  useEffect(() => {
    const onHash = () => {
      const next = routeFromHash();
      if (next) {
        setRoute(next);
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const view =
    route === 'posture' ? <PostureApp /> :
    route === 'checkup' ? <CheckupApp /> :
    route === 'signals' ? <SignalsApp enabled /> :
    route === 'future' ? <FutureApp /> : <Hub />;

  return (
    <div className="hl" data-accent={route === 'top' ? undefined : route} key={route}>
      <p className="preview-banner">プレビュー版 ・ 文言は監修前の仮原稿です ・ 回答は保存・送信されません</p>
      {view}
      <DraftBadge />
    </div>
  );
}

createRoot(document.getElementById('app')!).render(<App />);
