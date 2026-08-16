# AI Kaigi

お題・悩み・アイデアを1つ投げると、Claude・Codex・Gemini が順番に討論し、
結論と次のアクションをまとめて Markdown の議事録として保存するツール。

使い方の詳細は [`kaigi/README.md`](kaigi/README.md) を参照。

```bash
python3 kaigi/run_kaigi.py "ここにお題や悩みを書く"
```

# Xcount Fitness 評価システム

パーソナルトレーニングジム「Xcount Fitness」向けの、お客様の変化・現状を評価するための
Webアプリケーション(体重グラフ、各部位の皮下脂肪厚・周囲サイズ、関節可動域評価、
筋力評価、姿勢評価)。詳細は [`xcount-fitness/README.md`](xcount-fitness/README.md) を参照。

```bash
cd xcount-fitness
pip install -r requirements.txt
python3 app.py
```
