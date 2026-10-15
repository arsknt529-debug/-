'use client';

import { useId, useMemo, useState } from 'react';
import { categories, checkupItems, findItem, judgments, type CategoryId, type Judgment } from '../content/checkup';
import { ROUTES } from '../content/links';
import {
  askText,
  buildCheckupResult,
  checkPlausibility,
  checkupText,
  lifestyleText,
  PARSE_MESSAGES,
  parseNumber,
  plausibilityMessage,
  type CheckupRecord,
} from '../engine/checkup';
import { Disclaimer } from './Disclaimer';
import { Header } from './Header';
import { Photo } from './Photo';
import { ChevronIcon, InfoIcon } from './icons';
import { ResultView } from './ResultView';
import { TrendChart } from './TrendChart';
import { useScreenHistory } from './useScreenHistory';

type Screen = 'intro' | 'input' | 'result';

interface FormState {
  itemId: string;
  unitId: string;
  raw: string;
  date: string;
  range: string;
  judgment: Judgment | '';
}

const emptyForm = (itemId = checkupItems[0].id): FormState => ({
  itemId,
  unitId: findItem(itemId)?.units[0].id ?? '',
  raw: '',
  date: '',
  range: '',
  judgment: '',
});

export function CheckupApp() {
  const { screen, navigate, back } = useScreenHistory<Screen>('intro');
  // 入力した記録は画面のメモリ上だけに保持する（保存・送信しない）
  const [records, setRecords] = useState<CheckupRecord[]>([]);
  const [currentKey, setCurrentKey] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [openCategory, setOpenCategory] = useState<CategoryId | null>(null);

  const current = records.find((r) => r.key === currentKey) ?? null;
  const result = useMemo(() => (current ? buildCheckupResult(current, records) : null), [current, records]);

  const startInput = (itemId?: string, unitId?: string) => {
    const next = emptyForm(itemId);
    if (unitId) next.unitId = unitId;
    setForm(next);
    navigate('input');
  };

  const restart = () => {
    setRecords([]);
    setCurrentKey(null);
    setForm(emptyForm());
    navigate('intro');
  };

  if (screen === 'input') {
    return (
      <CheckupInput
        form={form}
        setForm={setForm}
        onBack={back}
        onSubmit={(record) => {
          const key = Date.now();
          setRecords((prev) => [...prev, { ...record, key }]);
          setCurrentKey(key);
          navigate('result');
        }}
      />
    );
  }

  if (screen === 'result' && current && result) {
    return (
      <ResultView
        contentName="健康診断を読み解く"
        heading={result.item.name}
        result={{ ...result, understanding: [] }}
        onRetry={restart}
        backHref={ROUTES.checkup}
        photo="checkup"
        labels={{ discovery: '01 ｜ 数字の意味を知る' }}
        discoverySlot={
          <article className="hl-card" aria-labelledby="hl-meaning">
            <h2 className="hl-card-label" id="hl-meaning">
              01 ｜ 数字の意味を知る
            </h2>
            <p>{result.discovery[0]}</p>
            <dl className="hl-sub" style={{ margin: 0, fontSize: 14, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px' }}>
              <dt>入力した値</dt>
              <dd style={{ margin: 0, fontWeight: 700, color: 'var(--hl-text)' }}>
                {current.value} {result.unitLabel}
              </dd>
              {current.date && (
                <>
                  <dt>検査日</dt>
                  <dd style={{ margin: 0 }}>{current.date.replaceAll('-', '/')}</dd>
                </>
              )}
              {result.referenceRange && (
                <>
                  <dt>基準範囲</dt>
                  <dd style={{ margin: 0 }}>{result.referenceRange}（検査票の記載）</dd>
                </>
              )}
            </dl>
            {result.referenceRange && <p className="hl-caption" style={{ textAlign: 'left' }}>{checkupText('checkup.range.note')}</p>}
            <p className="hl-caption" style={{ textAlign: 'left' }}>
              良い・悪いの判定は表示しません。判定は健診機関の結果をご確認ください。
            </p>
          </article>
        }
        middle={
          <>
            <article className="hl-card" aria-labelledby="hl-trend">
              <h2 className="hl-card-label" id="hl-trend">
                02 ｜ 自分の変化に気づく
              </h2>
              {result.trend.length >= 2 ? (
                <>
                  <TrendChart points={result.trend} unitLabel={result.unitLabel} itemName={result.item.name} />
                  <p className="hl-caption" style={{ textAlign: 'left' }}>{checkupText('checkup.trend.note')}</p>
                </>
              ) : (
                <p className="hl-sub">{checkupText('checkup.trend.empty')}</p>
              )}
              <button type="button" className="hl-btn hl-btn-secondary" onClick={() => startInput(current.itemId, current.unitId)}>
                別の検査日の値を追加する
              </button>
            </article>
            <article className="hl-card" aria-labelledby="hl-step">
              <h2 className="hl-card-label" id="hl-step">
                03 ｜ 次の一歩を考える
              </h2>
              {!result.safety && <p>{checkupText(`checkup.judgment.${current.judgment}`)}</p>}
              <p className="hl-sub">{lifestyleText(result.item)}</p>
              <p className="hl-sub">{askText()}</p>
            </article>
          </>
        }
      />
    );
  }

  return (
    <div className="hl-page">
      <Header title="CARD 02 ・ 健康診断" back={ROUTES.hub} backLabel="一覧へ戻る" />
      <main className="hl-main">
        <Photo name="checkup" className="hl-photo-hero" priority />
        <section className="hl-hero hl-hero-tight">
          <h1 className="hl-title">
            その数字、
            <br />
            意味まで知っていますか？
          </h1>
          <p className="hl-lead">健康診断の数字の意味を、やさしく読み解きます。</p>
        </section>

        <section className="hl-section" aria-label="3つの入り口">
          <button type="button" className="hl-entry hl-entry-primary" onClick={() => startInput()}>
            <span className="hl-entry-key">B</span>
            <span className="hl-entry-body">
              <strong>気になる数値を入力する</strong>
              <span>検査値から、その意味を確認</span>
            </span>
            <ChevronIcon />
          </button>
          <a className="hl-entry" href="#items">
            <span className="hl-entry-key" style={{ color: 'var(--accent)' }}>
              C
            </span>
            <span className="hl-entry-body">
              <strong>検査項目の意味から知る</strong>
              <span>6つのカテゴリーから探す</span>
            </span>
            <ChevronIcon />
          </a>
          <div className="hl-entry hl-entry-disabled" aria-disabled="true">
            <span className="hl-entry-key">A</span>
            <span className="hl-entry-body">
              <strong>健康診断表を撮影する</strong>
              <span>準備中</span>
            </span>
          </div>
        </section>

        <section className="hl-section" id="items" aria-labelledby="hl-categories">
          <h2 className="hl-eyebrow" id="hl-categories">
            6 CATEGORIES
          </h2>
          <div className="hl-category-grid">
            {categories.map((c) => {
              const items = checkupItems.filter((i) => i.category === c.id);
              const open = openCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  className="hl-category"
                  aria-expanded={open}
                  aria-controls="hl-category-items"
                  onClick={() => setOpenCategory(open ? null : c.id)}
                >
                  <strong>{c.name}</strong>
                  <span>{items.map((i) => i.short).join(' / ')}</span>
                </button>
              );
            })}
          </div>
          <div id="hl-category-items" className="hl-item-list" aria-live="polite">
            {openCategory &&
              checkupItems
                .filter((i) => i.category === openCategory)
                .map((item) => (
                  <article key={item.id} className="hl-item-card">
                    <h3>{item.name}</h3>
                    <p>{checkupText(`checkup.meaning.${item.id}`)}</p>
                    <p>{lifestyleText(item)}</p>
                    <button type="button" className="hl-text-btn" style={{ color: 'var(--accent)', padding: 0, alignSelf: 'flex-start' }} onClick={() => startInput(item.id)}>
                      この項目の数値を入力する
                    </button>
                  </article>
                ))}
          </div>
        </section>

        <p className="hl-hint">
          <InfoIcon style={{ flex: 'none', marginTop: 3 }} />
          <span>良い・悪いの判定はしません。健診機関の指示を優先してください。</span>
        </p>
        <Disclaimer />
        <div style={{ height: 32 }} />
      </main>
    </div>
  );
}

function CheckupInput({
  form,
  setForm,
  onBack,
  onSubmit,
}: {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
  onBack: () => void;
  onSubmit: (record: Omit<CheckupRecord, 'key'>) => void;
}) {
  const ids = useId();
  const [error, setError] = useState<string | null>(null);
  const [judgmentError, setJudgmentError] = useState(false);
  // 想定外の値で一度確認を出した入力（同じ入力のまま再度押したら進める）
  const [confirmedFor, setConfirmedFor] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const item = findItem(form.itemId) ?? checkupItems[0];
  const signature = `${form.itemId}|${form.unitId}|${form.raw}`;

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setError(null);
    setWarning(null);
    setConfirmedFor(null);
  };

  const submit = () => {
    const parsed = parseNumber(form.raw);
    if (!parsed.ok) {
      setError(PARSE_MESSAGES[parsed.reason]);
      return;
    }
    if (!form.judgment) {
      setJudgmentError(true);
      return;
    }
    const plausibility = checkPlausibility(item, form.unitId, parsed.value);
    const message = plausibilityMessage(item, form.unitId, plausibility);
    if (message && confirmedFor !== signature) {
      setWarning(message);
      setConfirmedFor(signature);
      return;
    }
    onSubmit({
      itemId: item.id,
      unitId: form.unitId,
      value: parsed.value,
      date: form.date || undefined,
      referenceRange: form.range || undefined,
      judgment: form.judgment,
    });
  };

  return (
    <div className="hl-page">
      <Header title="気になる数値を入力する" back={onBack} />
      <main className="hl-main">
        <form
          className="hl-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="hl-field">
            <label className="hl-label" htmlFor={`${ids}-item`}>
              検査項目
            </label>
            <select
              id={`${ids}-item`}
              className="hl-select"
              value={form.itemId}
              onChange={(e) => {
                const next = findItem(e.target.value);
                update({ itemId: e.target.value, unitId: next?.units[0].id ?? '' });
              }}
            >
              {categories.map((c) => (
                <optgroup key={c.id} label={c.name}>
                  {checkupItems
                    .filter((i) => i.category === c.id)
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="hl-grid-3">
            <div className="hl-field">
              <label className="hl-label" htmlFor={`${ids}-value`}>
                検査値
              </label>
              <input
                id={`${ids}-value`}
                className="hl-input"
                inputMode="decimal"
                autoComplete="off"
                placeholder="例：5.6"
                value={form.raw}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${ids}-value-error` : warning ? `${ids}-warning` : undefined}
                onChange={(e) => update({ raw: e.target.value })}
              />
            </div>
            <div className="hl-field">
              <label className="hl-label" htmlFor={`${ids}-unit`}>
                単位
              </label>
              <select id={`${ids}-unit`} className="hl-select" value={form.unitId} onChange={(e) => update({ unitId: e.target.value })}>
                {item.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <p className="hl-error" id={`${ids}-value-error`} role="alert">
              {error}
            </p>
          )}
          {warning && (
            <div className="hl-warn" id={`${ids}-warning`} role="alert">
              <InfoIcon style={{ flex: 'none', marginTop: 3 }} />
              <span>
                {warning}
                <br />
                確認のうえ、このまま進む場合はもう一度ボタンを押してください。
              </span>
            </div>
          )}

          <div className="hl-grid-2">
            <div className="hl-field">
              <label className="hl-label" htmlFor={`${ids}-date`}>
                検査日<small>任意</small>
              </label>
              <input id={`${ids}-date`} className="hl-input" type="date" value={form.date} onChange={(e) => update({ date: e.target.value })} />
            </div>
            <div className="hl-field">
              <label className="hl-label" htmlFor={`${ids}-range`}>
                基準範囲<small>任意</small>
              </label>
              <input
                id={`${ids}-range`}
                className="hl-input"
                placeholder="検査票の記載"
                autoComplete="off"
                value={form.range}
                onChange={(e) => update({ range: e.target.value })}
              />
            </div>
          </div>

          <fieldset className="hl-field" aria-describedby={judgmentError ? `${ids}-judgment-error` : undefined}>
            <legend className="hl-label" style={{ paddingBottom: 8 }}>
              健診機関による判定
            </legend>
            <div className="hl-pills">
              {judgments.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  className="hl-pill"
                  aria-pressed={form.judgment === j.id}
                  onClick={() => {
                    setJudgmentError(false);
                    setForm((prev) => ({ ...prev, judgment: j.id }));
                  }}
                >
                  {j.label}
                </button>
              ))}
            </div>
            {judgmentError && (
              <p className="hl-error" id={`${ids}-judgment-error`} role="alert">
                検査票に記載された判定を選んでください。わからない場合は「不明」を選んでください。
              </p>
            )}
          </fieldset>

          <div className="hl-actions" style={{ padding: '8px 0 28px' }}>
            <button type="submit" className="hl-btn hl-btn-primary">
              {warning ? 'このまま進む' : '確認して意味を見る'}
            </button>
            <p className="hl-caption">入力した数値はこの端末の外に送信されません。</p>
          </div>
        </form>
      </main>
    </div>
  );
}
