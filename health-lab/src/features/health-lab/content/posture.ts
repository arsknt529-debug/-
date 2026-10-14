import { draft } from './draft';
import type { CopyDict, Question } from './types';

/** ① 骨格・姿勢を知る — 質問定義（指示書 4章の8問） */
export const postureQuestions: Question[] = [
  {
    id: 'q1_sitting',
    text: '長時間座った後、どんな姿勢になりやすいですか？',
    options: [
      { id: 'rounded', label: '背中が丸くなりやすい' },
      { id: 'arched', label: '腰を反らせがち' },
      { id: 'tilted', label: '左右どちらかに傾きやすい' },
      { id: 'none', label: '特に気にならない' },
    ],
  },
  {
    id: 'q2_fatigue',
    text: '普段、どこに疲れを感じやすいですか？',
    options: [
      { id: 'neck_shoulder', label: '首・肩' },
      { id: 'lower_back', label: '腰' },
      { id: 'hip_leg', label: '股関節・脚' },
      { id: 'none', label: '特に感じない' },
    ],
  },
  {
    id: 'q3_weight',
    text: '立っているとき、体重のかけ方は？',
    options: [
      { id: 'one_leg', label: '片脚に体重を乗せがち' },
      { id: 'toes', label: 'つま先側に乗りやすい' },
      { id: 'heels', label: 'かかと側に乗りやすい' },
      { id: 'unknown', label: 'よくわからない' },
    ],
  },
  {
    id: 'q4_mirror',
    text: '鏡で見たときに気になることは？',
    options: [
      { id: 'shoulder_height', label: '肩の高さの左右差' },
      { id: 'head_forward', label: '頭が前に出ている' },
      { id: 'belly', label: 'お腹が前に出て見える' },
      { id: 'none', label: '特にない・わからない' },
    ],
  },
  {
    id: 'q5_chair',
    text: '椅子に座るときの習慣は？',
    options: [
      { id: 'cross_legs', label: '脚を組むことが多い' },
      { id: 'shallow', label: '浅く腰かける' },
      { id: 'lean_back', label: '背もたれに大きく寄りかかる' },
      { id: 'none', label: '特に決まった習慣はない' },
    ],
  },
  {
    id: 'q6_arms',
    text: '両腕をゆっくり真上へ上げると？',
    note: '任意の確認です。痛みがあるときや不安なときは、試さずに「痛みがある・試せない」を選んでください。',
    options: [
      { id: 'easy', label: '無理なく上がる' },
      { id: 'stiff', label: '肩まわりが硬く感じる' },
      { id: 'asymmetric', label: '左右で上げやすさが違う' },
      { id: 'pain', label: '痛みがある・試せない' },
    ],
  },
  {
    id: 'q7_wall',
    text: '安全な場所で壁に背を向けて立つと？',
    note: '任意の確認です。ふらつきや痛みがあるときは、試さずに「わからない・試せない」を選んでください。',
    options: [
      { id: 'natural', label: '自然に後頭部と背中が近づく' },
      { id: 'head_off', label: '頭が壁から離れやすい' },
      { id: 'arch', label: '腰を大きく反らせたくなる' },
      { id: 'unknown', label: 'わからない・試せない' },
    ],
  },
  {
    id: 'q8_goal',
    text: '今日、一番知りたいことは？',
    options: [
      { id: 'posture_tips', label: '姿勢を整えるヒント' },
      { id: 'burden', label: '肩や腰への負担' },
      { id: 'start_exercise', label: '運動の始め方' },
      { id: 'overall', label: '自分の身体の特徴全般' },
    ],
  },
];

/**
 * 結果文言（すべて専門家監修前の仮原稿）。
 * 回答内容から直接言えることだけを書く。猫背・反り腰・骨盤のゆがみ等は断定しない。
 */
