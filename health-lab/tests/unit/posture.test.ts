import { describe, expect, it } from 'vitest';
import { postureQuestions } from '@/features/health-lab/content/posture';
import { buildPostureResult } from '@/features/health-lab/engine/posture';
import { FORBIDDEN, sweepAnswers } from './helpers';

const base = { q1_sitting: 'none', q2_fatigue: 'none', q3_weight: 'unknown', q4_mirror: 'none', q5_chair: 'none', q6_arms: 'easy', q7_wall: 'natural', q8_goal: 'overall' };

describe('骨格・姿勢の結果', () => {
  it('質問は8問、各4択', () => {
    expect(postureQuestions).toHaveLength(8);
    for (const q of postureQuestions) expect(q.options).toHaveLength(4);
  });

  it('どの回答でも、3段構成の結果が空にならず、禁止表現を含まない', () => {
    for (const answers of sweepAnswers(postureQuestions)) {
      const r = buildPostureResult(answers);
      expect(r.discovery.length).toBeGreaterThan(0);
      expect(r.discovery.length).toBeLessThanOrEqual(3);
      expect(r.understanding.length).toBeGreaterThan(0);
      expect(r.gift.length).toBeGreaterThan(0);
      const all = [...r.discovery, ...r.understanding, r.gift, ...(r.safety ?? [])].join('\n');
      for (const p of FORBIDDEN) expect(p.test(all)).toBe(false);
    }
  });

  it('首・肩を選ぶと、指示書の例どおりの文言になる', () => {
    const r = buildPostureResult({ ...base, q2_fatigue: 'neck_shoulder' });
    expect(r.discovery[0]).toBe('首・肩まわりへの負担が気になっているようです。');
    expect(r.gift).toBe('今日は一度、席から立って身体を動かしてみませんか？');
  });

  it('痛みがある場合は運動を提案せず、休息と受診の案内を出す', () => {
    const r = buildPostureResult({ ...base, q2_fatigue: 'neck_shoulder', q6_arms: 'pain', q8_goal: 'start_exercise' });
    expect(r.gift).toContain('休む');
    expect(r.safety?.[0]).toContain('医療機関');
    expect(r.nextSteps.map((s) => s.label)).not.toContain('60秒セルフケア');
    expect(r.understanding.join('')).not.toContain('運動は、無理なく続けられることから');
  });

  it('動作確認をスキップ（試せない）しても結果が出る', () => {
    const r = buildPostureResult({ ...base, q7_wall: 'unknown' });
    expect(r.discovery.length).toBeGreaterThan(0);
  });

  it('特に気になる点がない場合は、その旨を伝える', () => {
    const r = buildPostureResult({ ...base, q6_arms: 'pain', q7_wall: 'unknown' });
    expect(r.discovery[0]).toContain('特に気になるところは挙がりませんでした');
  });
});
