import Link from 'next/link';
import type { ComponentType } from 'react';
import { ROUTES } from '../content/links';
import type { ContentId } from '../content/types';
import { isSignalsEnabled } from '../lib/flags';
import { Disclaimer } from './Disclaimer';
import { CheckupIcon, LetterIcon, LogoMark, PostureIcon, SproutIcon } from './icons';

const CARDS: { id: ContentId; no: string; name: string; desc: string; meta: string; href: string; Icon: ComponentType<{ size?: number }> }[] = [
  { id: 'posture', no: 'CARD 01', name: '骨格・姿勢を知る', desc: 'あなたの姿勢や身体の使い方には、どんな特徴がある？', meta: '約2〜3分 ・ 8問 ・ 器具不要', href: ROUTES.posture, Icon: PostureIcon },
  { id: 'checkup', no: 'CARD 02', name: '健康診断を読み解く', desc: '検査結果の数字が、何を意味するのか知っていますか？', meta: '14項目の解説 ・ 数値入力', href: ROUTES.checkup, Icon: CheckupIcon },
  { id: 'signals', no: 'CARD 03', name: '不調のサインを知る', desc: '疲れ、むくみ、冷え、肩こり。身体のサインを見つめ直す。', meta: '約3分 ・ 複数選択可', href: ROUTES.signals, Icon: LetterIcon },
  { id: 'future', no: 'CARD 04', name: '未来の健康を考える', desc: '10年後の自分に、今日できることは何だろう？', meta: '約3分 ・ 10問 ・ 7日間のギフト', href: ROUTES.future, Icon: SproutIcon },
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
      <header className="hl-header" style={{ padding: '12px 20px 0' }}>
        <span className="hl-brand">
          <LogoMark size={26} />
          <span className="hl-brand-name">XCOUNT HEALTH LAB</span>
        </span>
      </header>
      <main className="hl-main">
        <section className="hl-hero" style={{ paddingTop: 36, paddingBottom: 20 }}>
          <span className="hl-eyebrow" style={{ color: 'var(--hl-primary)' }}>
            私の身体を知る
          </span>
          <h1 className="hl-title" style={{ fontSize: 28 }}>
            あなたの身体、
            <br />
            どこまで
            <br />
            知っていますか？
          </h1>
          <p className="hl-lead">身体の特徴も、日々の不調も、これからの健康も。まずは気になることから、自分を知ってみましょう。</p>
        </section>

        <nav aria-label="4つの健康コンテンツ">
          <ul className="hl-content-list">
            {CARDS.map(({ id, no, name, desc, meta, href, Icon }) => {
              const disabled = id === 'signals' && !signalsOn;
              const inner = (
                <>
                  <span className="hl-content-icon">
                    <Icon />
                  </span>
                  <span className="hl-content-body">
                    <span className="hl-content-no">{no}</span>
                    <span className="hl-content-name">{name}</span>
                    <span className="hl-content-desc">{desc}</span>
                    <span className="hl-content-meta">{disabled ? '準備中（専門家の確認後に公開します）' : meta}</span>
                  </span>
                </>
              );
              return (
                <li key={id}>
                  {disabled ? (
                    <div className="hl-content-card" data-content={id} aria-disabled="true">
                      {inner}
                    </div>
                  ) : (
                    <Link className="hl-content-card" data-content={id} href={href}>
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
          <span className="hl-caption">XCOUNT HEALTH LAB</span>
        </footer>
      </main>
    </div>
  );
}