export const postureCopy: CopyDict = {
  // DISCOVERY — 回答をそのまま言い換えたもの
  'posture.discovery.q1_sitting.rounded': draft('座った後、背中が丸くなりやすいと感じているようです。'),
  'posture.discovery.q1_sitting.arched': draft('座った後、腰を反らせがちだと感じているようです。'),
  'posture.discovery.q1_sitting.tilted': draft('座った後、左右どちらかに傾きやすいと感じているようです。'),
  'posture.discovery.q2_fatigue.neck_shoulder': draft('首・肩まわりへの負担が気になっているようです。'),
  'posture.discovery.q2_fatigue.lower_back': draft('腰まわりに疲れを感じやすいようです。'),
  'posture.discovery.q2_fatigue.hip_leg': draft('股関節や脚に疲れを感じやすいようです。'),
  'posture.discovery.q3_weight.one_leg': draft('立っているとき、片脚に体重を乗せることが多いようです。'),
  'posture.discovery.q3_weight.toes': draft('立っているとき、つま先側に体重が乗りやすいと感じているようです。'),
  'posture.discovery.q3_weight.heels': draft('立っているとき、かかと側に体重が乗りやすいと感じているようです。'),
  'posture.discovery.q4_mirror.shoulder_height': draft('鏡で見たとき、肩の高さの左右差が気になっているようです。'),
  'posture.discovery.q4_mirror.head_forward': draft('鏡で見たとき、頭が前に出ているように見えることが気になっているようです。'),
  'posture.discovery.q4_mirror.belly': draft('鏡で見たとき、お腹が前に出て見えることが気になっているようです。'),
  'posture.discovery.q5_chair.cross_legs': draft('椅子では、脚を組んで座ることが多いようです。'),
  'posture.discovery.q5_chair.shallow': draft('椅子では、浅く腰かけることが多いようです。'),
  'posture.discovery.q5_chair.lean_back': draft('椅子では、背もたれに大きく寄りかかることが多いようです。'),
  'posture.discovery.q6_arms.easy': draft('両腕は無理なく上がったようです。'),
  'posture.discovery.q6_arms.stiff': draft('腕を上げたとき、肩まわりの硬さを感じたようです。'),
  'posture.discovery.q6_arms.asymmetric': draft('腕の上げやすさに、左右で違いを感じたようです。'),
  'posture.discovery.q7_wall.natural': draft('壁を背にして立ったとき、自然に後頭部と背中が近づいたようです。'),
  'posture.discovery.q7_wall.head_off': draft('壁を背にして立ったとき、頭が壁から離れやすいと感じたようです。'),
  'posture.discovery.q7_wall.arch': draft('壁を背にして立ったとき、腰を大きく反らせたくなる感覚があったようです。'),
  'posture.discovery.none': draft(
    '今回の回答では、特に気になるところは挙がりませんでした。今の身体の使い方を、これからも大切にしていきましょう。',
  ),

  // UNDERSTANDING — 身体をもっと知るヒント
  'posture.understanding.sitting': draft(
    '座り方や座っている時間は、日々の身体の感じ方と関わることがあります。長時間同じ姿勢を続けていないか、日常生活を振り返ってみましょう。',
  ),
  'posture.understanding.standing': draft(
    '立ち方のくせは、自分ではなかなか気づきにくいものです。電車を待つときや歯みがきのときなど、立っている時間の体重のかけ方を意識してみましょう。',
  ),
  'posture.understanding.goal.posture_tips': draft(
    '姿勢を整える第一歩は、同じ姿勢が長く続いていないかに気づくことです。こまめに姿勢を変えることから始めてみましょう。',
  ),
  'posture.understanding.goal.burden': draft(
    '肩や腰の疲れには、日々の過ごし方や身体の使い方など、さまざまなことが関わります。どんな場面で疲れを感じやすいか、メモしてみると気づきにつながります。',
  ),
  'posture.understanding.goal.start_exercise': draft(
    '運動は、無理なく続けられることから始めるのがおすすめです。まずは短い時間、身体を動かす習慣から始めてみましょう。',
  ),
  'posture.understanding.goal.overall': draft(
    '今回の回答は、あなたの身体の使い方を知る手がかりです。気になったことは、トレーナーに気軽に質問してみてください。',
  ),
  'posture.understanding.scope': draft(
    'このチェックは回答をもとにしたふり返りで、姿勢や骨格の状態を判定するものではありません。',
  ),

  // SMALL GIFT — 今日からできる小さな一歩
  'posture.gift.rest': draft('今日は無理に身体を動かさず、楽な姿勢で休む時間を作ってみませんか？'),
  'posture.gift.stand_up': draft('今日は一度、席から立って身体を動かしてみませんか？'),
  'posture.gift.both_feet': draft('今日は、脚を組んでいることや片脚に体重を乗せていることに気づいたら、そっと両足で床をとらえてみませんか？'),
  'posture.gift.walk_hourly': draft('今日は1時間に一度、立ち上がって少し歩いてみませんか？'),
  'posture.gift.walk_longer': draft('今日は、いつもより少しだけ長く歩いてみませんか？'),
  'posture.gift.breathe': draft('今日は、ゆっくり深呼吸をしながら、自分の姿勢に目を向ける時間を作ってみませんか？'),

  // SAFETY
  'posture.safety.pain': draft(
    '痛みがあるときは、無理に身体を動かさないでください。痛みが続く場合や強くなる場合は、医療機関にご相談ください。',
  ),
  'posture.footnote': draft('この結果は医療診断ではありません。痛みやしびれが続く場合は、医療機関にご相談ください。'),
};
