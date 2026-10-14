'use client';

import { useMemo, useState } from 'react';
import { ROUTES } from '../content/links';
import { postureQuestions } from '../content/posture';
import type { Answers } from '../content/types';
import { buildPostureResult } from '../engine/posture';
import { Disclaimer } from './Disclaimer';
import { Header } from './Header';
import { InfoIcon } from './icons';
import { QuestionView } from './QuestionView';
import { ResultView } from './ResultView';
import { useScreenHistory } from './useScreenHistory';

type Screen = 'intro' | `q:${number}` | 'result';

export function PostureApp() {
  const { screen, navigate, back } = useScreenHistory<Screen>('intro');
  const [answers, setAnswers] = useState<Answers>({});
  const total = postureQuestions.length;

  const restart = () => {
    setAnswers({});
    navigate('intro');
  };

  const complete = postureQuestions.every((q) => answers[q.id]);
  const result = useMemo(() => (screen === 'result' && complete ? buildPostureResult(answers) : null), [screen, complete, answers]);

  if (screen.startsWith('q:')) {
    const index = Number(screen.slice(2));
    const question = postureQuestions[index];
    if (!question) return null;
    return (
      <QuestionView
        title="骨格・姿勢を知る"
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

  if (screen === 'result' && result) {
    return <ResultView contentName="骨格・姿勢を知る" heading={<>今日、あなたが<br />見つけたこと</>} result={result} onRetry={restart} />;
  }

  return (
    <div className="hl-page">
      <Header title="CARD 01 ・ 骨格・姿勢" back={ROUTES.hub} backLabel="一覧へ戻る" />
      <main className="hl-main">
        <div className="hl-visual" aria-hidden="true">
          <svg width="120" height="160" viewBox="0 0 150 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="75" cy="28" r="14" />
            <path d="M75 42c-2 20-2 46 0 72M75 58c-14 6-26 18-30 36M75 58c14 6 26 18 30 36M75 114c-8 26-12 50-14 76M75 114c8 26 12 50 14 76" />
            <path d="M20 196h110" strokeDasharray="2 6" />
          </svg>
        </div>
        <section className="hl-hero">
          <h1 className="hl-title">
            あなたの身体には、
            <br />
            まだ知らない特徴がある。
          </h1>
          <p className="hl-lead">普段の姿勢や身体の使い方から、今の自分を少しだけ深く知ってみませんか？</p>
          <ul className="hl-chips" aria-label="このチェックについて">
            <li className="hl-chip">無料</li>
            <li className="hl-chip">約2〜3分</li>
            <li className="hl-chip">器具不要</li>
            <li className="hl-chip">全8問</li>
          </ul>
        </section>
        <section className="hl-section">
          <div className="hl-card">
            <h2 className="hl-section-title">このチェックでわかること</h2>
            <ul className="hl-list-dot hl-sub" style={{ fontSize: 14 }}>
              <li>疲れを感じやすい場所や、姿勢の習慣への気づき</li>
              <li>日常の中で身体をいたわるヒント</li>
              <li>今日からできる小さな一歩</li>
            </ul>
            <p className="hl-caption" style={{ textAlign: 'left' }}>
              猫背・反り腰・骨盤のゆがみなどを判定するものではありません。
            </p>
          </div>
        </section>
        <div className="hl-note" style={{ flexDirection: 'row', gap: 10 }}>
          <InfoIcon style={{ flex: 'none', marginTop: 3 }} />
          <span>Q6・Q7は身体を動かす任意の確認です。痛みがあるときや不安なときは、試さずに「試せない」を選んでください。</span>
        </div>
        <Disclaimer />
        <div className="hl-actions">
          <button type="button" className="hl-btn hl-btn-primary" onClick={() => navigate('q:0')}>
            はじめる
          </button>
        </div>
      </main>
    </div>
  );
}
