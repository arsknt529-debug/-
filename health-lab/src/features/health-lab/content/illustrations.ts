/**
 * XCOUNT HEALTH LAB のイラスト（ロゴの4色を使ったSVG）。
 * アプリとデザイン案（キャンバス）で同じ絵を使うため、SVG文字列として1か所で管理する。
 * 人物は肌の色を描かず、ブランドカラーのシルエットで表現している。
 */

const C = {
  blue: '#306CB2',
  green: '#43964E',
  pink: '#C74D88',
  ink: '#211916',
  blueTint: '#E8EFF8',
  greenTint: '#E7F2E8',
  pinkTint: '#F8E9F0',
  inkTint: '#ECE8E4',
  beige: '#EFE6D8',
  cream: '#FAF8F4',
  white: '#FFFFFF',
};

const svg = (body: string, bg: string) =>
  `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">` +
  `<rect width="320" height="200" fill="${bg}"/>${body}</svg>`;

/** 一覧：4色の葉（ロゴのモチーフ）と、空に手を伸ばす人 */
const hub = svg(
  `<circle cx="262" cy="46" r="24" fill="${C.pinkTint}"/>
  <circle cx="262" cy="46" r="13" fill="${C.white}" opacity="0.7"/>
  <path d="M0 150 Q80 124 160 142 T320 132 V200 H0Z" fill="${C.greenTint}"/>
  <path d="M0 172 Q110 150 210 168 T320 160 V200 H0Z" fill="#D3E6D6"/>
  <g transform="translate(112 94)">
    <ellipse rx="13" ry="30" transform="rotate(-45) translate(0 -30)" fill="${C.blue}"/>
    <ellipse rx="13" ry="30" transform="rotate(45) translate(0 -30)" fill="${C.green}"/>
    <ellipse rx="13" ry="30" transform="rotate(-135) translate(0 -30)" fill="${C.pink}"/>
    <ellipse rx="13" ry="30" transform="rotate(135) translate(0 -30)" fill="${C.ink}"/>
    <circle r="7" fill="${C.cream}"/>
  </g>
  <g transform="translate(214 66)">
    <path d="M-4 30 L-26 2" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
    <path d="M4 30 L24 4" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="0" cy="16" r="11" fill="${C.ink}"/>
    <path d="M-15 34 Q0 26 15 34 L18 82 H-18Z" fill="${C.blue}"/>
    <path d="M-8 82 L-10 112 M8 82 L10 112" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
  </g>
  <path d="M248 92 l4 -4 M256 100 l6 -1 M246 82 l1 -6" stroke="${C.pink}" stroke-width="3" stroke-linecap="round"/>`,
  C.cream,
);

/** ① 骨格・姿勢：まっすぐ伸びをする人と、姿勢のガイドライン */
const posture = svg(
  `<circle cx="64" cy="54" r="30" fill="${C.white}" opacity="0.6"/>
  <rect x="96" y="168" width="128" height="12" rx="6" fill="${C.beige}"/>
  <line x1="160" y1="22" x2="160" y2="170" stroke="${C.blue}" stroke-width="2" stroke-dasharray="3 7" stroke-linecap="round"/>
  <g transform="translate(160 40)">
    <path d="M-6 34 L-22 -6 M6 34 L22 -6" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="0" cy="20" r="13" fill="${C.ink}"/>
    <path d="M-17 40 Q0 32 17 40 L19 92 H-19Z" fill="${C.blue}"/>
    <path d="M-8 92 L-12 128 M8 92 L12 128" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>
  </g>
  <path d="M208 64 q10 -6 20 0 M214 78 q8 -5 16 0" stroke="${C.blue}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M104 70 q-10 -6 -20 0 M98 84 q-8 -5 -16 0" stroke="${C.blue}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="246" cy="146" r="16" fill="${C.green}" opacity="0.18"/>
  <circle cx="70" cy="150" r="10" fill="${C.pink}" opacity="0.22"/>`,
  C.blueTint,
);

