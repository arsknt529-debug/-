'use client';

import { useMemo, useState } from 'react';
import { ROUTES } from '../content/links';
import { emergencySigns, symptoms, type SymptomId } from '../content/signals';
import type { Answers } from '../content/types';
import { buildSignalsQuestions, buildSignalsResult, signalsText } from '../engine/signals';
import { Disclaimer } from './Disclaimer';
import { EmergencyScreen } from './EmergencyScreen';
import { Header } from './Header';
import { AlertIcon, CheckIcon, PhoneIcon } from './icons';
import { QuestionView } from './QuestionView';
import { ResultView, SafetyNotice } from './ResultView';
import { useScreenHistory } from './useScreenHistory';

type Screen = 'intro' | 'select' | `q:${number}` | 'result' | 'emergency';

export function SignalsApp({ enabled }: { enabled: boolean }) {
  if (!enabled) return <SignalsComingSoon />;
  return <SignalsFlow />;
}

function SignalsComingSoon() {
  return (
    <div className="hl-page">
      <Header title="CARD 03 ・ 不調のサイン" back={ROUTES.hub} backLabel="一覧へ戻る" />
      <main className="hl-main">
        <section className="hl-hero">
          <h1 className="hl-title">
            その不調は、
            <br />
            身体からの小さな手紙。
          </h1>
          <p className="hl-lead">このセルフチェックは、医療専門職による安全性の確認が終わり次第公開します。もうしばらくお待ちください。</p>
        </section>
        <p className="hl-note">心配な症状がある場合は、医療機関にご相談ください。緊急の症状がある場合は、ためらわずに119番に電話してください。</p>
      </main>
    </div>
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

  if (screen === 'emergency') {
    return <EmergencyScreen onReselect={back} />;
  }

  if (screen === 'select') {
    const toggle = (id: SymptomId) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    return (
      <div className="hl-page">
        <Header title="CARD 03 ・ 不調のサイン" back={back} />
        <main className="hl-main">
          <section className="hl-hero">
            <h1 className="hl-question-text" tabIndex={-1} id="hl-select">
              気になる不調を選んでください
            </h1>
            <p className="hl-caption" style={{ textAlign: 'left' }}>
              当てはまるものをすべて選んでください
            </p>
          </section>
          <fieldset className="hl-options" aria-labelledby="hl-select">
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
          </fieldset>
          <div className="hl-actions">
            <button type="button" className="hl-btn hl-btn-primary" disabled={selected.length === 0} onClick={() => navigate('q:0')}>
              {selected.length === 0 ? '選ぶと次へ進めます' : `${selected.length}つを選んで次へ`}
            </button>
            <p className="hl-caption">原因や病名を判定するものではありません。</p>
          </div>
        </main>
      </div>
    );
  }

  if (screen.startsWith('q:')) {
    const index = Number(screen.slice(2));
    const question = questions[index];
    if (!question) return null;
    return (
      <QuestionView
        title="不調のサインを知る"
        question={question}
        index={index}
        total={questions.length}
        value={answers[question.id]}
        onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
        onNext={() => {
          const chosen = question.options.find((o) => o.id === answers[question.id]);
          // 緊急の選択肢が選ばれたら、以降の質問を出さずに緊急案内へ
          if (chosen?.emergency) {
            navigate('emergency');
            return;
          }
          navigate(index + 1 < questions.length ? `q:${index + 1}` : 'result');
        }}
        onBack={back}
        onExit={restart}
      />
    );
  }

  if (screen === 'result' && result) {
    const careFirst = result.triage.level === 'seek_soon' || result.triage.level === 'emergency' || result.triage.crisis;
    return (
      <ResultView
        contentName="不調のサインを知る"
        heading="身体からの手紙"
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
            {result.crisis && (
              <SafetyNotice title={result.crisis.title}>
                <p>{result.crisis.body}</p>
                <p style={{ fontWeight: 700 }}>{result.crisis.line}</p>
                <a className="hl-btn hl-btn-danger" href="tel:119" style={{ fontSize: 16, minHeight: 52 }}>
                  <PhoneIcon size={18} />
                  今すぐ危険なときは119
                </a>
              </SafetyNotice>
            )}
            {result.safety && (
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

  // intro：最初に緊急症状を確認する
  return (
    <div className="hl-page">
      <Header title="CARD 03 ・ 不調のサイン" back={ROUTES.hub} backLabel="一覧へ戻る" />
      <main className="hl-main">
        <section className="hl-hero">
          <h1 className="hl-title">
            その不調は、
            <br />
            身体からの小さな手紙。
          </h1>
          <p className="hl-lead">疲れ、むくみ、睡眠の悩み。いつの間にか当たり前になっている不調を、一度振り返ってみませんか？</p>
        </section>
        <section className="hl-section">
          <div className="hl-safety">
            <h2 className="hl-safety-title" id="hl-gate">
              <AlertIcon size={18} />
              はじめに確認させてください
            </h2>
            <p>今、次のような症状はありますか？</p>
            <ul className="hl-list-dot" style={{ fontSize: 15 }}>
              {emergencySigns.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="hl-grid-2" style={{ marginTop: 6 }}>
              <button type="button" className="hl-btn hl-btn-danger" style={{ fontSize: 16, minHeight: 52 }} onClick={() => navigate('emergency')}>
                ある
              </button>
              <button type="button" className="hl-btn hl-btn-secondary" style={{ minHeight: 52 }} onClick={() => navigate('select')}>
                ない
              </button>
            </div>
          </div>
        </section>
        <Disclaimer />
        <div style={{ height: 32 }} />
      </main>
    </div>
  );
}
