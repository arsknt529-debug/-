# -*- coding: utf-8 -*-
"""測定値から二次的な指標(体脂肪率・BMI・年齢・姿勢スコア)を算出する。"""
from datetime import date

from config import POSTURE_ITEMS, SKINFOLD_SITES


def calc_age(birth_date_str, on_date_str):
    if not birth_date_str or not on_date_str:
        return None
    try:
        b = date.fromisoformat(birth_date_str)
        d = date.fromisoformat(on_date_str)
    except ValueError:
        return None
    age = d.year - b.year - ((d.month, d.day) < (b.month, b.day))
    return age if age >= 0 else None


def calc_bmi(weight_kg, height_cm):
    if not weight_kg or not height_cm:
        return None
    try:
        h_m = height_cm / 100
        return round(weight_kg / (h_m * h_m), 1)
    except (TypeError, ZeroDivisionError):
        return None


def calc_body_fat_percent_jp7(skinfold, gender, age):
    """Jackson & Pollock 7部位法 + Siriの式による体脂肪率(%)の推定。

    skinfold: {site_key: mm, ...} (config.SKINFOLD_SITES の7部位)
    gender: 'male' or 'female'
    age: 年齢(歳)
    7部位すべて揃わない場合は None を返す。
    """
    if age is None or gender not in ("male", "female"):
        return None
    site_keys = [key for key, _ in SKINFOLD_SITES]
    values = []
    for key in site_keys:
        v = skinfold.get(key) if skinfold else None
        if v is None:
            return None
        try:
            values.append(float(v))
        except (TypeError, ValueError):
            return None
    total = sum(values)

    if gender == "male":
        density = (
            1.112
            - 0.00043499 * total
            + 0.00000055 * (total ** 2)
            - 0.00028826 * age
        )
    else:
        density = (
            1.097
            - 0.00046971 * total
            + 0.00000056 * (total ** 2)
            - 0.00012828 * age
        )

    if density <= 0:
        return None

    body_fat = (495 / density) - 450
    if body_fat <= 0 or body_fat > 70:
        return None
    return round(body_fat, 1)


def calc_posture_score(posture):
    """姿勢評価チェック項目の合計点(0=良好が多いほど低い)。未入力項目は無視。"""
    if not posture:
        return None
    total = 0
    count = 0
    for key, _label in POSTURE_ITEMS:
        v = posture.get(key)
        if v is None or v == "":
            continue
        try:
            total += int(v)
            count += 1
        except (TypeError, ValueError):
            continue
    if count == 0:
        return None
    return total
