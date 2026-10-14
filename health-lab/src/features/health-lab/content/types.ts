/**
 * XCOUNT HEALTH LAB 共通の型定義。
 *
 * 質問・選択肢・結果文言はすべてデータとして定義し、画面のコードから分離する。
 * 文言には監修状態（review）を持たせ、専門家の確認前の仮原稿であることを管理できるようにする。
 */

/** 文言の監修状態。'draft' = 専門家監修前の仮原稿 */
export type ReviewStatus = 'draft' | 'reviewed';

export interface Copy {
  text: string;
  review: ReviewStatus;
}

/** 文言辞書。キーは `feature.section.name` 形式 */
export type CopyDict = Record<string, Copy>;

export interface Option {
  id: string;
  label: string;
  /**
   * true の場合、この選択肢が選ばれた時点でセルフチェックを中止し、緊急案内を表示する。
   * （不調のサインのみで使用。医療専門職の監修が公開条件）
   */
  emergency?: boolean;
}

export interface Question {
  id: string;
  text: string;
  /** 質問の下に表示する補足（安全上の注意など） */
  note?: string;
  options: Option[];
  /** 複数選択 */
  multi?: boolean;
}

/** 回答。単一選択は選択肢ID、複数選択は選択肢IDの配列 */
export type Answers = Record<string, string | string[]>;

export interface NextStep {
  label: string;
  /** null の場合は「準備中」として表示（リンク先が未確定） */
  href: string | null;
  description?: string;
}

/** 4機能共通の結果フォーマット */
export interface CommonResult {
  /** 結果の最上部に表示する安全上の案内（受診・相談など） */
  safety?: string[];
  /** DISCOVERY｜発見 */
  discovery: string[];
  /** UNDERSTANDING｜理解 */
  understanding: string[];
  /** SMALL GIFT｜今日の小さなギフト */
  gift: string;
  /** NEXT STEP｜これから */
  nextSteps: NextStep[];
  /** 結果の下に表示する注意書き */
  footnote?: string;
}

export type ContentId = 'posture' | 'checkup' | 'signals' | 'future';
