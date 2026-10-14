import type { Answers, CopyDict } from '../content/types';

/** 単一選択の回答を取り出す（未回答・複数選択の場合は undefined） */
export function single(answers: Answers, questionId: string): string | undefined {
  const value = answers[questionId];
  return typeof value === 'string' ? value : undefined;
}

/** 複数選択の回答を取り出す（未回答なら空配列） */
export function multi(answers: Answers, questionId: string): string[] {
  const value = answers[questionId];
  if (Array.isArray(value)) return value;
  return typeof value === 'string' ? [value] : [];
}

/** 文言辞書から本文を取り出す。未定義のキーは開発時に気づけるよう例外にする */
export function textOf(dict: CopyDict, key: string): string {
  const copy = dict[key];
  if (!copy) throw new Error(`Undefined copy key: ${key}`);
  return copy.text;
}

export function has(dict: CopyDict, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(dict, key);
}
