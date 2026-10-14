import { checkupCopy } from '@/features/health-lab/content/checkup';
import { commonCopy } from '@/features/health-lab/content/common';
import { futureCopy } from '@/features/health-lab/content/future';
import { postureCopy } from '@/features/health-lab/content/posture';
import { signalsCopy } from '@/features/health-lab/content/signals';
import type { Answers, Question } from '@/features/health-lab/content/types';

export const allCopy = { ...commonCopy, ...postureCopy, ...checkupCopy, ...signalsCopy, ...futureCopy };

/** 各質問の選択肢の全組み合わせのうち、各質問を順に回す代表パターン（質問数×選択肢数） */
export function* sweepAnswers(questions: Question[]): Generator<Answers> {
  const maxOptions = Math.max(...questions.map((q) => q.options.length));
  for (let k = 0; k < maxOptions; k++) {
    const answers: Answers = {};
    for (const q of questions) answers[q.id] = q.options[k % q.options.length].id;
    yield answers;
  }
  for (const q of questions) {
    for (const o of q.options) {
      const answers: Answers = {};
      for (const other of questions) answers[other.id] = other.options[other.options.length - 1].id;
      answers[q.id] = o.id;
      yield answers;
    }
  }
}

/** 結果文言に含めてはいけない表現（医学的な断定・病名・独自スコアなど） */
export const FORBIDDEN = [
  /猫背です/, /反り腰です/, /骨盤が(ゆが|歪)んで/, /ゆがみがあります/,
  /病気です/, /[一-龠]+病の可能性/, /疑いがあります/, /と診断/,
  /健康年齢/, /余命/, /発症リスク/, /発症確率/, /リスクが高/, /点数は\d/, /\d+点/,
  /異常です/, /正常です/, /基準値を超/, /高すぎ/, /低すぎ/,
  /失敗/, /サボ/, /ダメ/, /できませんでした/,
];
