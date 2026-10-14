import { redirect } from 'next/navigation';

// LIFF エンドポイント（/liff）の入口。単体動作用。
// 既存の fitness-line-system に /liff がある場合は、そちらを優先し、このファイルは組み込まない。
export default function LiffEntry() {
  redirect('/health-lab');
}
