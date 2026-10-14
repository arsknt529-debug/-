import { draft } from './draft';
import type { CopyDict } from './types';

export const commonCopy: CopyDict = {
  'common.disclaimer.title': draft('ご利用の前に'),
  'common.disclaimer.notDiagnosis': draft('セルフチェックは医療診断ではありません。'),
  'common.disclaimer.consult': draft('心配な症状がある場合は、医療機関にご相談ください。'),
  'common.disclaimer.followDoctor': draft('医療機関から受診の指示がある場合は、その指示を優先してください。'),
  'common.disclaimer.emergency': draft('緊急の症状がある場合は、ためらわずに119番などの救急対応を優先してください。'),
  'common.privacy': draft('回答はこの端末の画面の中だけで扱い、サーバーには保存・送信しません。画面を閉じると消えます。'),
  'common.closing': draft('昨日より少し、自分の身体を知れましたか。'),
};
