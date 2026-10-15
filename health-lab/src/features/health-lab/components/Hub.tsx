import Link from 'next/link';
import type { IllustrationName } from '../content/illustrations';
import { ROUTES } from '../content/links';
import type { ContentId } from '../content/types';
import { isSignalsEnabled } from '../lib/flags';
import { Disclaimer } from './Disclaimer';
import { Illustration } from './Illustration';
import { LogoMark } from './icons';

const CARDS: { id: ContentId; no: string; name: string; catch: string; minutes: string; href: string; illust: IllustrationName }[] = [
  { id: 'posture', no: '01', name: '骨格・姿勢を知る', catch: '姿勢や身体の使い方の特徴は？', minutes: '約3分', href: ROUTES.posture, illust: 'posture' },
  { id: 'checkup', no: '02', name: '健康診断を読み解く', catch: 'その数字の意味、知っていますか？', minutes: '項目を選ぶだけ', href: ROUTES.checkup, illust: 'checkup' },
  { id: 'signals', no: '03', name: '不調のサインを知る', catch: '疲れ、むくみ、冷え、肩こり。', minutes: '約3分', href: ROUTES.signals, illust: 'signals' },
  { id: 'future', no: '04', name: '未来の健康を考える', catch: '10年後の自分に、今日できること', minutes: '約3分', href: ROUTES.future, illust: 'future' },
];

/** 上位ページ「私の身体を知る」 */
export function Hub() {
  const signalsOn = isSignalsEnabled();
  return (
    <div className="hl-page">
      <div className="hl-quad-line" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <header className="hl-header hl-header-brand">
        <span className="hl-brand">
          <LogoMark size={26} />
          <span className="hl-brand-name">XCOUNT HEALTH LAB</span>
        </span>
      </header>
      <main className="hl-main">
        <Illustration name="hub" className="hl-illust-hero" />
        <section className="hl-hero hl-hero-tight">
          <h1 className="hl-title">
            あなたの身体、
            <br />
            どこまで知っていますか？
          </h1>
          <p className="hl-lead">気になることから、自分を知ってみましょう。</p>
        </section>

        <nav aria-label="4つの健康コンテンツ">
          <ul className="hl-tiles">
            {CARDS.map((card) => {
              const disabled = card.id === 'signals' && !signalsOn;
              const inner = (
                <>
                  <Illustration name={card.illust} className="hl-tile-illust" />
                  <span className="hl-tile-body">
                    <span className="hl-tile-no">CARD {card.no}</span>
                    <span className="hl-tile-name">{card.name}</span>
                    <span className="hl-tile-catch">{card.catch}</span>
                    <span className="hl-tile-meta">{disabled ? '準備中' : card.minutes}</span>
                  </span>
                </>
              );
              return (
                <li key={card.id}>
                  {disabled ? (
                    <div className="hl-tile" data-content={card.id} aria-disabled="true">
                      {inner}
                    </div>
                  ) : (
                    <Link className="hl-tile" data-content={card.id} href={card.href}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <Disclaimer />

        <footer className="hl-footer">
          <span className="hl-footer-copy">健康を知ることは、自分を愛すること。</span>
        </footer>
      </main>
    </div>
  );
}
