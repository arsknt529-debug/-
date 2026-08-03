#!/usr/bin/env python3
"""AI Kaigi: 複数のAI(Claude / Codex / Gemini)による討論を自動進行し、
議事録を Markdown で保存する。

前提:
  - ローカル環境に参加させたいAIのCLIがインストール・ログイン済みであること。
      Claude Code CLI: `claude`
      Codex CLI:       `codex`
      Gemini CLI:      `gemini`
  - 実行はこのリポジトリのクローン内(kaigi/ ディレクトリを含む場所)で行う。

使い方:
  python3 kaigi/run_kaigi.py "お題や悩みをここに書く"
  python3 kaigi/run_kaigi.py --topic-file notes.txt
  python3 kaigi/run_kaigi.py            # 引数なし → 複数行入力、Ctrl-D で確定
  python3 kaigi/run_kaigi.py "お題" --rounds 3
  python3 kaigi/run_kaigi.py "お題" --agents claude,codex,gemini   # 既定
  python3 kaigi/run_kaigi.py "お題" --agents claude,gemini        # 2者だけでもOK
"""

import argparse
import datetime
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TRANSCRIPTS_DIR = REPO_ROOT / "kaigi" / "transcripts"
BUSINESS_FILE_DEFAULT = REPO_ROOT / "kaigi" / "business.md"

DISPLAY_NAMES = {
    "claude": "Claude",
    "codex": "Codex",
    "gemini": "Gemini",
}


def die(msg: str) -> None:
    print(f"\n[エラー] {msg}", file=sys.stderr)
    sys.exit(1)


def charter(display_names: list[str], business_context: str | None) -> str:
    names = "、".join(display_names)
    parts = []
    if business_context:
        parts.append(
            "【事業コンテキスト(最優先・絶対厳守)】\n"
            f"{business_context}\n\n"
            "この会議で扱ってよいのは上記の事業に関することだけである。"
            "上記に関係しない一般論・雑談・無関係な話題は一切扱わないこと。"
        )
    parts.append(
        f"あなたは「AI会議」と呼ばれる、{names} による複数AI討論に参加しています。\n"
        "目的は、経営者であるユーザーが投げかけたアイデア・課題を、一切の妥協なく検証することです。\n\n"
        "ルール:\n"
        "- 各参加者は、同業でまもなく上場するであろう、本気でこの事業を潰しにかかる競合他社になりきって発言する。\n"
        "  馴れ合いの同意・気遣い・忖度は一切禁止。弱点・穴・勝ち筋のなさを容赦なく突く。\n"
        "- 抽象論に逃げず、具体的な数字・実行可能性・タイムラインの観点まで踏み込む。\n"
        "- 発言は要点を絞り、目安300〜600字程度で述べる。\n"
        "- これはテキストでの討論であり、コード編集やファイル操作、リポジトリ探索は不要。与えられた文脈だけで発言する。"
    )
    return "\n\n".join(parts)


def call_claude(prompt: str, cmd: str) -> str:
    try:
        result = subprocess.run(
            [cmd, "-p", prompt, "--disallowedTools", "*", "--output-format", "text"],
            capture_output=True,
            text=True,
            timeout=600,
        )
    except FileNotFoundError:
        die(f"'{cmd}' コマンドが見つかりません。Claude Code CLI がインストールされ PATH が通っているか確認してください。")
    if result.returncode != 0:
        die(f"claude の実行に失敗しました:\n{result.stderr.strip()}")
    text = result.stdout.strip()
    if not text:
        die("claude から空の応答が返されました。`claude -p \"test\"` で単体動作を確認してください。")
    return text


