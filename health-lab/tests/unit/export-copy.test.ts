import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { commonQuestions, emergencySigns, followUpQuestions } from '@/features/health-lab/content/signals';
import { futureQuestions } from '@/features/health-lab/content/future';
import { postureQuestions } from '@/features/health-lab/content/posture';
import type { Question } from '@/features/health-lab/content/types';
import { allCopy } from './helpers';

/**
 * 監修依頼用に、質問と結果文言を Markdown に書き出す。
 *   npm run copy:export  →  copy-export/health-lab-copy.md
 */
const questionsMd = (title: string, qs: Question[]) =>
  [`### ${title}`, ...qs.map((q) => `- **${q.id}** ${q.text}${q.note ? `（注：${q.note}）` : ''}\n${q.options.map((o) => `  - ${o.label}${o.emergency ? ' 【緊急案内へ】' : ''}`).join('\n')}`)].join('\n');

describe('文言の書き出し', () => {
  it.runIf(process.env.HEALTHLAB_EXPORT === '1')('copy-export/health-lab-copy.md を出力する', () => {
    const lines = [
      '# XCOUNT HEALTH LAB 文言一覧（監修用）',
      '',
      '## 質問',
      questionsMd('骨格・姿勢', postureQuestions),
      questionsMd('不調のサイン：共通', commonQuestions),
      `### 不調のサイン：緊急症状の確認\n${emergencySigns.map((s) => `- ${s}`).join('\n')}`,
      ...Object.entries(followUpQuestions).map(([id, qs]) => questionsMd(`不調のサイン：${id}`, qs)),
      questionsMd('未来の健康', futureQuestions),
      '',
      '## 結果文言',
      '| キー | 状態 | 文言 |',
      '|---|---|---|',
      ...Object.entries(allCopy).map(([k, c]) => `| ${k} | ${c.review === 'reviewed' ? '監修済' : '監修前'} | ${c.text.replaceAll('|', '｜')} |`),
    ];
    const dir = path.resolve(__dirname, '../../copy-export');
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'health-lab-copy.md'), lines.join('\n') + '\n');
    expect(lines.length).toBeGreaterThan(10);
  });
});
