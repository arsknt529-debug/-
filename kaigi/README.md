# AI会議 (Claude / Codex / Gemini 討論ツール)

お題・悩み・アイデアを1つ投げると、複数のAI(既定では Claude・Codex・Gemini)が
順番に討論し、最後に結論・次のアクションをまとめて Markdown の議事録として保存するスクリプト。

## 前提条件

ローカル端末(このスクリプトを実行するマシン)に、参加させたいAIのCLIが
インストール・ログイン済みであること。

- [Claude Code CLI](https://code.claude.com/docs) — `claude` コマンドが PATH に通っている
- [Codex CLI](https://developers.openai.com/codex) — `codex` コマンドが PATH に通っている
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) — `gemini` コマンドが PATH に通っている

それぞれ単体で動作するか事前に確認しておくと安全:

```bash
claude -p "こんにちは、動作確認です"
codex exec "こんにちは、動作確認です"
gemini -p "こんにちは、動作確認です"
```

## 使い方

```bash
# お題を直接指定(既定: Claude → Codex → Gemini の順で討論)
python3 kaigi/run_kaigi.py "転職すべきか今の会社に残るべきか悩んでいる"

# ファイルから読み込む(長文の悩みを事前にまとめておく場合)
python3 kaigi/run_kaigi.py --topic-file my_notes.txt

# 引数なしで実行 → 複数行入力、Ctrl-D で確定
python3 kaigi/run_kaigi.py

# 討論のラウンド数を増やす(既定は2往復)
python3 kaigi/run_kaigi.py "新規事業のアイデア検証" --rounds 4

# 参加するAIを絞る/順番を変える(先頭が司会役になる)
python3 kaigi/run_kaigi.py "お題" --agents claude,gemini
python3 kaigi/run_kaigi.py "お題" --agents gemini,codex,claude
```

実行すると、参加者が指定順にオープニング発言 → 指定ラウンド数分の討論 →
先頭の参加者による結論・まとめ、の順にターミナルへ逐次表示され、
`kaigi/transcripts/<日時>.md` に議事録として保存される。

## 討論の進め方

- 参加AIは全員「同業でまもなく上場するであろう、本気でこの事業を潰しにかかる
  競合他社」になりきって発言するよう指示されている。馴れ合いの同意・忖度は禁止で、
  弱点・穴・勝ち筋のなさを容赦なく突く前提で討論が進む。
- 各AIは自分より前に発言した参加者の発言をすべて読んだ上で発言する
  (2番目以降の参加者は、それまでの全発言を踏まえて意見を述べる)。
- Codex は `codex exec --sandbox read-only`、Gemini は `gemini --approval-mode plan`
  で実行しており、どちらもファイル編集やリポジトリ探索は行わずテキストでの発言のみを行う。
- 結論のまとめ(競合視点から突かれた弱点・対立点・それでも通すべき結論・次のアクション)は
  `--agents` で指定した先頭のAI(既定では Claude)が司会役として最後に生成する。

## 事業コンテキスト(business.md)

会議で扱ってよい話題を、自分の事業だけに固定できる。

```bash
cp kaigi/business.md.example kaigi/business.md
# kaigi/business.md を編集して、事業名・業種・目標・現在の課題などを記入する
```

`kaigi/business.md` が存在すれば、その内容が「絶対厳守の前提」として毎回の
発言プロンプトに自動で注入され、これ以外の話題(事業と無関係な一般論・雑談)は
扱わないよう全参加AIに指示される。ファイルが無い/空の場合は警告が出て、
事業スコープの制約なしで進行する。

このファイルは `.gitignore` 対象(`kaigi/business.md`)なのでリポジトリには
コミットされない。Gemini アプリ等にこれまで貯めてきたプロジェクトの経緯・メモ・
資料がある場合は、それをコピーしてこのファイルに貼り付ければそのまま
コンテキストとして使われる(このツール自体はGeminiアカウントの中身を
自動で読みに行くことはできないため、手動での貼り付けが必要)。

## 議事録の扱いについて

`kaigi/transcripts/*.md` は個人的な悩み・アイデアを含みうるため `.gitignore` で
リポジトリへのコミット対象から除外している。手元に残したい場合はそのままローカルに
置いておけばよく、あえて履歴として残したい場合は `.gitignore` の該当行を外すこと。

## トラブルシューティング

- `claude` / `codex` / `gemini` コマンドが見つからない: PATH を確認するか、
  それぞれの CLI を再インストールする。
- 実行時にフラグ関連のエラーが出る: CLI のバージョンによってオプション名が
  変わっている可能性がある。`codex exec --help` / `gemini --help` で現在の
  オプションを確認し、`run_kaigi.py` 内の該当する `call_*()` 関数の
  コマンドライン引数を合わせて修正する。
- 応答が空になる: それぞれのCLI単体(`claude -p "test"` / `codex exec "test"` /
  `gemini -p "test"`)が正常に動作するか確認する。
