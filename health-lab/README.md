# XCOUNT HEALTH LAB（4つの健康セルフチェック）

「私の身体を知る」と4つのセルフチェック（骨格・姿勢／健康診断／不調のサイン／未来の健康）の実装です。
設計の背景は [`../docs/health-lab/DESIGN.md`](../docs/health-lab/DESIGN.md) を参照してください。

> **ステータス：未デプロイ。** 本番への反映・LINE 設定の変更は行っていません。
> 文言はすべて専門家監修前の仮原稿です。「不調のサインを知る」は機能フラグで非公開になっています。

## 特徴

- Next.js（App Router）＋ React。すべてブラウザ内で完結し、**回答をサーバーに送信・保存しない**
- DB・API・認証・LINE プロフィール取得なし。外部への通信もなし（E2E テストで確認）
- 質問・結果文言・判定条件はデータとして `content/` に分離し、監修状態（draft / reviewed）を管理
- 結果はルールベース（AI・確率計算・スコアなし）
- XCOUNT ロゴの4色をデザイントークン化（CARD 01 青／02 緑／03 ピンク／04 黒）

## 動かし方

```bash
cd health-lab
npm install
npm run dev            # http://localhost:3000/health-lab
```

「不調のサイン」を表示して確認する場合：

```bash
NEXT_PUBLIC_HEALTHLAB_SIGNALS_ENABLED=true npm run dev
```

## テスト

```bash
npm run typecheck      # 型チェック
npm test               # 単体テスト（判定ロジック・入力チェック・禁止表現・監修ゲート）
npm run test:e2e       # E2E（iPhone 表示、全フロー、外部通信なし、アクセシビリティ）
npm run copy:export    # 監修依頼用の文言一覧 → copy-export/health-lab-copy.md
```

## 環境変数（すべて任意）

| 変数 | 既定 | 説明 |
|---|---|---|
| `NEXT_PUBLIC_HEALTHLAB_SIGNALS_ENABLED` | 未設定（非公開） | `true` で「不調のサイン」を表示。本番で有効にするのは医療監修の完了後のみ |
| `NEXT_PUBLIC_LIFF_ID` | 未設定 | 設定すると LIFF SDK を読み込んで `liff.init()` だけ行う。プロフィール等は取得しない |
| `NEXT_PUBLIC_HEALTHLAB_SHOW_DRAFT_BADGE` | 未設定 | `true` で「文言は監修前の仮原稿です」バッジを表示（プレビュー環境向け） |

## 構成

```
src/
  app/
    health-lab/            ルート（一覧・4コンテンツ）※ fitness-line-system に移植する部分
    layout.tsx, page.tsx   単体動作用（移植しない）
    liff/page.tsx          単体動作用の /liff 入口（既存に /liff があれば移植しない）
  features/health-lab/     機能本体（このフォルダごと移植する）
    content/               質問・選択肢・文言・検査項目（監修対象）
    engine/                結果生成のルール（純粋関数・単体テスト対象）
    components/            画面コンポーネント
    lib/                   機能フラグ・LIFF・7日間ギフトの端末内保存
    styles/health-lab.css  デザイントークンとスタイル（.hl 配下に限定）
tests/
  unit/                    Vitest
  e2e/                     Playwright
```

## fitness-line-system への組み込み手順（承認後）

既存リポジトリが Next.js App Router の場合：

1. `src/features/health-lab/` をそのままコピーする（パスエイリアス `@/` が `src/` を指す前提。異なる場合は import を調整）
2. `src/app/health-lab/` をコピーする（既存のルートレイアウトの下に入る。`layout.tsx` は既存に影響しない）
3. 既存に `/liff` がない場合のみ、`src/app/liff/page.tsx` を追加するか、LIFF のエンドポイントを `/health-lab` に向ける
4. `next.config` に `/health-lab/:path*` の `X-Robots-Tag: noindex` と `Referrer-Policy: no-referrer` ヘッダーを追加
5. 既存にテスト環境がなければ、`vitest` と `@playwright/test` を devDependencies に追加し、`tests/` をコピー
6. Vercel のプレビュー環境で動作確認 → 承認後に本番へ

Pages Router の場合は、`src/app/health-lab/*/page.tsx` の中身（各 `*App` コンポーネントの呼び出し）を `pages/health-lab/*.tsx` に置き換え、CSS は `_app.tsx` で読み込みます。コンポーネント・ロジックはそのまま使えます。

## リンク先の設定

結果画面の導線（60秒セルフケア動画、トレーナーへの質問、無料姿勢チェックの案内など）は
`src/features/health-lab/content/links.ts` で設定します。未設定（`null`）の項目は「準備中」と表示されます。
