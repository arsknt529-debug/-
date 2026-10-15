#!/usr/bin/env python3
"""
シーン別の写真を、店舗・スタッフの実写真から自動で作る。

  python3 scripts/build-images.py <元写真のフォルダ> <出力フォルダ> [--include-people]

- 各シーンに「どの写真の、どの部分を使うか」を SCENES で定義し、16:10 に切り出す
- 全シーンで同じ色味になるよう、彩度・明るさ・温かみをそろえる
- 1280x800（大）と 640x400（小）の WebP を出力する
- 人物が写る写真（スタッフ写真）は --include-people を付けたときだけ使う。
  付けない場合は、人物の写らない店舗写真（fallback）で代用する
元写真を差し替え・追加したら、SCENES を編集して再実行すればすべての画像が作り直される。
"""
import sys
from pathlib import Path
from PIL import Image, ImageEnhance

RATIO = 16 / 10

# source: 元写真のファイル名 / center: 切り出しの中心（幅・高さに対する割合） / width: 切り出す幅（元写真の幅に対する割合）
SCENES = {
    # 一覧：受付と「Xcount Fitness」のサイン
    'hub': {'source': '2.jpg', 'center': (0.33, 0.38), 'width': 0.66},
    # ① 骨格・姿勢：明るいトレーニングスペースとバランスボード
    'posture': {'source': '5.jpg', 'center': (0.62, 0.55), 'width': 0.62},
    # ② 健康診断：やわらかな灯りのデスク（記録を見る・相談するシーン）
    'checkup': {'source': '3.jpg', 'center': (0.25, 0.62), 'width': 0.42},
    # ③ 不調のサイン：植物と窓辺のくつろげるコーナー
    'signals': {'source': '5.jpg', 'center': (0.20, 0.42), 'width': 0.50},
    # ④ 未来の健康：スタッフ（人物写真）。人物を使わない場合は fallback
    'future': {'source': '6.jpg', 'center': (0.50, 0.46), 'width': 1.00, 'people': True,
               'fallback': {'source': '3.jpg', 'center': (0.30, 0.42), 'width': 0.45}},
    # 7日間のギフト：受付の植物（みずみずしい緑）
    'gift': {'source': '2.jpg', 'center': (0.15, 0.40), 'width': 0.34},
}


def crop_16_10(im: Image.Image, center, width_frac) -> Image.Image:
    w, h = im.size
    cw = min(w, w * width_frac)
    ch = cw / RATIO
    if ch > h:
        ch = h
        cw = ch * RATIO
    cx, cy = center[0] * w, center[1] * h
    x0 = min(max(cx - cw / 2, 0), w - cw)
    y0 = min(max(cy - ch / 2, 0), h - ch)
    return im.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch)))


def grade(im: Image.Image) -> Image.Image:
    """XCOUNT の世界観（清潔・温かい・自然）にそろえる、控えめな色調整"""
    im = ImageEnhance.Color(im).enhance(0.92)
    im = ImageEnhance.Brightness(im).enhance(1.03)
    im = ImageEnhance.Contrast(im).enhance(0.96)
    warm = Image.new('RGB', im.size, (250, 244, 232))
    return Image.blend(im, warm, 0.06)


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    include_people = '--include-people' in sys.argv
    if len(args) != 2:
        print(__doc__)
        sys.exit(1)
    src, out = Path(args[0]), Path(args[1])
    out.mkdir(parents=True, exist_ok=True)
    for name, scene in SCENES.items():
        if scene.get('people') and not include_people:
            scene = scene['fallback']
        im = Image.open(src / scene['source']).convert('RGB')
        im = grade(crop_16_10(im, scene['center'], scene['width']))
        im.resize((1280, 800), Image.LANCZOS).save(out / f'{name}.webp', 'WEBP', quality=78, method=6)
        im.resize((640, 400), Image.LANCZOS).save(out / f'{name}-sm.webp', 'WEBP', quality=76, method=6)
        print(f'{name}: {scene["source"]} -> {out / name}.webp')


if __name__ == '__main__':
    main()
