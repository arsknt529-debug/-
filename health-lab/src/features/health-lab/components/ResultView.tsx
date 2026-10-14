'use client';

import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';
import { commonCopy } from '../content/common';
import type { CommonResult, NextStep } from '../content/types';
import { Header } from './Header';
import { AlertIcon, ChevronIcon, GiftIcon } from './icons';

interface ResultViewProps {
  contentName: string;
  heading: ReactNode;
  result: CommonResult;
  onRetry: () => void;
  backHref?: string;
  /** 最上部の安全案内の直後に差し込む要素 */
  top?: ReactNode;
  /** DISCOVERY を差し替える場合 */
  discoverySlot?: ReactNode;
  /** UNDERSTANDING の後に差し込む要素 */
  middle?: ReactNode;
  /** NEXT STEP の前に差し込む要素 */
  beforeNext?: ReactNode;
  /** NEXT STEP の後に差し込む要素 */
  bottom?: ReactNode;
  labels?: Partial<Record<'discovery' | 'understanding' | 'gift' | 'next', string>>;
}

export function SafetyNotice({ title = '大切なお知らせ', children }: { title?: string; children: ReactNode }) {
  return (
    <section className="hl-safety" role="note" aria-label={title}>
      <span className="hl-safety-title">
        <AlertIcon size={18} />
        {title}
      </span>
      {children}
    </section>
  );
}

export function NextStepList({ steps }: { steps: NextStep[] }) {
  return (
    <div className="hl-next-list">
      {steps.map((step) => {
        const body = (
          <span>
            {step.label}
            {step.description && <small>{step.description}</small>}
          </span>
        );
        if (!step.href) {
          return (
            <span key={step.label} className="hl-next-item" aria-disabled="true">
              {body}
              <span className="hl-badge">準備中</span>
            </span>
          );
        }
        const isInternal = step.href.startsWith('/') || step.href.startsWith('#');
        return isInternal ? (
          step.href.startsWith('#') ? (
            <a key={step.label} className="hl-next-item" href={step.href}>
              {body}
              <ChevronIcon />
            </a>
          ) : (
            <Link key={step.label} className="hl-next-item" href={step.href}>
              {body}
              <ChevronIcon />
            </Link>
          )
        ) : (
          <a key={step.label} className="hl-next-item" href={step.href} rel="noopener noreferrer">
            {body}
            <ChevronIcon />
          </a>
        );
      })}
    </div>
  );
}

/** 4機能共通の結果画面：DISCOVERY／UNDERSTANDING／SMALL GIFT／NEXT STEP */
export function ResultView({
  contentName,
  heading,
  result,
  onRetry,
  backHref = '/health-lab',
  top,
  discoverySlot,
  middle,
  beforeNext,
  bottom,
  labels = {},
}: ResultViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="hl-page">
      <Header
        title="YOUR RESULT"
        back={backHref}
        backLabel="一覧へ戻る"
        right={
          <button type="button" className="hl-text-btn" onClick={onRetry}>
            やり直す
          </button>
        }
      />
      <main className="hl-main">
        <div className="hl-hero" style={{ paddingTop: 16 }}>
          <span className="hl-caption" style={{ textAlign: 'left' }}>
            {contentName}
          </span>
          <h1 className="hl-title" ref={headingRef} tabIndex={-1}>
            {heading}
          </h1>
        </div>

        <div className="hl-result-cards">
          {result.safety && (
            <SafetyNotice>
              {result.safety.map((s) => (
                <p key={s}>{s}</p>
              ))}
            </SafetyNotice>
          )}
          {top}

          {discoverySlot ?? (
            <article className="hl-card" aria-labelledby="hl-discovery">
              <h2 className="hl-card-label" id="hl-discovery">
                {labels.discovery ?? 'DISCOVERY ｜ 発見'}
              </h2>
              {result.discovery.map((d) => (
                <p key={d}>{d}</p>
              ))}
            </article>
          )}

          {result.understanding.length > 0 && (
            <article className="hl-card" aria-labelledby="hl-understanding">
              <h2 className="hl-card-label" id="hl-understanding">
                {labels.understanding ?? 'UNDERSTANDING ｜ 理解'}
              </h2>
              {result.understanding.map((u) => (
                <p key={u} className="hl-sub">
                  {u}
                </p>
              ))}
            </article>
          )}

          {middle}

          <article className="hl-gift" aria-labelledby="hl-gift">
            <h2 className="hl-gift-label" id="hl-gift">
              <GiftIcon />
              {labels.gift ?? 'SMALL GIFT ｜ 今日の小さなギフト'}
            </h2>
            <p className="hl-gift-text">{result.gift}</p>
          </article>

          {beforeNext}

          <article className="hl-card" aria-labelledby="hl-next">
            <h2 className="hl-card-label" id="hl-next">
              {labels.next ?? 'NEXT STEP ｜ これから'}
            </h2>
            <NextStepList steps={result.nextSteps} />
          </article>

          {bottom}
        </div>

        {result.footnote && <p className="hl-note">{result.footnote}</p>}

        <footer className="hl-footer">
          <span className="hl-footer-copy">{commonCopy['common.closing'].text}</span>
          <span className="hl-caption">回答は保存されていません。画面を閉じると消えます。</span>
        </footer>
      </main>
    </div>
  );
}
