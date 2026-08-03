#!/usr/bin/env python3
"""AI Kaigi: Claude と Codex の1対1討論を自動進行し、議事録を Markdown で保存する。

前提:
  - ローカル環境に `claude` (Claude Code CLI) と `codex` (Codex CLI) が
    インストール済み・ログイン済みであること。
  - 実行はこのリポジトリのクローン内(kaigi/ ディレクトリを含む場所)で行う。

使い方:
  python3 kaigi/run_kaigi.py "お題や悩みをここに書く"
  python3 kaigi/run_kaigi.py --topic-file notes.txt
  python3 kaigi/run_kaigi.py            # 引数なし → 複数行入力、Ctrl-D で確定
  python3 kaigi/run_kaigi.py "お題" --rounds 3
"""

import argparse
import datetime
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TRANSCRIPTS_DIR = REPO_ROOT / "kaigi" / "transcripts"

CHARTER = (
    "あなたは「AI会議」と呼ばれる、Claude と Codex による1対1の討論に参加しています。\n"
    "目的は、ユーザーが投げかけた悩み・アイデアをあらゆる角度から検討し、鋭く深掘りすることです。\n\n"
    "ルール:\n"
    "- 相手の意見にただ同意せず、見落としている前提・リスク・反例・別の切り口を積極的に指摘する。\n"
    "- 抽象論に逃げず、具体的な提案や次の一手にまで踏み込む。\n"
    "- 発言は要点を絞り、目安300〜600字程度で述べる。\n"
    "- これはテキストでの討論であり、コード編集やファイル操作、リポジトリ探索は不要。与えられた文脈だけで発言する。"
)


def die(msg: str) -> None:
    print(f"\n[エラー] {msg}", file=sys.stderr)
    sys.exit(1)


def call_claude(prompt: str, claude_cmd: str) -> str:
    try:
        result = subprocess.run(
            [claude_cmd, "-p", prompt, "--disallowedTools", "*", "--output-format", "text"],
            capture_output=True,
            text=True,
            timeout=600,
        )
    except FileNotFoundError:
        die(
            f"'{claude_cmd}' コマンドが見つかりません。"
            "Claude Code CLI がインストールされ PATH が通っているか確認してください。"
        )
    if result.returncode != 0:
        die(f"claude の実行に失敗しました:\n{result.stderr.strip()}")
    text = result.stdout.strip()
    if not text:
        die("claude から空の応答が返されました。`claude -p \"test\"` で単体動作を確認してください。")
    return text


def call_codex(prompt: str, codex_cmd: str) -> str:
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        result = subprocess.run(
            [
                codex_cmd,
                "exec",
                "--sandbox",
                "read-only",
                "--skip-git-repo-check",
                "--output-last-message",
                str(tmp_path),
                prompt,
            ],
            capture_output=True,
            text=True,
            timeout=900,
        )
    except FileNotFoundError:
        die(
            f"'{codex_cmd}' コマンドが見つかりません。"
            "Codex CLI がインストールされ PATH が通っているか確認してください。"
        )
    if result.returncode != 0:
        tmp_path.unlink(missing_ok=True)
        die(
            "codex の実行に失敗しました。CLIのバージョン差でフラグ名が変わっている可能性があります。"
            f"`{codex_cmd} exec --help` で確認してください。\n{result.stderr.strip()}"
        )
    text = tmp_path.read_text().strip()
    tmp_path.unlink(missing_ok=True)
    if not text:
        die("codex から空の応答が返されました。`codex exec \"test\"` で単体動作を確認してください。")
    return text


def render_transcript(entries: list[dict]) -> str:
    return "\n\n".join(f"[{e['label']}]\n{e['text']}" for e in entries)


def print_turn(label: str, text: str) -> None:
    print(f"\n=== {label} ===\n{text}\n")