def call_codex(prompt: str, cmd: str) -> str:
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        result = subprocess.run(
            [
                cmd,
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
        die(f"'{cmd}' コマンドが見つかりません。Codex CLI がインストールされ PATH が通っているか確認してください。")
    if result.returncode != 0:
        tmp_path.unlink(missing_ok=True)
        die(
            "codex の実行に失敗しました。CLIのバージョン差でフラグ名が変わっている可能性があります。"
            f"`{cmd} exec --help` で確認してください。\n{result.stderr.strip()}"
        )
    text = tmp_path.read_text().strip()
    tmp_path.unlink(missing_ok=True)
    if not text:
        die("codex から空の応答が返されました。`codex exec \"test\"` で単体動作を確認してください。")
    return text


def call_gemini(prompt: str, cmd: str) -> str:
    try:
        result = subprocess.run(
            [cmd, "-p", prompt, "--approval-mode", "plan", "--output-format", "text"],
            capture_output=True,
            text=True,
            timeout=600,
        )
    except FileNotFoundError:
        die(f"'{cmd}' コマンドが見つかりません。Gemini CLI がインストールされ PATH が通っているか確認してください。")
    if result.returncode != 0:
        die(
            "gemini の実行に失敗しました。CLIのバージョン差でフラグ名が変わっている可能性があります。"
            f"`{cmd} --help` で確認してください。\n{result.stderr.strip()}"
        )
    text = result.stdout.strip()
    if not text:
        die("gemini から空の応答が返されました。`gemini -p \"test\"` で単体動作を確認してください。")
    return text


CALLERS = {
    "claude": call_claude,
    "codex": call_codex,
    "gemini": call_gemini,
}


def render_transcript(entries: list[dict]) -> str:
    return "\n\n".join(f"[{e['label']}]\n{e['text']}" for e in entries)


def print_turn(label: str, text: str) -> None:
    print(f"\n=== {label} ===\n{text}\n")


def write_markdown(
    path: Path,
    topic: str,
    rounds: int,
    display_names: list[str],
    entries: list[dict],
    started: datetime.datetime,
) -> None:
    lines = [
        "# AI会議 議事録",
        "",
        f"- 日時: {started.strftime('%Y-%m-%d %H:%M:%S')}",
        f"- ラウンド数: {rounds}",
        f"- 参加者: {', '.join(display_names)}",
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
    parser = argparse.ArgumentParser(description="複数AI(Claude/Codex/Gemini)による討論(AI会議)を自動進行する")
    parser.add_argument("topic", nargs="?", help="お題・悩み・アイデア(文字列で直接指定)")
    parser.add_argument("--topic-file", help="お題をファイルから読み込む")
    parser.add_argument("--rounds", type=int, default=2, help="オープニング後の往復ラウンド数(既定: 2)")
    parser.add_argument(
        "--agents",
        default="claude,codex,gemini",
        help="参加させるAIをカンマ区切りで指定(既定: claude,codex,gemini)。先頭のAIが司会役として結論をまとめる。",
    )
    parser.add_argument("--claude-cmd", default="claude", help="claude コマンド名/パス(既定: claude)")
    parser.add_argument("--codex-cmd", default="codex", help="codex コマンド名/パス(既定: codex)")
    parser.add_argument("--gemini-cmd", default="gemini", help="gemini コマンド名/パス(既定: gemini)")
    parser.add_argument("--out", help="議事録の保存先パス(既定: kaigi/transcripts/<timestamp>.md)")
    parser.add_argument(
        "--business-file",
        default=str(BUSINESS_FILE_DEFAULT),
        help="事業コンテキストファイルのパス(既定: kaigi/business.md)。存在すれば全発言に絶対厳守の前提として注入される。",
    )
    args = parser.parse_args()

    cmd_for = {"claude": args.claude_cmd, "codex": args.codex_cmd, "gemini": args.gemini_cmd}

    participants = [p.strip().lower() for p in args.agents.split(",") if p.strip()]
    if len(participants) < 2:
        die("最低2つのAIを --agents に指定してください(例: claude,codex,gemini)。")
    for p in participants:
        if p not in CALLERS:
            die(f"未知のAI '{p}' が指定されました。使えるのは {', '.join(CALLERS)} です。")

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

    business_path = Path(args.business_file)
    business_context = None
    if business_path.exists():
        business_context = business_path.read_text(encoding="utf-8").strip() or None
    if not business_context:
        print(
            f"[警告] {business_path} が見つからないか空です。事業スコープの制約なしで進行します。\n"
            "  kaigi/business.md.example をコピーして kaigi/business.md を作成し、事業内容を記入してください。",
            file=sys.stderr,
        )

    display_names = [DISPLAY_NAMES[p] for p in participants]
    charter_text = charter(display_names, business_context)

    started = datetime.datetime.now()
    TRANSCRIPTS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = Path(args.out) if args.out else TRANSCRIPTS_DIR / f"{started.strftime('%Y%m%d-%H%M%S')}.md"

    entries: list[dict] = []

    def add(label: str, text: str) -> None:
        entries.append({"label": label, "text": text})
        print_turn(label, text)
        write_markdown(out_path, topic, args.rounds, display_names, entries, started)

    def speak(agent: str, extra_instruction: str) -> None:
        history = render_transcript(entries)
        history_block = f"\n\n【これまでの発言】\n{history}" if history else ""
        prompt = (
            f"{charter_text}\n\n【お題】\n{topic}{history_block}\n\n---\n"
            f"あなたの立場: {DISPLAY_NAMES[agent]}\n{extra_instruction}"
        )
        text = CALLERS[agent](prompt, cmd_for[agent])
        add(f"{DISPLAY_NAMES[agent]} ({label_suffix})", text)

    print(f"AI会議を開始します(参加者: {', '.join(display_names)})。お題:\n{topic}\n")

    # オープニング: 参加者の順番に、それまでの発言を踏まえて意見を述べる
    label_suffix = "オープニング"
    for i, agent in enumerate(participants):
        if i == 0:
            instruction = "あなたが最初の発言者です。このお題について、初見の考え・論点整理・気になるリスクや前提を述べてください。"
        else:
            instruction = "これまでの発言を踏まえて、あなたの視点から意見を述べてください。同意するだけでなく鋭く検証してください。"
        speak(agent, instruction)

    # 往復ラウンド
    for r in range(1, args.rounds + 1):
        label_suffix = f"ラウンド{r}"
        for agent in participants:
            speak(agent, "直前までの発言を踏まえて、さらに深掘りしてください(反論・新しい視点・妥協案など)。")

    # 結論(先頭の参加者が司会役)
    chair = participants[0]
    history = render_transcript(entries)
    synthesis_prompt = (
        f"{charter_text}\n\n【お題】\n{topic}\n\n【全議論】\n{history}\n\n---\n"
        f"あなたの立場: {DISPLAY_NAMES[chair]}\n"
        "これで議論は終了です。司会として、敵対的な視点から出た攻撃を踏まえて以下を簡潔にまとめてください:\n"
        "1. 参加者(競合視点)が共通して突いてきた弱点・リスク\n"
        "2. 意見が分かれた論点・トレードオフ\n"
        "3. それでも通すべき結論のたたき台\n"
        "4. 次に取るべき具体的なアクション(箇条書き)"
    )
    synthesis = CALLERS[chair](synthesis_prompt, cmd_for[chair])
    entries.append({"label": f"結論・まとめ ({DISPLAY_NAMES[chair]})", "text": synthesis})
    print_turn(f"結論・まとめ ({DISPLAY_NAMES[chair]})", synthesis)
    write_markdown(out_path, topic, args.rounds, display_names, entries, started)

    print(f"議事録を保存しました: {out_path}")


if __name__ == "__main__":
    main()
