import { describe, expect, it } from 'vitest';
import { futureQuestions } from '@/features/health-lab/content/future';
import { buildFutureResult, classifyDomains } from '@/features/health-lab/engine/future';
import { dayNumber, createGift } from '@/features/health-lab/lib/giftStorage';
import { FORBIDDEN, sweepAnswers } from './helpers';

const all = (id: string) => Object.fromEntries(futureQuestions.map((q) => [q.id, q.options.find((o) => o.id === id)?.id ?? q.options[3].id]));

describe('未来の健康', () => {
  it('10問・4択', () => {
    expect(futureQuestions).toHaveLength(10);
  });

  it('「わからない」「答えたくない」は数えない', () => {
    const answers = all('unknown');
    answers.f9 = 'skip';
    answers.f10 = 'skip';
    const status = classifyDomains(answers);
    expect(Object.values(status).every((s) => s === 'skipped')).toBe(true);
    const r = buildFutureResult(answers);
    expect(r.cared).toEqual([]);
    expect(r.room).toEqual([]);
    expect(r.discovery[0]).toContain('答えにくいことがあっても大丈夫');
  });

  it('片方だけ答えた領域は、答えた方で整理する', () => {
    const answers = { ...all('a'), f1: 'unknown' };
    expect(classifyDomains(answers).move).toBe('cared');
  });

  it('見直す余地のある領域の約束が先頭に来る', () => {
    const answers = { ...all('a'), f5: 'c' };
    const r = buildFutureResult(answers);
    expect(r.room.map((x) => x.domain)).toEqual(['sleep']);
    expect(r.promiseOrder[0]).toBe('calm10');
    expect(r.gift).toContain('寝る前に10分');
  });

  it('点数・健康年齢・リスクを出さない', () => {
    for (const answers of sweepAnswers(futureQuestions)) {
      const r = buildFutureResult(answers);
      const text = [...r.discovery, ...r.understanding, r.gift, ...r.cared.map((c) => c.text), ...r.room.map((c) => c.text)].join('\n');
      for (const p of FORBIDDEN) expect(p.test(text)).toBe(false);
    }
  });

  it('7日間の日数計算', () => {
    const start = new Date(2026, 9, 14, 9);
    const g = createGift('walk5', start);
    expect(g.startDate).toBe('2026-10-14');
    expect(dayNumber(g.startDate, new Date(2026, 9, 14, 23))).toBe(1);
    expect(dayNumber(g.startDate, new Date(2026, 9, 20, 1))).toBe(7);
    expect(dayNumber(g.startDate, new Date(2026, 9, 21))).toBe(8);
    expect(dayNumber(g.startDate, new Date(2026, 9, 13))).toBe(0);
  });
});
