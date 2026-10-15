'use client';

import { useEffect, useState } from 'react';
import { domains, promises } from '../content/future';
import { clearGift, createGift, dayNumber, GIFT_DAYS, loadGift, saveGift, type GiftRecord } from '../lib/giftStorage';
import { HeartIcon } from './icons';
import { Photo } from './Photo';

/** 7日間のギフト（自分への小さな約束 ＋ 7日カレンダー） */
export function GiftSection({ promiseOrder }: { promiseOrder?: string[] }) {
  const [record, setRecord] = useState<GiftRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [choice, setChoice] = useState<string>('');

  useEffect(() => {
    setRecord(loadGift());
    setLoaded(true);
  }, []);

  const ordered = promiseOrder
    ? promiseOrder.map((id) => promises.find((p) => p.id === id)).filter((p): p is (typeof promises)[number] => Boolean(p))
    : promises;

  const update = (next: GiftRecord | null) => {
    setRecord(next);
    if (next) saveGift(next);
    else clearGift();
  };

  if (!loaded) return null;

  if (!record) {
    return (
      <section className="hl-card" id="gift" aria-labelledby="hl-gift-choose">
        <Photo name="gift" size="sm" className="hl-photo-card" decorative />
        <h2 className="hl-card-label" id="hl-gift-choose">
          7日間のギフト
        </h2>
        <p>未来の自分へ、小さな約束を1つ選んでみましょう。</p>
        <fieldset aria-labelledby="hl-gift-choose" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ordered.map((p) => (
            <button key={p.id} type="button" className="hl-option" aria-pressed={choice === p.id} onClick={() => setChoice(p.id)} style={{ minHeight: 56, fontSize: 15 }}>
              <span className="hl-option-mark" />
              <span>
                <small style={{ display: 'block', fontSize: 11, color: 'var(--hl-muted)', fontWeight: 400 }}>
                  {domains.find((d) => d.id === p.domain)?.name}
                </small>
                {p.text}
              </span>
            </button>
          ))}
        </fieldset>
        <button type="button" className="hl-btn hl-btn-primary" disabled={!choice} onClick={() => update(createGift(choice))}>
          {choice ? 'この約束で始める' : '約束を1つ選んでください'}
        </button>
        <p className="hl-caption">記録はこの端末の中だけに残ります。サーバーには送信しません。</p>
      </section>
    );
  }

  const promise = promises.find((p) => p.id === record.promiseId) ?? promises[0];
  const today = dayNumber(record.startDate);
  const doneCount = record.done.filter(Boolean).length;
  const finished = today > GIFT_DAYS;
  const message = finished
    ? `7日間、おつかれさまでした。${doneCount > 0 ? `${doneCount}日、自分を大切にする時間がありました。` : ''}また気が向いたときに、新しい約束を始めてみましょう。`
    : doneCount === 0
      ? 'できた日に、そっと印をつけましょう。はじめの一日を楽しみにしています。'
      : `これまでに${doneCount}日、自分を大切にする時間がありました。`;

  return (
    <section className="hl-card" id="gift" aria-labelledby="hl-gift-progress">
      <h2 className="hl-card-label" id="hl-gift-progress">
        7日間のギフト
      </h2>
      <div className="hl-gift" style={{ padding: '18px 18px' }}>
        <span className="hl-gift-label">自分への小さな約束</span>
        <p className="hl-gift-text" style={{ fontSize: 17 }}>
          {promise.text}
        </p>
      </div>
      <p className="hl-sub">できた日に印をつけましょう。できなかった日があっても大丈夫。また今日から。</p>
      <div className="hl-calendar" role="group" aria-label="7日間のカレンダー">
        {record.done.map((on, i) => {
          const n = i + 1;
          const future = n > today;
          return (
            <button
              key={n}
              type="button"
              className={`hl-day${n === today ? ' hl-day-today' : ''}`}
              aria-pressed={on}
              aria-label={`${n}日目${n === today ? '（今日）' : ''}${on ? '、できた' : ''}`}
              disabled={future}
              onClick={() => {
                const done = record.done.slice();
                done[i] = !done[i];
                update({ ...record, done });
              }}
            >
              <span>{n}日目</span>
              {on ? <HeartIcon /> : <span className="hl-day-dot" />}
            </button>
          );
        })}
      </div>
      <p className="hl-sub" aria-live="polite">
        {message}
      </p>
      <button
        type="button"
        className="hl-btn hl-btn-secondary"
        onClick={() => {
          update(null);
          setChoice('');
        }}
      >
        {finished ? '新しい約束を始める' : '約束を選び直す（記録を消す）'}
      </button>
    </section>
  );
}