def write_markdown(path: Path, topic: str, rounds: int, entries: list[dict], started: datetime.datetime) -> None:
    lines = [
        "# AI会議 議事録",
        "",
        f"- 日時: {started.strftime('%Y-%m-%d %H:%M:%S')}",
        f"- ラウンド数: {rounds}",
        "- 参加者: Claude, Codex",
        "",
        "## お題",
        "",
        topic.strip(),
        "",
    ]
    for e in entries:
        lines.append(f"## {e['label']}")
        lines.append("")
        lines.append(e["text"])
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Claude と Codex の1対1討論(AI会議)を自動進行する")
    parser.add_argument("topic", nargs="?", help="お題・悩み・アイデア(文字列で直接指定)")
    parser.add_argument("--topic-file", help="お題をファイルから読み込む")
    parser.add_argument("--rounds", type=int, default=2, help="オープニング後の往復ラウンド数(既定: 2)")
    parser.add_argument("--claude-cmd", default="claude", help="claude コマンド名/パス(既定: claude)")
    parser.add_argument("--codex-cmd", default="codex", help="codex コマンド名/パス(既定: codex)")
    parser.add_argument("--out", help="議事録の保存先パス(既定: kaigi/transcripts/<timestamp>.md)")
    args = parser.parse_args()

    if args.topic_file:
        topic = Path(args.topic_file).read_text(encoding="utf-8")
    elif args.topic:
        topic = args.topic
    else:
        print("お題・悩み・アイデアを入力してください(複数行OK、入力し終わったら Ctrl-D):")
        topic = sys.stdin.read()

    topic = topic.strip()
    if not topic:
        die("お題が空です。")

    started = datetime.datetime.now()
    TRANSCRIPTS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = Path(args.out) if args.out else TRANSCRIPTS_DIR / f"{started.strftime('%Y%m%d-%H%M%S')}.md"

    entries: list[dict] = []

    def add(label: str, text: str) -> None:
        entries.append({"label": label, "text": text})
        print_turn(label, text)
        write_markdown(out_path, topic, args.rounds, entries, started)

    print(f"AI会議を開始します。お題:\n{topic}\n")

    # オープニング
    claude_opening = call_claude(
        f"{CHARTER}\n\n【お題】\n{topic}\n\n---\n"
        "あなたが最初の発言者です。このお題について、初見の考え・論点整理・気になるリスクや前提を述べてください。",
        args.claude_cmd,
    )
    add("Claude (オープニング)", claude_opening)

    codex_opening = call_codex(
        f"{CHARTER}\n\n【お題】\n{topic}\n\n【Claudeの発言】\n{claude_opening}\n\n---\n"
        "上記を踏まえて、あなたの視点(技術・実務・リスクの観点を中心に)で意見を述べてください。"
        "同意するだけでなく鋭く検証してください。",
        args.codex_cmd,
    )
    add("Codex (オープニング)", codex_opening)

    # 往復ラウンド
    for r in range(1, args.rounds + 1):
        history = render_transcript(entries)
        claude_text = call_claude(
            f"{CHARTER}\n\n【お題】\n{topic}\n\n【これまでの議論】\n{history}\n\n---\n"
            "直前のCodexの発言を踏まえて、さらに深掘りしてください(反論・新しい視点・妥協案など)。",
            args.claude_cmd,
        )
        add(f"Claude (ラウンド{r})", claude_text)

        history = render_transcript(entries)
        codex_text = call_codex(
            f"{CHARTER}\n\n【お題】\n{topic}\n\n【これまでの議論】\n{history}\n\n---\n"
            "直前のClaudeの発言を踏まえて、さらに深掘りしてください(反論・新しい視点・妥協案など)。",
            args.codex_cmd,
        )
        add(f"Codex (ラウンド{r})", codex_text)

    # 結論
    history = render_transcript(entries)
    synthesis = call_claude(
        f"{CHARTER}\n\n【お題】\n{topic}\n\n【全議論】\n{history}\n\n---\n"
        "これで議論は終了です。司会として以下を簡潔にまとめてください:\n"
        "1. 両者が一致した点\n"
        "2. 意見が分かれた点・トレードオフ\n"
        "3. 結論のたたき台\n"
        "4. 次に取るべき具体的なアクション(箇条書き)",
        args.claude_cmd,
    )
    add("結論・まとめ (Claude)", synthesis)

    print(f"議事録を保存しました: {out_path}")


if __name__ == "__main__":
    main()
