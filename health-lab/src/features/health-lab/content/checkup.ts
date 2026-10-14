import { draft } from './draft';
import type { CopyDict } from './types';

/**
 * ② 健康診断を読み解く — 検査項目マスター
 *
 * 重要：
 * - ここには「良い・悪い」を決める基準値を持たない（独自の基準値・異常判定は作らない）。
 * - `plausible` は入力ミス（単位の取り違え・桁や小数点の誤り）に気づくための
 *   「入力として起こりうる範囲」であり、医学的な基準範囲ではない。画面にも表示しない。
 *   この範囲も医療監修の対象とする。
 */

export type CategoryId = 'vascular' | 'glucose' | 'lipid' | 'liver' | 'kidney' | 'body';

export interface Category {
  id: CategoryId;
  name: string;
}

export interface Unit {
  id: string;
  label: string;
  /** 入力として起こりうる範囲 [min, max]（入力確認用。医学的な基準範囲ではない） */
  plausible: [number, number];
}

export interface CheckupItem {
  id: string;
  name: string;
  /** 一覧で使う短い名前 */
  short: string;
  category: CategoryId;
  units: Unit[];
}

export const categories: Category[] = [
  { id: 'vascular', name: '血管・血圧' },
  { id: 'glucose', name: '血糖・代謝' },
  { id: 'lipid', name: '脂質バランス' },
  { id: 'liver', name: '肝臓の働き' },
  { id: 'kidney', name: '腎臓の働き' },
  { id: 'body', name: '身体の基本' },
];

export const checkupItems: CheckupItem[] = [
  { id: 'sbp', name: '収縮期血圧', short: '収縮期血圧', category: 'vascular', units: [{ id: 'mmHg', label: 'mmHg', plausible: [50, 280] }] },
  { id: 'dbp', name: '拡張期血圧', short: '拡張期血圧', category: 'vascular', units: [{ id: 'mmHg', label: 'mmHg', plausible: [20, 180] }] },
  {
    id: 'fbg',
    name: '空腹時血糖',
    short: '空腹時血糖',
    category: 'glucose',
    units: [
      { id: 'mg/dL', label: 'mg/dL', plausible: [30, 700] },
      { id: 'mmol/L', label: 'mmol/L', plausible: [1.5, 40] },
    ],
  },
  {
    id: 'hba1c',
    name: 'HbA1c',
    short: 'HbA1c',
    category: 'glucose',
    units: [
      { id: '%', label: '%', plausible: [3, 20] },
      { id: 'mmol/mol', label: 'mmol/mol', plausible: [9, 195] },
    ],
  },
  {
    id: 'ldl',
    name: 'LDLコレステロール',
    short: 'LDL',
    category: 'lipid',
    units: [
      { id: 'mg/dL', label: 'mg/dL', plausible: [15, 500] },
      { id: 'mmol/L', label: 'mmol/L', plausible: [0.4, 13] },
    ],
  },
  {
    id: 'hdl',
    name: 'HDLコレステロール',
    short: 'HDL',
    category: 'lipid',
    units: [
      { id: 'mg/dL', label: 'mg/dL', plausible: [10, 200] },
      { id: 'mmol/L', label: 'mmol/L', plausible: [0.25, 5.2] },
    ],
  },
  {
    id: 'tg',
    name: '中性脂肪',
    short: '中性脂肪',
    category: 'lipid',
    units: [
      { id: 'mg/dL', label: 'mg/dL', plausible: [10, 5000] },
      { id: 'mmol/L', label: 'mmol/L', plausible: [0.1, 56] },
    ],
  },
  { id: 'ast', name: 'AST（GOT）', short: 'AST', category: 'liver', units: [{ id: 'U/L', label: 'U/L', plausible: [3, 3000] }] },
  { id: 'alt', name: 'ALT（GPT）', short: 'ALT', category: 'liver', units: [{ id: 'U/L', label: 'U/L', plausible: [1, 3000] }] },
  { id: 'ggt', name: 'γ-GT（γ-GTP）', short: 'γ-GT', category: 'liver', units: [{ id: 'U/L', label: 'U/L', plausible: [3, 3000] }] },
  {
    id: 'cre',
    name: 'クレアチニン',
    short: 'クレアチニン',
    category: 'kidney',
    units: [
      { id: 'mg/dL', label: 'mg/dL', plausible: [0.1, 20] },
      { id: 'µmol/L', label: 'µmol/L', plausible: [9, 1800] },
    ],
  },
  { id: 'egfr', name: 'eGFR', short: 'eGFR', category: 'kidney', units: [{ id: 'mL/min/1.73m²', label: 'mL/分/1.73m²', plausible: [2, 200] }] },
  { id: 'bmi', name: 'BMI', short: 'BMI', category: 'body', units: [{ id: 'kg/m²', label: 'kg/m²', plausible: [10, 70] }] },
  { id: 'waist', name: '腹囲', short: '腹囲', category: 'body', units: [{ id: 'cm', label: 'cm', plausible: [40, 200] }] },
];

export function findItem(id: string): CheckupItem | undefined {
  return checkupItems.find((item) => item.id === id);
}

export type Judgment = 'normal' | 'observe' | 'recheck' | 'detailed' | 'unknown';

