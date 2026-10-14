import { draft } from './draft';
import type { CopyDict, Question } from './types';

/** ④ 未来の健康を考える */

export type DomainId = 'move' | 'food' | 'sleep' | 'mind' | 'connect';

export const domains: { id: DomainId; name: string }[] = [
  { id: 'move', name: '身体を動かす' },
  { id: 'food', name: '身体をつくる食事' },
  { id: 'sleep', name: '睡眠と回復' },
  { id: 'mind', name: '心の余白' },
  { id: 'connect', name: '人とのつながり' },
];

/**
 * 選択肢ごとの扱い
 *  cared   … 大切にできている
 *  partial … ときどき（どちらとも言える）
 *  room    … 見直す余地がある
 *  neutral … わからない・答えたくない（集計に含めない）
 */
export type Tone = 'cared' | 'partial' | 'room' | 'neutral';

export interface FutureQuestion extends Question {
  domain: DomainId;
  tones: Record<string, Tone>;
}

const fourScale = (labels: [string, string, string, string], neutralId = 'unknown'): Pick<FutureQuestion, 'options' | 'tones'> => ({
  options: [
    { id: 'a', label: labels[0] },
    { id: 'b', label: labels[1] },
    { id: 'c', label: labels[2] },
    { id: neutralId, label: labels[3] },
  ],
  tones: { a: 'cared', b: 'partial', c: 'room', [neutralId]: 'neutral' },
});

export const futureQuestions: FutureQuestion[] = [
  { id: 'f1', domain: 'move', text: '普段、歩いたり身体を動かしたりする機会はありますか？', ...fourScale(['ほぼ毎日ある', '週に数日ある', 'あまりない', 'わからない']) },
  { id: 'f2', domain: 'move', text: '長い時間座っているとき、途中で身体を動かしていますか？', ...fourScale(['よく動いている', 'ときどき動く', 'ほとんど動かない', '座る時間が少ない・不明']) },
  { id: 'f3', domain: 'food', text: '普段の食事で、野菜やたんぱく質などのバランスを意識していますか？', ...fourScale(['よく意識している', 'ときどき意識する', 'あまり意識していない', 'わからない']) },
  { id: 'f4', domain: 'food', text: '忙しい日でも、自分に必要な食事を取れていますか？', ...fourScale(['おおむね取れている', '日によって異なる', '取れない日が多い', 'わからない']) },
  { id: 'f5', domain: 'sleep', text: '最近、睡眠を十分に取れていると感じますか？', ...fourScale(['十分に取れている', '時々足りない', '足りない日が多い', 'わからない']) },
  { id: 'f6', domain: 'sleep', text: '朝起きたとき、休めた感覚はありますか？', ...fourScale(['多くの日にある', 'ときどきある', 'ほとんどない', 'わからない']) },
  { id: 'f7', domain: 'mind', text: '気持ちが張りつめたとき、落ち着く時間を取れていますか？', ...fourScale(['取れている', 'ときどき取れる', 'ほとんど取れない', 'わからない']) },
  { id: 'f8', domain: 'mind', text: '自分の好きなことをする時間はありますか？', ...fourScale(['定期的にある', 'たまにある', 'ほとんどない', 'わからない']) },
  { id: 'f9', domain: 'connect', text: '大切な人と、心地よく過ごせる時間はありますか？', ...fourScale(['十分にある', 'ときどきある', 'あまりない', '答えたくない'], 'skip') },
  { id: 'f10', domain: 'connect', text: '困ったときに相談できる相手や場所はありますか？', ...fourScale(['ある', '少しある', '今は思い当たらない', '答えたくない'], 'skip') },
];

/** 7日間のギフト — 自分への小さな約束 */
export const promises: { id: string; domain: DomainId; text: string }[] = [
  { id: 'walk5', domain: 'move', text: 'いつもより5分長く歩く' },
  { id: 'food1', domain: 'food', text: '1日の食事で、野菜やたんぱく質を意識する機会を1つ増やす' },
  { id: 'calm10', domain: 'sleep', text: '寝る前に10分、落ち着ける時間を作る' },
  { id: 'me5', domain: 'mind', text: '1日5分、自分のための時間を作る' },
  { id: 'message', domain: 'connect', text: '大切な人に短いメッセージを送る' },
];

export const futureCopy: CopyDict = {
  'future.cared.move': draft('日々の中で、身体を動かす機会を大切にできているようです。'),
  'future.cared.food': draft('自分の身体をつくる食事を、意識できているようです。'),
  'future.cared.sleep': draft('睡眠と休息の時間を、大切にできているようです。'),
  'future.cared.mind': draft('気持ちを落ち着ける時間や、好きなことをする時間を持てているようです。'),
  'future.cared.connect': draft('大切な人や、頼れる人とのつながりを持てているようです。'),
  'future.room.move': draft('身体を動かす時間を、少しずつ増やせる余地がありそうです。'),
  'future.room.food': draft('忙しい日の食事を、少し見直せる余地がありそうです。'),
  'future.room.sleep': draft('睡眠や休息の取り方を、見直せる余地がありそうです。'),
  'future.room.mind': draft('自分のための時間を、もう少し持てる余地がありそうです。'),
  'future.room.connect': draft('人とのつながりを感じられる時間を、少し増やせる余地がありそうです。'),
  'future.skipped': draft('答えなかった・わからなかった領域は、今回は結果に含めていません。'),
  'future.none_cared': draft('今回は「大切にできている」と言える領域が見つかりませんでした。それでも、ここで立ち止まって振り返れたこと自体が、未来の自分への大切な一歩です。'),
  'future.none_room': draft('今の生活の中で、たくさんの習慣を大切にできているようです。その習慣を、これからも続けていきましょう。'),
  'future.all_skipped': draft('今回は「わからない」「答えたくない」を中心に選んでくれました。答えにくいことがあっても大丈夫です。気が向いたときに、また振り返ってみましょう。'),
  'future.understanding': draft('これは点数をつけたり、将来を予測したりするものではありません。あなたが選んだ回答をもとに、5つの生活習慣を整理したものです。'),
  'future.footnote': draft('この結果は医療診断ではありません。心配な症状がある場合は、医療機関にご相談ください。'),
};
