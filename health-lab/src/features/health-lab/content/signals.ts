import { draft } from './draft';
import type { CopyDict, Option, Question } from './types';

/**
 * ③ 不調のサインを知る
 *
 * ■ 公開条件
 *   症状別の安全基準（緊急症状・受診目安・追加質問・相談窓口）は、医療専門職の監修が完了するまで
 *   「安全性が確認されたもの」として公開しない。lib/flags.ts の機能フラグで非公開にしている。
 *
 * ■ 判定の考え方（仮案・要監修）
 *   - どれか1つでも当てはまれば、より慎重な段階を優先する（重い側に倒す）
 *   - 原因や病名は推測しない
 */

export type SymptomId = 'fatigue' | 'edema' | 'stress' | 'sleep' | 'shoulder_back' | 'cold' | 'stomach' | 'other';

export const symptoms: { id: SymptomId; label: string }[] = [
  { id: 'fatigue', label: '疲れ・だるさ' },
  { id: 'edema', label: 'むくみ' },
  { id: 'stress', label: 'ストレス・気分' },
  { id: 'sleep', label: '睡眠の悩み' },
  { id: 'shoulder_back', label: '肩こり・腰の重さ' },
  { id: 'cold', label: '冷え' },
  { id: 'stomach', label: 'お腹の調子' },
  { id: 'other', label: 'その他の不調' },
];

/** 急を要する症状（signals.urgent の文言と対応。監修時に一覧として確認する） */
export const emergencySigns: string[] = [
  '突然の強い胸の痛み',
  '強い息苦しさ',
  '突然の片側の手足のまひやしびれ',
  'ろれつが回らない・言葉が出ない',
];

/** 共通質問 Q1〜Q5 */
export const commonQuestions: Question[] = [
  {
    id: 'c1_since',
    text: 'その不調はいつ頃からありますか？',
    options: [
      { id: 'days0', label: '今日・昨日から' },
      { id: 'days', label: '数日前から' },
      { id: 'weeks', label: '数週間前から' },
      { id: 'months', label: '数か月以上前から' },
    ],
  },
  {
    id: 'c2_frequency',
    text: '最近、どのくらいの頻度で感じますか？',
    options: [
      { id: 'daily', label: 'ほぼ毎日' },
      { id: 'weekly', label: '週に数回' },
      { id: 'sometimes', label: 'ときどき' },
      { id: 'first', label: '今回が初めて' },
    ],
  },
  {
    id: 'c3_impact',
    text: '日常生活への影響はありますか？',
    options: [
      { id: 'major', label: '仕事や生活に大きく支障がある' },
      { id: 'some', label: '少し影響している' },
      { id: 'manageable', label: '気になるが普段どおり過ごせる' },
      { id: 'none', label: 'ほとんど影響はない' },
    ],
  },
  {
    id: 'c4_change',
    text: '症状は以前と比べてどうですか？',
    options: [
      { id: 'sudden', label: '急に悪くなった' },
      { id: 'gradual', label: '徐々に悪くなっている' },
      { id: 'same', label: 'あまり変わらない' },
      { id: 'better', label: '改善している' },
    ],
  },
  {
    id: 'c5_lifestyle',
    text: '最近、思い当たる生活の変化はありますか？',
    options: [
      { id: 'rest', label: '睡眠や休息が足りない' },
      { id: 'burden', label: '仕事や生活で負担が増えた' },
      { id: 'habit', label: '食事や運動の習慣が変わった' },
      { id: 'none', label: '特に思い当たらない' },
    ],
  },
];

const yesNoUnknown = (yes: string, extra?: Partial<Option>): Option[] => [
  { id: 'yes', label: yes, ...extra },
  { id: 'no', label: 'ない' },
  { id: 'unknown', label: 'わからない' },
];

