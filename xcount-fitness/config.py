# -*- coding: utf-8 -*-
"""評価項目の定義。フォーム描画とグラフ描画の両方で利用する。"""

# --- 皮下脂肪厚(キャリパー法) 7部位法, 単位: mm ---
SKINFOLD_SITES = [
    ("chest", "胸部"),
    ("abdominal", "腹部"),
    ("thigh", "大腿部"),
    ("triceps", "上腕三頭筋部"),
    ("subscapular", "肩甲骨下部"),
    ("suprailiac", "腸骨上部"),
    ("midaxillary", "腋窩中央部"),
]

# --- 周囲径(周径), 単位: cm ---
CIRCUMFERENCE_SITES = [
    ("neck", "頸部"),
    ("chest", "胸囲"),
    ("waist", "腹囲(ウエスト)"),
    ("hip", "臀囲(ヒップ)"),
    ("arm_r", "上腕(右)"),
    ("arm_l", "上腕(左)"),
    ("forearm_r", "前腕(右)"),
    ("forearm_l", "前腕(左)"),
    ("thigh_r", "大腿(右)"),
    ("thigh_l", "大腿(左)"),
    ("calf_r", "下腿(右)"),
    ("calf_l", "下腿(左)"),
]

# --- 関節可動域(ROM), 単位: 度 ---
ROM_ITEMS = [
    ("shoulder_flexion_r", "肩関節 屈曲(右)"),
    ("shoulder_flexion_l", "肩関節 屈曲(左)"),
    ("shoulder_extension_r", "肩関節 伸展(右)"),
    ("shoulder_extension_l", "肩関節 伸展(左)"),
    ("shoulder_abduction_r", "肩関節 外転(右)"),
    ("shoulder_abduction_l", "肩関節 外転(左)"),
    ("hip_flexion_r", "股関節 屈曲(右)"),
    ("hip_flexion_l", "股関節 屈曲(左)"),
    ("hip_extension_r", "股関節 伸展(右)"),
    ("hip_extension_l", "股関節 伸展(左)"),
    ("hip_abduction_r", "股関節 外転(右)"),
    ("hip_abduction_l", "股関節 外転(左)"),
    ("knee_flexion_r", "膝関節 屈曲(右)"),
    ("knee_flexion_l", "膝関節 屈曲(左)"),
    ("ankle_dorsiflexion_r", "足関節 背屈(右)"),
    ("ankle_dorsiflexion_l", "足関節 背屈(左)"),
    ("trunk_flexion", "体幹(脊柱) 屈曲"),
    ("trunk_extension", "体幹(脊柱) 伸展"),
    ("trunk_rotation_r", "体幹(脊柱) 回旋(右)"),
    ("trunk_rotation_l", "体幹(脊柱) 回旋(左)"),
]

# --- 筋力評価 ---
STRENGTH_ITEMS = [
    ("grip_r", "握力(右)", "kg"),
    ("grip_l", "握力(左)", "kg"),
    ("back_strength", "背筋力", "kg"),
    ("squat_1rm", "スクワット 1RM", "kg"),
    ("bench_press_1rm", "ベンチプレス 1RM", "kg"),
    ("leg_press", "レッグプレス", "kg"),
    ("plank_hold", "プランク保持時間", "秒"),
    ("situp_30s", "上体起こし(30秒)", "回"),
]

# --- 姿勢評価 ---
POSTURE_ITEMS = [
    ("forward_head", "頭部前方位"),
    ("kyphosis", "円背・猫背"),
    ("anterior_pelvic_tilt", "骨盤前傾"),
    ("posterior_pelvic_tilt", "骨盤後傾"),
    ("shoulder_asymmetry", "肩の左右差"),
    ("pelvic_asymmetry", "骨盤の左右差"),
    ("knee_valgus", "X脚(膝内反)"),
    ("knee_varus", "O脚(膝外反)"),
    ("flat_foot", "扁平足"),
]

POSTURE_LEVELS = [
    ("0", "良好"),
    ("1", "軽度"),
    ("2", "中等度"),
    ("3", "重度"),
]

POSTURE_LEVEL_LABELS = dict(POSTURE_LEVELS)

GENDER_CHOICES = [
    ("male", "男性"),
    ("female", "女性"),
    ("other", "その他"),
]