/** ② 健康診断：検査票とグラフ、虫めがね */
const checkup = svg(
  `<circle cx="258" cy="48" r="30" fill="${C.white}" opacity="0.6"/>
  <rect x="88" y="30" width="122" height="148" rx="12" fill="${C.white}"/>
  <rect x="122" y="22" width="54" height="18" rx="6" fill="${C.green}"/>
  <path d="M106 64 h70 M106 80 h52 M106 96 h62" stroke="${C.inkTint}" stroke-width="7" stroke-linecap="round"/>
  <polyline points="108,150 128,134 148,140 170,118 192,124" fill="none" stroke="${C.green}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="128" cy="134" r="4.5" fill="${C.white}" stroke="${C.green}" stroke-width="3"/>
  <circle cx="170" cy="118" r="4.5" fill="${C.white}" stroke="${C.green}" stroke-width="3"/>
  <circle cx="192" cy="124" r="4.5" fill="${C.green}"/>
  <g transform="translate(214 116)">
    <circle r="26" fill="${C.white}" stroke="${C.ink}" stroke-width="7"/>
    <circle r="15" fill="${C.greenTint}"/>
    <path d="M19 19 L40 40" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>
  </g>
  <path d="M60 128 c0 -9 13 -9 13 0 c0 -9 13 -9 13 0 c0 10 -13 17 -13 20 c0 -3 -13 -10 -13 -20Z" fill="${C.pink}"/>`,
  C.greenTint,
);

/** ③ 不調のサイン：身体からの手紙（封筒と、葉・ハート） */
const signals = svg(
  `<circle cx="66" cy="50" r="28" fill="${C.white}" opacity="0.6"/>
  <g transform="rotate(-6 160 118)">
    <rect x="92" y="78" width="136" height="90" rx="10" fill="${C.white}"/>
    <path d="M96 84 L160 128 L224 84" fill="none" stroke="${C.pink}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M96 164 L142 124 M224 164 L178 124" stroke="${C.pinkTint}" stroke-width="5" stroke-linecap="round"/>
  </g>
  <path d="M150 64 c0 -10 15 -10 15 0 c0 -10 15 -10 15 0 c0 11 -15 19 -15 23 c0 -4 -15 -12 -15 -23Z" fill="${C.pink}"/>
  <path d="M206 52 q22 -24 46 -10 q-14 26 -46 10Z" fill="${C.green}"/>
  <path d="M206 52 q18 -8 34 -12" stroke="${C.white}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M110 46 q8 -6 16 0 t16 0" stroke="${C.blue}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M244 92 q8 -6 16 0 t16 0" stroke="${C.blue}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="262" cy="160" r="12" fill="${C.ink}" opacity="0.08"/>`,
  C.pinkTint,
);

/** ④ 未来の健康：朝日と、遠くへ続く道、芽吹く若葉 */
const future = svg(
  `<circle cx="228" cy="104" r="44" fill="${C.pinkTint}"/>
  <circle cx="228" cy="104" r="28" fill="${C.white}" opacity="0.8"/>
  <path d="M0 116 Q90 96 170 110 T320 104 V200 H0Z" fill="${C.greenTint}"/>
  <path d="M150 112 Q176 140 140 162 Q110 182 128 200 H196 Q170 178 196 160 Q226 138 168 112Z" fill="${C.beige}"/>
  <g transform="translate(176 96)">
    <circle cx="0" cy="-8" r="4" fill="${C.ink}"/>
    <path d="M-4 -3 h8 l1 10 h-10Z" fill="${C.ink}"/>
  </g>
  <g transform="translate(70 176)">
    <path d="M0 0 V-44" stroke="${C.green}" stroke-width="6" stroke-linecap="round"/>
    <path d="M0 -30 q-30 -6 -34 -30 q26 -2 34 30Z" fill="${C.green}"/>
    <path d="M0 -40 q26 -10 34 -34 q-28 0 -34 34Z" fill="#5BAA66"/>
    <ellipse cx="0" cy="2" rx="26" ry="6" fill="${C.ink}" opacity="0.12"/>
  </g>
  <path d="M262 40 l0 -10 M284 50 l7 -7 M240 50 l-7 -7" stroke="${C.pink}" stroke-width="3" stroke-linecap="round"/>`,
  C.inkTint,
);

/** 7日間のギフト：リボンのついた贈り物 */
const gift = svg(
  `<circle cx="160" cy="100" r="78" fill="${C.white}" opacity="0.55"/>
  <rect x="104" y="92" width="112" height="78" rx="8" fill="${C.green}"/>
  <rect x="96" y="72" width="128" height="28" rx="8" fill="#5BAA66"/>
  <rect x="150" y="72" width="20" height="98" fill="${C.pink}"/>
  <path d="M160 72 c-10 -26 -44 -26 -40 -6 c3 12 26 8 40 6Z M160 72 c10 -26 44 -26 40 -6 c-3 12 -26 8 -40 6Z" fill="${C.pink}"/>
  <path d="M74 60 l6 6 M246 56 l-6 8 M80 140 l-8 2 M248 138 l8 2" stroke="${C.blue}" stroke-width="3" stroke-linecap="round"/>`,
  C.greenTint,
);

export const illustrations = { hub, posture, checkup, signals, future, gift } as const;
export type IllustrationName = keyof typeof illustrations;