/** 症状ごとの追加質問（1〜3問） */
export const followUpQuestions: Record<SymptomId, Question[]> = {
  fatigue: [
    {
      id: 'fatigue_rest',
      text: '休んでも疲れが取れない感じはありますか？',
      options: [
        { id: 'always', label: 'ほとんどいつもある' },
        { id: 'sometimes', label: 'ときどきある' },
        { id: 'rarely', label: 'あまりない' },
      ],
    },
    {
      id: 'fatigue_with',
      text: '疲れと一緒に、発熱・急な体重の変化・息切れなど、いつもと違う変化はありますか？',
      options: yesNoUnknown('ある'),
    },
  ],
  edema: [
    {
      id: 'edema_side',
      text: 'むくみは片側だけですか、両側ですか？',
      options: [
        { id: 'one', label: '片側だけ' },
        { id: 'both', label: '両側' },
        { id: 'unknown', label: 'わからない' },
      ],
    },
    {
      id: 'edema_onset',
      text: 'むくみは急に出てきましたか？',
      options: [
        { id: 'sudden', label: '急に出てきた' },
        { id: 'gradual', label: '少しずつ気になってきた' },
        { id: 'unknown', label: 'わからない' },
      ],
    },
    {
      id: 'edema_with',
      text: 'むくみと一緒に、次のようなことはありますか？',
      options: [
        { id: 'breath', label: '息苦しさがある', emergency: true },
        { id: 'pain', label: '痛みや赤み、熱っぽさがある' },
        { id: 'no', label: '特にない' },
      ],
    },
  ],
  stress: [
    {
      id: 'stress_impact',
      text: '気分の落ち込みや不安で、日常生活に影響はありますか？',
      options: [
        { id: 'major', label: '大きく影響している' },
        { id: 'some', label: '少し影響している' },
        { id: 'none', label: 'ほとんど影響はない' },
      ],
    },
    {
      id: 'stress_support',
      text: '気持ちを話せる相手や場所はありますか？',
      options: [
        { id: 'yes', label: 'ある' },
        { id: 'little', label: '少しある' },
        { id: 'none', label: '今は思い当たらない' },
      ],
    },
    {
      id: 'stress_safety',
      text: '「消えてしまいたい」「自分を傷つけたい」と感じることはありますか？',
      note: 'つらい質問でしたらごめんなさい。あなたの安全のために確認させてください。',
      options: [
        { id: 'yes', label: 'ある' },
        { id: 'no', label: 'ない' },
        { id: 'skip', label: '答えたくない' },
      ],
    },
  ],
  sleep: [
    {
      id: 'sleep_onset',
      text: '寝つくまでに時間がかかることはありますか？',
      options: [
        { id: 'often', label: 'よくある' },
        { id: 'sometimes', label: 'ときどきある' },
        { id: 'rarely', label: 'あまりない' },
      ],
    },
    {
      id: 'sleep_waking',
      text: '夜中に目が覚めることはありますか？',
      options: [
        { id: 'often', label: 'よくある' },
        { id: 'sometimes', label: 'ときどきある' },
        { id: 'rarely', label: 'あまりない' },
      ],
    },
    {
      id: 'sleep_morning',
      text: '朝起きたとき、休めた感じはありますか？',
      options: [
        { id: 'rarely', label: 'ほとんどない' },
        { id: 'sometimes', label: 'ときどきある' },
        { id: 'often', label: '多くの日にある' },
      ],
    },
  ],
  shoulder_back: [
    {
      id: 'sb_pain',
      text: '痛みはありますか？',
      options: [
        { id: 'strong', label: '強い痛みがある' },
        { id: 'mild', label: '軽い痛みがある' },
        { id: 'stiff', label: '重さやこりだけ' },
      ],
    },
    {
      id: 'sb_numb',
      text: '腕や脚に、しびれや力の入りにくさはありますか？',
      options: yesNoUnknown('ある'),
    },
    {
      id: 'sb_motion',
      text: '身体を動かすと、どう変わりますか？',
      options: [
        { id: 'better', label: '動かすと楽になる' },
        { id: 'worse', label: '動かすとつらくなる' },
        { id: 'same', label: '変わらない・わからない' },
      ],
    },
  ],
  cold: [
    {
      id: 'cold_where',
      text: '冷えを感じやすいのはどこですか？',
      options: [
        { id: 'extremities', label: '手足の先' },
        { id: 'whole', label: '身体全体' },
        { id: 'one_side', label: '片側や一部分だけ' },
      ],
    },
    {
      id: 'cold_with',
      text: '冷えと一緒に、皮膚の色の変化やしびれ、痛みはありますか？',
      options: yesNoUnknown('ある'),
    },
  ],
  stomach: [
    {
      id: 'st_pain',
      text: 'お腹の痛みはありますか？',
      options: [
        { id: 'strong', label: '強い痛みがある' },
        { id: 'mild', label: '軽い痛みや張りがある' },
        { id: 'none', label: '痛みはない' },
      ],
    },
    {
      id: 'st_bowel',
      text: '便通に変化はありますか？',
      options: [
        { id: 'persistent', label: '続いている変化がある' },
        { id: 'sometimes', label: 'ときどき変化がある' },
        { id: 'none', label: '特にない' },
      ],
    },
    {
      id: 'st_blood',
      text: '便に血が混じる、黒い便が出るなどはありますか？',
      options: yesNoUnknown('ある'),
    },
  ],
  other: [
    {
      id: 'other_state',
      text: 'その不調について、近いものを選んでください。',
      options: [
        { id: 'sudden', label: '急に始まった・強くなっている' },
        { id: 'long', label: '長く続いている' },
        { id: 'watching', label: '様子を見ている' },
        { id: 'unknown', label: 'よくわからない' },
      ],
    },
  ],
};

