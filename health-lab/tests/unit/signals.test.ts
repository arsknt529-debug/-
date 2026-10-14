import { describe, expect, it } from 'vitest';
import { symptoms, type SymptomId } from '@/features/health-lab/content/signals';
import type { Answers } from '@/features/health-lab/content/types';
import { buildSignalsQuestions, buildSignalsResult, triage } from '@/features/health-lab/engine/signals';
import { FORBIDDEN, sweepAnswers } from './helpers';

const calm: Answers = { c1_since: 'days', c2_frequency: 'sometimes', c3_impact: 'manageable', c4_change: 'same', c5_lifestyle: 'none' };

describe('不調のサイン：質問の組み立て', () => {
  it('共通5問＋選んだ症状ごとに1〜3問', () => {
    for (const s of symptoms) {
      const qs = buildSignalsQuestions([s.id]);
      expect(qs.length - 5).toBeGreaterThanOrEqual(1);
      expect(qs.length - 5).toBeLessThanOrEqual(3);
    }
    expect(buildSignalsQuestions(['sleep', 'edema']).map((q) => q.id).slice(5)).toEqual([
      'edema_side', 'edema_onset', 'edema_with', 'sleep_onset', 'sleep_waking', 'sleep_morning',
    ]);
  });
});

describe('不調のサイン：受診目安（仮案）', () => {
  it('落ち着いた回答はふり返り', () => {
    expect(triage(['fatigue'], { ...calm, fatigue_rest: 'sometimes', fatigue_with: 'no' }).level).toBe('reflect');
  });
  it('急に悪くなった → 早めの受診', () => {
    expect(triage(['fatigue'], { ...calm, c4_change: 'sudden' }).level).toBe('seek_soon');
  });
  it('数か月以上続いている → 相談', () => {
    expect(triage(['cold'], { ...calm, c1_since: 'months', cold_where: 'extremities', cold_with: 'no' }).level).toBe('consult');
  });
  it('むくみ＋息苦しさ → 緊急', () => {
    expect(triage(['edema'], { ...calm, edema_side: 'both', edema_onset: 'gradual', edema_with: 'breath' }).level).toBe('emergency');
  });
  it('片側のむくみ＋急に → 早めの受診', () => {
    expect(triage(['edema'], { ...calm, edema_side: 'one', edema_onset: 'sudden', edema_with: 'no' }).level).toBe('seek_soon');
  });
  it('しびれ・出血 → 早めの受診', () => {
    expect(triage(['shoulder_back'], { ...calm, sb_numb: 'yes' }).level).toBe('seek_soon');
    expect(triage(['stomach'], { ...calm, st_blood: 'yes' }).level).toBe('seek_soon');
  });
  it('その他の不調でよくわからない → 相談', () => {
    expect(triage(['other'], { ...calm, other_state: 'unknown' }).level).toBe('consult');
  });
  it('こころの安全に関わる回答 → 相談窓口を表示', () => {
    const r = buildSignalsResult(['stress'], { ...calm, stress_impact: 'some', stress_support: 'none', stress_safety: 'yes' });
    expect(r.crisis?.line).toContain('0570-064-556');
    expect(r.nextSteps.map((s) => s.label)).not.toContain('60秒の健康習慣動画');
  });
  it('症状を選び直した場合、外した症状の古い回答は使わない', () => {
    const answers = { ...calm, edema_with: 'breath', sleep_onset: 'rarely', sleep_waking: 'rarely', sleep_morning: 'often' };
    expect(triage(['sleep'], answers).level).toBe('reflect');
  });
});

describe('不調のサイン：結果', () => {
  it('受診をすすめる場合は通常の健康コンテンツへ誘導しない', () => {
    const r = buildSignalsResult(['fatigue'], { ...calm, c3_impact: 'major' });
    expect(r.safety?.length).toBe(1);
    const labels = r.nextSteps.map((s) => s.label);
    expect(labels).not.toContain('60秒の健康習慣動画');
    expect(labels).not.toContain('XCOUNTの健康情報');
    expect(r.gift).toContain('医療機関');
  });

  it('疲れの例文（指示書）', () => {
    const r = buildSignalsResult(['fatigue'], { ...calm, fatigue_rest: 'sometimes', fatigue_with: 'no' });
    expect(r.gift).toBe('今日は、無理をせず休息の時間を少し大切にしてみませんか？');
    expect(r.medical).toContain('医療機関');
  });

  it('どの症状・回答でも結果が空にならず、病名や断定を含まない', () => {
    const all: SymptomId[] = symptoms.map((s) => s.id);
    for (const answers of sweepAnswers(buildSignalsQuestions(all))) {
      const r = buildSignalsResult(all, answers);
      expect(r.discovery.length).toBe(all.length);
      const text = [...r.discovery, ...r.understanding, r.gift, r.medical, ...(r.safety ?? [])].join('\n');
      for (const p of FORBIDDEN) expect(p.test(text)).toBe(false);
    }
  });
});
