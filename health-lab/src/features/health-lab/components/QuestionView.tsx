'use client';

import { useEffect, useRef } from 'react';
import type { Question } from '../content/types';
import { Header } from './Header';
import { CheckIcon } from './icons';
import { SafetyNotice } from './ResultView';

interface QuestionViewProps {
  title: string;
  question: Question;
  index: number;
  total: number;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onExit: () => void;
  nextLabel?: string;
  /** 選んだ回答に応じて表示する安全上の案内 */
  alert?: string;
}

/** 1画面1質問の共通ビュー（単一選択・複数選択） */
export function QuestionView({ title, question, index, total, value, onChange, onNext, onBack, onExit, nextLabel, alert }: QuestionViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const answered = selected.length > 0;
  const isLast = index === total - 1;

  // 質問が切り替わったら見出しにフォーカスを移す（読み上げ対応）
  useEffect(() => {
    headingRef.current?.focus();
  }, [question.id]);

  const toggle = (optionId: string) => {
    if (question.multi) {
      onChange(selected.includes(optionId) ? selected.filter((id) => id !== optionId) : [...selected, optionId]);
    } else {
      onChange(optionId);
    }
  };

  const progress = ((index + 1) / total) * 100;

  return (
    <div className="hl-page">
      <Header
        title={`${index + 1} / ${total}`}
        back={onBack}
        backLabel="前の質問へ戻る"
        right={
          <button type="button" className="hl-text-btn" onClick={onExit}>
            中断
          </button>
        }
      />
      <div
        className="hl-progress"
        role="progressbar"
        aria-label={`${title}の進み具合`}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
      >
        <div className="hl-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <main className="hl-main">
        <div className="hl-question">
          <span className="hl-eyebrow">QUESTION {String(index + 1).padStart(2, '0')}</span>
          <h1 className="hl-question-text" ref={headingRef} tabIndex={-1} id={`q-${question.id}`}>
            {question.text}
          </h1>
          {question.multi && <p className="hl-caption" style={{ textAlign: 'left' }}>当てはまるものをすべて選んでください</p>}
          {question.note && <p className="hl-question-note">{question.note}</p>}
        </div>
        <fieldset className="hl-options" aria-labelledby={`q-${question.id}`}>
          {question.options.map((option) => {
            const on = selected.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                className="hl-option"
                aria-pressed={on}
                onClick={() => toggle(option.id)}
              >
                <span className={`hl-option-mark${question.multi ? ' hl-option-mark-square' : ''}`}>
                  {question.multi && on ? <CheckIcon /> : null}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </fieldset>
        {alert && (
          <div className="hl-section">
            <SafetyNotice title="すぐに119番へ">
              <p>{alert}</p>
            </SafetyNotice>
          </div>
        )}
        <div className="hl-actions">
          <div className="hl-actions-row">
            <button type="button" className="hl-btn hl-btn-secondary hl-btn-grow" onClick={onBack}>
              戻る
            </button>
            <button
              type="button"
              className="hl-btn hl-btn-primary hl-btn-grow2"
              onClick={onNext}
              disabled={!answered}
            >
              {answered ? nextLabel ?? (isLast ? '結果を見る' : '次へ') : '選ぶと次へ進めます'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