/** 文言（すべて専門家監修前の仮原稿。この機能は監修完了が公開条件） */
export const signalsCopy: CopyDict = {
  // 急を要する症状（専用ページは設けず、短い案内で伝える）
  'signals.urgent': draft('突然の強い胸の痛み・強い息苦しさ・片側のまひ・ろれつが回らないなどがあるときは、このチェックを使わずにすぐ119番へ。'),
  'signals.urgent_inline': draft('息苦しさがあるときは、このチェックを中断して、すぐに119番に電話してください。迷うときは地域の救急相談窓口（#7119 など）へ。'),

  // こころの安全（要監修：窓口の名称・番号は監修時に最新情報を確認すること）
  'signals.crisis.title': draft('ひとりで抱えこまないでください。'),
  'signals.crisis.body': draft('つらい気持ちを話してくれてありがとうございます。あなたの気持ちを聞いてくれる相談窓口があります。今すぐ危険な状態にあるときは、119番に電話してください。'),
  'signals.crisis.line': draft('こころの健康相談統一ダイヤル：0570-064-556（お住まいの地域の公的な相談窓口につながります。受付時間は地域によって異なります）'),

  // 受診目安
  'signals.seek_soon': draft('今回の回答には、早めに医療機関へ相談したほうがよいサインが含まれています。セルフケアより先に、医療機関への相談を考えてください。'),
  'signals.consult': draft('不調が続いている、または少しずつ強くなっているようです。続く場合は、医療機関に相談してみましょう。'),

  // DISCOVERY
  'signals.discovery.fatigue': draft('最近、疲れやだるさを感じることがあるようです。'),
  'signals.discovery.edema': draft('むくみが気になっているようです。'),
  'signals.discovery.stress': draft('気持ちの張りつめや、気分の変化を感じているようです。'),
  'signals.discovery.sleep': draft('睡眠について気になることがあるようです。'),
  'signals.discovery.shoulder_back': draft('肩こりや腰の重さを感じているようです。'),
  'signals.discovery.cold': draft('冷えが気になっているようです。'),
  'signals.discovery.stomach': draft('お腹の調子が気になっているようです。'),
  'signals.discovery.other': draft('気になる不調があるようです。'),

  // UNDERSTANDING — 見つめ直したい生活のポイント
  'signals.understanding.general': draft('不調にはさまざまな原因があり、このチェックで原因はわかりません。だからこそ、最近の生活を一度振り返ってみましょう。'),
  'signals.understanding.c5.rest': draft('睡眠や休息が足りていないと感じているようです。休息の取り方を振り返ってみましょう。'),
  'signals.understanding.c5.burden': draft('仕事や生活での負担が増えているようです。少し立ち止まって、自分をいたわる時間を作れているか振り返ってみましょう。'),
  'signals.understanding.c5.habit': draft('食事や運動の習慣が変わったとのことでした。最近の変化を振り返ってみましょう。'),
  'signals.understanding.sleep': draft('寝る前の過ごし方や、起きる時間・寝る時間を振り返ってみましょう。'),
  'signals.understanding.stress': draft('気持ちを話せる人や場所があることは、心の支えになります。信頼できる人や専門の相談窓口に話してみることも、自分を大切にする一つの方法です。'),

  // SMALL GIFT
  'signals.gift.fatigue': draft('今日は、無理をせず休息の時間を少し大切にしてみませんか？'),
  'signals.gift.edema': draft('今日は、座っている時間が長いときに、ときどき足首をゆっくり動かしてみませんか？'),
  'signals.gift.stress': draft('今日は、5分だけ自分のための静かな時間を作ってみませんか？'),
  'signals.gift.sleep': draft('今日は、寝る前の10分、画面から離れてゆっくり過ごしてみませんか？'),
  'signals.gift.shoulder_back': draft('今日は、1時間に一度、席を立って身体の向きを変えてみませんか？'),
  'signals.gift.cold': draft('今日は、温かい飲み物でひと息ついてみませんか？'),
  'signals.gift.stomach': draft('今日は、ゆっくりよく噛んで食事をしてみませんか？'),
  'signals.gift.other': draft('今日は、その不調を感じた時間や場面を、メモに残してみませんか？'),
  'signals.gift.care': draft('今日は無理をせず、身体を休めながら、医療機関に相談する準備をしてみませんか？'),

  // 医療機関への相談が必要な場合の案内（常に表示）
  'signals.medical': draft('急に悪くなったとき、日常生活に支障があるとき、長く続くとき、いつもと違うと感じたときは、医療機関に相談しましょう。どこに相談すればよいか迷うときは、かかりつけ医や地域の相談窓口（#7119 など）を利用できます。'),

  // 不調の記録方法
  'signals.record': draft('いつ・どこで・どのくらい・何をしていたときに感じたかを、スマートフォンのメモなどに書き残しておくと、医療機関やトレーナーに相談するときに役立ちます。'),
  'signals.revisit': draft('7日後に、もう一度このチェックで身体の様子を振り返ってみましょう。'),
  'signals.footnote': draft('この結果は医療診断ではありません。不調の原因を判断するものではありません。'),
};
