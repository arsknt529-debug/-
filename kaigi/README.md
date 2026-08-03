# AI会議 (Claude ⇄ Codex 討論ツール)

お題・悩み・アイデアを1つ投げると、Claude と Codex が1対1で討論し、
最後に結論・次のアクションをまとめて Markdown の議事録として保存するスクリプト。

## 前提条件

ローカル端末(このスクリプトを実行するマシン)に以下がインストール・ログイン済みであること。

- [Claude Code CLI](https://code.claude.com/docs) — `claude` コマンドが PATH に通っている
- [Codex CLI](https://developers.openai.com/codex) — `codex` コマンドが PATH に通っている

それぞれ単体で動作するか事前に確認しておくと安全:

```bash
claude -p "こんにちは、動作確認です"
codex exec "こんにちは、動作確認です"
```

## 使い方

```bash
# お題を直接指定
python3 kaigi/run_kaigi.py "転職すべきか今の会社に残るべきか悩んでいる"

# ファイルから読み込む(長文の悩みを事前にまとめておく場合)
python3 kaigi/run_kaigi.py --topic-file my_notes.txt

# 引数なしで実行 → 複数行入力、Ctrl-D で確定
python3 kaigi/run_kaigi.py

# 討論のラウンド数を増やす(既定は2往復)
python3 kaigi/run_kaigi.py "新規事業のアイデア検証" --rounds 4
```

実行すると、Claude のオープニング発言 → Codex のオープニング発言 → 指定ラウンド数分の
往復討論 → Claude による結論・まとめ、の順にターミナルへ逐次表示され、
`kaigi/transcripts/<日時>.md` に議事録として保存される。

## 討論の進め方

- Claude と Codex はどちらも「ただ同意するのではなく、前提・リスク・別の切り口を
  積極的に指摘する」よう指示されている。
- Codex 側は `codex exec --sandbox read-only` で実行しており、ファイル編集や
  リポジトリ探索は行わずテキストでの発言のみを行う。
- 結論のまとめ(一致点・対立点・次のアクション)は最後に Claude が司会役として生成する。

## 議事録の扱いについて

`kaigi/transcripts/*.md` は個人的な悩み・アイデアを含みうるため `.gitignore` で
リポジトリへのコミット対象から除外している。手元に残したい場合はそのままローカルに
置いておけばよく、あえて履歴として残したい場合は `.gitignore` の該当行を外すこと。

## トラブルシューティング

- `claude` / `codex` コマンドが見つからない: PATH を確認するか、それぞれの CLI を
  再インストールする。
- `codex` 実行時にフラグ関連のエラーが出る: CLI のバージョンによってオプション名が
  変わっている可能性がある。`codex exec --help` で現在のオプションを確認し、
  `run_kaigi.py` 内の `call_codex()` のコマンドライン引数を合わせて修正する。
- 応答が空になる: それぞれのCLI単体(`claude -p "test"` / `codex exec "test"`)が
  正常に動作するか確認する。
