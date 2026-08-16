# -*- coding: utf-8 -*-
"""動作確認用のデモデータを投入するスクリプト(任意実行)。

使い方: python3 seed.py
"""
import json
from datetime import date, timedelta

import db


def run():
    db.init_db()
    conn = db.get_connection()
    try:
        cur = conn.execute(
            """
            INSERT INTO clients (name, gender, birth_date, height_cm, memo)
            VALUES (?, ?, ?, ?, ?)
            """,
            ("鈴木 一郎", "male", "1990-04-12", 172.0, "半年後の大会出場が目標。膝に既往歴あり。"),
        )
        client_id = cur.lastrowid

        base_date = date(2026, 2, 1)
        sessions = [
            {
                "offset": 0,
                "weight_kg": 78.5,
                "skinfold": {"chest": 12, "abdominal": 22, "thigh": 18, "triceps": 14,
                             "subscapular": 16, "suprailiac": 20, "midaxillary": 13},
                "circumference": {"neck": 39, "chest": 100, "waist": 92, "hip": 101,
                                   "arm_r": 33, "arm_l": 32.5, "forearm_r": 28, "forearm_l": 27.5,
                                   "thigh_r": 58, "thigh_l": 57.5, "calf_r": 38, "calf_l": 37.5},
                "rom": {"shoulder_flexion_r": 160, "shoulder_flexion_l": 158,
                        "hip_flexion_r": 110, "hip_flexion_l": 105,
                        "knee_flexion_r": 130, "knee_flexion_l": 125,
                        "ankle_dorsiflexion_r": 15, "ankle_dorsiflexion_l": 12},
                "strength": {"grip_r": 42, "grip_l": 40, "squat_1rm": 90,
                             "bench_press_1rm": 70, "plank_hold": 60},
                "posture": {"forward_head": "2", "kyphosis": "2", "anterior_pelvic_tilt": "1",
                            "shoulder_asymmetry": "1", "flat_foot": "1"},
                "memo": "初回評価。姿勢改善とウエスト周りが今後の重点課題。",
            },
            {
                "offset": 30,
                "weight_kg": 76.8,
                "skinfold": {"chest": 11, "abdominal": 19, "thigh": 16, "triceps": 13,
                             "subscapular": 15, "suprailiac": 17, "midaxillary": 12},
                "circumference": {"neck": 38.5, "chest": 99, "waist": 88, "hip": 99,
                                   "arm_r": 33.5, "arm_l": 33, "forearm_r": 28, "forearm_l": 27.5,
                                   "thigh_r": 57, "thigh_l": 56.5, "calf_r": 38, "calf_l": 37.5},
                "rom": {"shoulder_flexion_r": 165, "shoulder_flexion_l": 162,
                        "hip_flexion_r": 115, "hip_flexion_l": 110,
                        "knee_flexion_r": 132, "knee_flexion_l": 128,
                        "ankle_dorsiflexion_r": 17, "ankle_dorsiflexion_l": 14},
                "strength": {"grip_r": 44, "grip_l": 41, "squat_1rm": 100,
                             "bench_press_1rm": 75, "plank_hold": 75},
                "posture": {"forward_head": "1", "kyphosis": "1", "anterior_pelvic_tilt": "1",
                            "shoulder_asymmetry": "1", "flat_foot": "1"},
                "memo": "順調に体脂肪減少。可動域も改善傾向。",
            },
            {
                "offset": 60,
                "weight_kg": 75.6,
                "skinfold": {"chest": 10, "abdominal": 16, "thigh": 14, "triceps": 11,
                             "subscapular": 13, "suprailiac": 15, "midaxillary": 10},
                "circumference": {"neck": 38, "chest": 99, "waist": 85, "hip": 98,
                                   "arm_r": 34, "arm_l": 33.5, "forearm_r": 28.5, "forearm_l": 28,
                                   "thigh_r": 56.5, "thigh_l": 56, "calf_r": 38.5, "calf_l": 38},
                "rom": {"shoulder_flexion_r": 170, "shoulder_flexion_l": 168,
                        "hip_flexion_r": 120, "hip_flexion_l": 118,
                        "knee_flexion_r": 135, "knee_flexion_l": 133,
                        "ankle_dorsiflexion_r": 18, "ankle_dorsiflexion_l": 17},
                "strength": {"grip_r": 46, "grip_l": 43, "squat_1rm": 107.5,
                             "bench_press_1rm": 80, "plank_hold": 95},
                "posture": {"forward_head": "1", "kyphosis": "0", "anterior_pelvic_tilt": "0",
                            "shoulder_asymmetry": "0", "flat_foot": "1"},
                "memo": "姿勢良好。筋力も着実に向上。",
            },
        ]

        for s in sessions:
            measured_at = (base_date + timedelta(days=s["offset"])).isoformat()
            conn.execute(
                """
                INSERT INTO measurements (
                    client_id, measured_at, weight_kg, body_fat_percent,
                    skinfold_json, circumference_json, rom_json, strength_json,
                    posture_json, memo
                ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?)
                """,
                (
                    client_id,
                    measured_at,
                    s["weight_kg"],
                    json.dumps(s["skinfold"], ensure_ascii=False),
                    json.dumps(s["circumference"], ensure_ascii=False),
                    json.dumps(s["rom"], ensure_ascii=False),
                    json.dumps(s["strength"], ensure_ascii=False),
                    json.dumps(s["posture"], ensure_ascii=False),
                    s["memo"],
                ),
            )
        conn.commit()
        print(f"デモお客様(client_id={client_id})と測定記録{len(sessions)}件を作成しました。")
    finally:
        conn.close()


if __name__ == "__main__":
    run()
