'use client';

import { useEffect, useMemo, useState } from 'react';
import { domains, futureQuestions } from '../content/future';
import { ROUTES } from '../content/links';
import type { Answers } from '../content/types';
import { buildFutureResult } from '../engine/future';
import { loadGift } from '../lib/giftStorage';
import { Disclaimer } from './Disclaimer';
import { GiftSection } from './GiftSection';
import { Header } from './Header';
import { InfoIcon } from './icons';
import { Illustration } from './Illustration';
import { QuestionView } from './QuestionView';
import { ResultView } from './ResultView';
import { useScreenHistory } from './useScreenHistory';

type Screen = 'intro' | `q:${number}` | 'result' | 'gift';

export function FutureApp() {
  const { screen, navigate, back } = useScreenHistory<Screen>('intro');
  const [answers, setAnswers] = useState<Answers>({});
  const [hasGift, setHasGift] = useState(false);
  const total = futureQuestions.length;

  useEffect(() => {
    setHasGift(loadGift() !== null);
  }, [screen]);

  const complete = futureQuestions.every((q) => answers[q.id]);
  const result = useMemo(() => (screen === 'result' && complete ? buildFutureResult(answers) : null), [screen, complete, answers]);

  const restart = () => {
    setAnswers({});
    navigate('intro');
  };

  if (screen.startsWith('q:')) {
    const index = Number(screen.slice(2));
    const question = futureQuestions[index];
    if (!question) return null;
    return (
      <QuestionView
        title="未来の健康を考える"
        question={question}
        index={index}
        total={total}
        value={answers[question.id]}
        onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
        onNext={() => navigate(index + 1 < total ? `q:${index + 1}` : 'result')}
        onBack={back}
        onExit={restart}
      />
    );
  }

  if (screen === 'gift') {
    return (
      <div className="hl-page">
        <Header title="7 DAYS GIFT" back={back} />
        <main className="hl-main">
          <section className="hl-hero">
            <h1 className="hl-title">自分への小さな約束</h1>
          </section>
          <div className="hl-result-cards">
            <GiftSection />
          </div>
          <div style={{ height: 32 }} />
        </main>
      </div>
    );
  }

  if (screen === 'result' && result) {
    return (
      <ResultView
        contentName="未来の健康を考える"
        heading="未来の自分に贈りたいこと"
        illustration="future"
        result={result}
        onRetry={restart}
        labels={{ understanding: 'この結果について', gift: '今日から始められる小さな行動' }}
        discoverySlot={
          result.cared.length === 0 && result.room.length === 0 ? (
            <article className="hl-card" aria-labelledby="hl-skipped">
              <h2 className="hl-card-label" id="hl-skipped">
                今回のふり返り
              </h2>
              <p className="hl-sub">{result.discovery[0]}</p>
            </article>
          ) : (
          <>
            <article className="hl-card" aria-labelledby="hl-cared">
              <h2 className="hl-card-label" id="hl-cared">
                今、大切にできている習慣
              </h2>
              {result.cared.length > 0 ? (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.cared.map((c) => (
                    <li key={c.domain}>
                      <strong style={{ fontSize: 15 }}>{c.name}</strong>
                      <p className="hl-sub">{c.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="hl-sub">{result.discovery[0]}</p>
              )}
            </article>
            <article className="hl-card" aria-labelledby="hl-room">
              <h2 className="hl-card-label" id="hl-room">
                見直す余地がある習慣
              </h2>
              {result.room.length > 0 ? (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.room.map((r) => (
                    <li key={r.domain}>
                      <strong style={{ fontSize: 15 }}>{r.name}</strong>
                      <p className="hl-sub">{r.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="hl-sub">{result.discovery[0]}</p>
              )}
            </article>
          </>
          )
        }
        beforeNext={<GiftSection promiseOrder={result.promiseOrder} />}
      />
    );
  }

  return (
    <div className="hl-page">
      <Header title="CARD 04 ・ 未来の健康" back={ROUTES.hub} backLabel="一覧へ戻る" />
      <main className="hl-main">
        <Illustration name="future" className="hl-illust-hero" />
        <section className="hl-hero hl-hero-tight">
          <h1 className="hl-title">
            10年後の自分に、
            <br />
            何を贈ろう。
          </h1>
          <p className="hl-lead">今の生活を振り返り、未来の自分のためにできることを探しましょう。</p>
          <ul className="hl-chips" aria-label="振り返る5つの生活習慣">
            {domains.map((d) => (
              <li key={d.id} className="hl-chip">
                {d.name}
              </li>
            ))}
          </ul>
        </section>
        <p className="hl-hint">
          <InfoIcon style={{ flex: 'none', marginTop: 3 }} />
          <span>点数はつけません。「わからない」「答えたくない」も選べます。</span>
        </p>
        <Disclaimer />
        <div className="hl-actions">
          <button type="button" className="hl-btn hl-btn-primary" onClick={() => navigate('q:0')}>
            10問ではじめる（約3分）
          </button>
          {hasGift && (
            <button type="button" className="hl-btn hl-btn-secondary" onClick={() => navigate('gift')}>
              7日間のギフトの続きを見る
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
