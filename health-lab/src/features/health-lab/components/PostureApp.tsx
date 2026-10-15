'use client';

import { useMemo, useState } from 'react';
import { ROUTES } from '../content/links';
import { postureQuestions } from '../content/posture';
import type { Answers } from '../content/types';
import { buildPostureResult } from '../engine/posture';
import { Disclaimer } from './Disclaimer';
import { Header } from './Header';
import { Illustration } from './Illustration';
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
    return <ResultView contentName="骨格・姿勢を知る" heading={<>今日、あなたが<br />見つけたこと</>} result={result} onRetry={restart} illustration="posture" />;
  }

  return (
    <div className="hl-page">
      <Header title="CARD 01 ・ 骨格・姿勢" back={ROUTES.hub} backLabel="一覧へ戻る" />
      <main className="hl-main">
        <Illustration name="posture" className="hl-illust-hero" />
        <section className="hl-hero hl-hero-tight">
          <h1 className="hl-title">
            あなたの身体には、
            <br />
            まだ知らない特徴がある。
          </h1>
          <p className="hl-lead">普段の姿勢や身体の使い方から、今の自分を知ってみましょう。</p>
          <ul className="hl-chips" aria-label="このチェックについて">
            <li className="hl-chip">無料</li>
            <li className="hl-chip">約2〜3分</li>
            <li className="hl-chip">器具不要</li>
            <li className="hl-chip">全8問</li>
          </ul>
        </section>
        <p className="hl-hint">
          <InfoIcon style={{ flex: 'none', marginTop: 3 }} />
          <span>身体を動かす質問は任意です。痛いときは試さずに進めます。</span>
        </p>
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
