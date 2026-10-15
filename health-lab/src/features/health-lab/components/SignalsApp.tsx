'use client';

import { useMemo, useState } from 'react';
import { ROUTES } from '../content/links';
import { symptoms, type SymptomId } from '../content/signals';
import type { Answers } from '../content/types';
import { buildSignalsQuestions, buildSignalsResult, signalsText } from '../engine/signals';
import { Disclaimer } from './Disclaimer';
import { Header } from './Header';
import { AlertIcon, CheckIcon } from './icons';
import { Illustration } from './Illustration';
import { QuestionView } from './QuestionView';
import { ResultView, SafetyNotice } from './ResultView';
import { useScreenHistory } from './useScreenHistory';

type Screen = 'intro' | `q:${number}` | 'result';

export function SignalsApp({ enabled }: { enabled: boolean }) {
  if (!enabled) return <SignalsComingSoon />;
  return <SignalsFlow />;
}

function SignalsComingSoon() {
  return (
    <div className="hl-page">
      <Header title="CARD 03 ・ 不調のサイン" back={ROUTES.hub} backLabel="一覧へ戻る" />
      <main className="hl-main">
        <Illustration name="signals" className="hl-illust-hero" />
        <section className="hl-hero hl-hero-tight">
          <h1 className="hl-title">
            その不調は、
            <br />
            身体からの小さな手紙。
          </h1>
          <p className="hl-lead">専門家による確認が終わり次第、公開します。</p>
        </section>
        <p className="hl-hint">
          <InfoUrgent />
        </p>
      </main>
    </div>
  );
}

/** 急を要する症状についての短い案内（専用ページは設けず、1行で伝える） */
function InfoUrgent() {
  return (
    <>
      <AlertIcon size={18} style={{ flex: 'none', marginTop: 3, color: 'var(--hl-danger)' }} />
      <span>{signalsText('signals.urgent')}</span>
    </>
  );
}

function SignalsFlow() {
  const { screen, navigate, back } = useScreenHistory<Screen>('intro');
  const [selected, setSelected] = useState<SymptomId[]>([]);
  const [answers, setAnswers] = useState<Answers>({});

  const questions = useMemo(() => buildSignalsQuestions(selected), [selected]);
  const complete = selected.length > 0 && questions.every((q) => answers[q.id]);
  const result = useMemo(() => (screen === 'result' && complete ? buildSignalsResult(selected, answers) : null), [screen, complete, selected, answers]);

  const restart = () => {
    setSelected([]);
    setAnswers({});
    navigate('intro');
  };

  if (screen.startsWith('q:')) {
    const index = Number(screen.slice(2));
    const question = questions[index];
    if (!question) return null;
    const chosen = question.options.find((o) => o.id === answers[question.id]);
    return (
      <QuestionView
        title="不調のサインを知る"
        question={question}
        index={index}
        total={questions.length}
        value={answers[question.id]}
        onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
        onNext={() => navigate(index + 1 < questions.length ? `q:${index + 1}` : 'result')}
        onBack={back}
        onExit={restart}
        alert={chosen?.emergency ? signalsText('signals.urgent_inline') : undefined}
      />
    );
  }

  if (screen === 'result' && result) {
    const careFirst = result.triage.level === 'seek_soon' || result.triage.level === 'emergency' || result.triage.crisis;
    return (
      <ResultView
        contentName="不調のサインを知る"
        heading="身体からの手紙"
        illustration="signals"
        result={{ ...result, safety: undefined }}
        onRetry={restart}
        labels={{
          discovery: 'あなたが気づいたこと',
          understanding: '見つめ直したい生活のポイント',
          gift: '今日の小さなギフト',
          next: 'これから',
        }}
        top={
          <>
            {result.triage.level === 'emergency' && (
              <SafetyNotice title="すぐに119番へ">
                <p>{signalsText('signals.urgent_inline')}</p>
              </SafetyNotice>
            )}
            {result.crisis && (
              <SafetyNotice title={result.crisis.title}>
                <p>{result.crisis.body}</p>
                <p style={{ fontWeight: 700 }}>{result.crisis.line}</p>
              </SafetyNotice>
            )}
            {result.safety && result.triage.level !== 'emergency' && (
              <SafetyNotice title={careFirst ? '医療機関への相談をおすすめします' : '続く場合は医療機関へ'}>
                {result.safety.map((s) => (
                  <p key={s}>{s}</p>
                ))}
              </SafetyNotice>
            )}
          </>
        }
        beforeNext={
          <article className="hl-card" aria-labelledby="hl-medical">
            <h2 className="hl-card-label" id="hl-medical" style={{ color: 'var(--hl-danger)' }}>
              医療機関への相談が必要な場合
            </h2>
            <p className="hl-sub">{result.medical}</p>
          </article>
        }
        bottom={
          <>
            <article className="hl-card" id="record" aria-labelledby="hl-record">
              <h2 className="hl-card-label" id="hl-record">
                不調の記録方法
              </h2>
              <p className="hl-sub">{signalsText('signals.record')}</p>
            </article>
            {!careFirst && (
              <article className="hl-card" id="revisit" aria-labelledby="hl-revisit">
                <h2 className="hl-card-label" id="hl-revisit">
                  7日後の振り返り
                </h2>
                <p className="hl-sub">{signalsText('signals.revisit')}</p>
              </article>
            )}
          </>
        }
      />
    );
  }

  // intro：イラスト＋気になる不調の選択
  const toggle = (id: SymptomId) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return (
    <div className="hl-page">
      <Header title="CARD 03 ・ 不調のサイン" back={ROUTES.hub} backLabel="一覧へ戻る" />
      <main className="hl-main">
        <Illustration name="signals" className="hl-illust-hero" />
        <section className="hl-hero hl-hero-tight">
          <h1 className="hl-title">
            その不調は、
            <br />
            身体からの小さな手紙。
          </h1>
          <p className="hl-lead">当たり前になっている不調を、振り返ってみませんか？</p>
        </section>
        <p className="hl-hint hl-hint-urgent">
          <InfoUrgent />
        </p>
        <section className="hl-section" aria-labelledby="hl-select">
          <h2 className="hl-section-title" id="hl-select">
            気になる不調を選んでください<span className="hl-caption">（複数可）</span>
          </h2>
          <div className="hl-options-grid">
            {symptoms.map((s) => {
              const on = selected.includes(s.id);
              return (
                <button key={s.id} type="button" className="hl-option" aria-pressed={on} onClick={() => toggle(s.id)}>
                  <span className="hl-option-mark hl-option-mark-square">{on ? <CheckIcon /> : null}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </section>
        <Disclaimer />
        <div className="hl-actions">
          <button type="button" className="hl-btn hl-btn-primary" disabled={selected.length === 0} onClick={() => navigate('q:0')}>
            {selected.length === 0 ? '選ぶと次へ進めます' : `${selected.length}つを選んで次へ`}
          </button>
        </div>
      </main>
    </div>
  );
}