/** 健診機関による判定（利用者が検査票の記載をそのまま選ぶ） */
export const judgments: { id: Judgment; label: string }[] = [
  { id: 'normal', label: '異常なし' },
  { id: 'observe', label: '経過観察・生活改善' },
  { id: 'recheck', label: '要再検査' },
  { id: 'detailed', label: '要精密検査・要受診' },
  { id: 'unknown', label: '不明' },
];

/** 文言（すべて専門家監修前の仮原稿） */
export const checkupCopy: CopyDict = {
  // 01｜数字の意味を知る
  'checkup.meaning.sbp': draft('心臓が縮んで血液を送り出すときに、血管にかかる圧力です。いわゆる「上の血圧」です。'),
  'checkup.meaning.dbp': draft('心臓が広がって血液をためているときに、血管にかかる圧力です。いわゆる「下の血圧」です。'),
  'checkup.meaning.fbg': draft('食事をとっていない状態で測った、血液中のブドウ糖の濃さです。'),
  'checkup.meaning.hba1c': draft('HbA1cは、最近1〜2か月程度の血糖状態を反映する指標です。'),
  'checkup.meaning.ldl': draft('血液中のコレステロールのうち、肝臓から全身へ運ばれるものです。「悪玉コレステロール」と呼ばれることもあります。'),
  'checkup.meaning.hdl': draft('全身の余分なコレステロールを肝臓へ戻す働きにかかわるものです。「善玉コレステロール」と呼ばれることもあります。'),
  'checkup.meaning.tg': draft('身体のエネルギー源として使われる脂肪の一種です。食事の影響を受けやすく、空腹時に採血したかどうかでも値が変わります。'),
  'checkup.meaning.ast': draft('肝臓や筋肉などに含まれる酵素です。肝臓のほか、激しい運動の後などにも値が変わることがあります。'),
  'checkup.meaning.alt': draft('主に肝臓に多く含まれる酵素です。肝臓の状態を知る手がかりの一つとされています。'),
  'checkup.meaning.ggt': draft('肝臓や胆道にかかわる酵素です。飲酒習慣などの影響を受けることが知られています。'),
  'checkup.meaning.cre': draft('筋肉で使われたエネルギーの残りかすで、腎臓から尿として排出されます。筋肉量によっても値が変わります。'),
  'checkup.meaning.egfr': draft('クレアチニンの値と年齢・性別から計算される、腎臓がどのくらい血液をろ過できているかの目安です。'),
  'checkup.meaning.bmi': draft('身長と体重から計算される、体格の目安です。筋肉量や体脂肪の割合まではわかりません。'),
  'checkup.meaning.waist': draft('おへその高さで測るお腹まわりの長さです。内臓のまわりの脂肪の目安の一つとして使われます。'),

  // 03｜次の一歩を考える — カテゴリー別の一般的な生活習慣情報
  'checkup.lifestyle.vascular': draft('食事の塩分、身体を動かす習慣、睡眠など、日々の生活を振り返るきっかけにしてみましょう。家庭で血圧を測る習慣も、自分の変化を知る手がかりになります。'),
  'checkup.lifestyle.glucose': draft('食事のとり方や、身体を動かす習慣を振り返ってみましょう。'),
  'checkup.lifestyle.lipid': draft('食事の内容や、身体を動かす習慣を振り返ってみましょう。'),
  'checkup.lifestyle.liver': draft('飲酒や食事、睡眠などの生活習慣を振り返ってみましょう。'),
  'checkup.lifestyle.kidney': draft('検査の値は、体調や水分の状態、筋肉量によっても変わることがあります。気になることは医療機関で確認しましょう。'),
  'checkup.lifestyle.body': draft('体重や腹囲は、同じ時間帯・同じ条件で定期的に測ると、変化に気づきやすくなります。'),
  'checkup.ask': draft('この値があなたにとってどんな意味を持つかは、年齢や体質、ほかの検査結果などによって変わります。気になることは、健診機関や医療機関で確認してみましょう。'),

  // 健診機関の判定に応じた案内（医療機関の指示を優先）
  'checkup.judgment.normal': draft('健診機関の判定は「異常なし」とのことです。これからも定期的な健診で、自分の変化を見ていきましょう。'),
  'checkup.judgment.observe': draft('健診機関から「経過観察・生活改善」とされています。健診機関からのアドバイスを確認し、生活習慣を見直すきっかけにしてみましょう。'),
  'checkup.judgment.recheck': draft('健診機関から「要再検査」とされています。健診機関の案内に従って、再検査を受けてください。'),
  'checkup.judgment.detailed': draft('健診機関から「要精密検査・要受診」とされています。できるだけ早く、健診機関の案内に従って医療機関を受診してください。'),
  'checkup.judgment.unknown': draft('判定がわからない場合は、健診結果の用紙を確認するか、健診機関に問い合わせてみましょう。'),

  'checkup.trend.note': draft('同じ項目・同じ単位で、検査日を入力した値だけを並べています。検査の条件（食事の有無・時間帯など）によっても値は変わります。'),
  'checkup.trend.empty': draft('別の検査日の値を追加すると、ここに変化が表示されます。'),
  'checkup.range.note': draft('検査票に記載された基準範囲は、健診機関によって異なることがあります。ここでは入力された内容をそのまま表示しています。'),
  'checkup.gift': draft('今日は、健診結果の用紙を見返して、気になった項目に印をつけてみませんか？'),
  'checkup.footnote': draft('ここでお伝えしているのは検査項目の一般的な意味です。医学的な判断は行いません。健診機関や医療機関の指示を優先してください。'),
};
