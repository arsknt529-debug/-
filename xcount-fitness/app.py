# -*- coding: utf-8 -*-
"""Xcount Fitness - お客様の変化・現状評価システム

パーソナルトレーニングジム Xcount Fitness 向けの、顧客の身体データを
記録・可視化するための小規模Webアプリケーション。

記録項目:
  - 体重
  - 各部位の皮下脂肪厚(キャリパー法) / 体脂肪率(自動推定)
  - 各部位の周囲径(サイズ)
  - 関節可動域(ROM)
  - 筋力評価
  - 姿勢評価
"""
import json
from datetime import date

from flask import Flask, redirect, render_template, request, url_for

import db
from calculations import (
    calc_age,
    calc_bmi,
    calc_body_fat_percent_jp7,
    calc_posture_score,
)
from config import (
    CIRCUMFERENCE_SITES,
    GENDER_CHOICES,
    POSTURE_ITEMS,
    POSTURE_LEVEL_LABELS,
    POSTURE_LEVELS,
    ROM_ITEMS,
    SKINFOLD_SITES,
    STRENGTH_ITEMS,
)

app = Flask(__name__)


# ---------------------------------------------------------------------------
# ヘルパー
# ---------------------------------------------------------------------------

def _to_float(value):
    if value is None:
        return None
    value = str(value).strip()
    if value == "":
        return None
    try:
        return float(value)
    except ValueError:
        return None


def _collect_numeric(form, prefix, items):
    """items: [(key, label, ...), ...] -> {key: float, ...} (未入力は除外)"""
    result = {}
    for key, *_rest in items:
        v = _to_float(form.get(f"{prefix}{key}"))
        if v is not None:
            result[key] = v
    return result


def _collect_posture(form):
    result = {}
    for key, _label in POSTURE_ITEMS:
        v = form.get(f"posture_{key}")
        if v in ("0", "1", "2", "3"):
            result[key] = v
    return result


def _json_loads(text):
    if not text:
        return {}
    try:
        return json.loads(text)
    except (TypeError, ValueError):
        return {}


def _row_to_measurement(row):
    m = dict(row)
    m["skinfold"] = _json_loads(m.get("skinfold_json"))
    m["circumference"] = _json_loads(m.get("circumference_json"))
    m["rom"] = _json_loads(m.get("rom_json"))
    m["strength"] = _json_loads(m.get("strength_json"))
    m["posture"] = _json_loads(m.get("posture_json"))
    m["posture_score"] = calc_posture_score(m["posture"])
    return m


def get_client_or_404(conn, client_id):
    row = conn.execute("SELECT * FROM clients WHERE id = ?", (client_id,)).fetchone()
    if row is None:
        from flask import abort

        abort(404)
    return row


# ---------------------------------------------------------------------------
# 顧客一覧・登録
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    conn = db.get_connection()
    try:
        clients = conn.execute(
            """
            SELECT c.*,
                   (SELECT COUNT(*) FROM measurements m WHERE m.client_id = c.id) AS measurement_count,
                   (SELECT MAX(measured_at) FROM measurements m WHERE m.client_id = c.id) AS last_measured_at
            FROM clients c
            ORDER BY c.created_at DESC
            """
        ).fetchall()
    finally:
        conn.close()
    return render_template(
        "index.html",
        clients=clients,
        gender_choices=GENDER_CHOICES,
        gender_labels=dict(GENDER_CHOICES),
    )


@app.route("/clients", methods=["POST"])
def create_client():
    name = request.form.get("name", "").strip()
    if not name:
        return redirect(url_for("index"))
    conn = db.get_connection()
    try:
        cur = conn.execute(
            """
            INSERT INTO clients (name, gender, birth_date, height_cm, memo)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                name,
                request.form.get("gender") or None,
                request.form.get("birth_date") or None,
                _to_float(request.form.get("height_cm")),
                request.form.get("memo") or None,
            ),
        )
        conn.commit()
        client_id = cur.lastrowid
    finally:
        conn.close()
    return redirect(url_for("client_detail", client_id=client_id))


@app.route("/clients/<int:client_id>/edit", methods=["GET", "POST"])
def edit_client(client_id):
    conn = db.get_connection()
    try:
        client = get_client_or_404(conn, client_id)
        if request.method == "POST":
            name = request.form.get("name", "").strip()
            if name:
                conn.execute(
                    """
                    UPDATE clients
                    SET name = ?, gender = ?, birth_date = ?, height_cm = ?, memo = ?
                    WHERE id = ?
                    """,
                    (
                        name,
                        request.form.get("gender") or None,
                        request.form.get("birth_date") or None,
                        _to_float(request.form.get("height_cm")),
                        request.form.get("memo") or None,
                        client_id,
                    ),
                )
                conn.commit()
            return redirect(url_for("client_detail", client_id=client_id))
    finally:
        conn.close()
    return render_template("client_edit.html", client=client, gender_choices=GENDER_CHOICES)


@app.route("/clients/<int:client_id>/delete", methods=["POST"])
def delete_client(client_id):
    conn = db.get_connection()
    try:
        conn.execute("DELETE FROM clients WHERE id = ?", (client_id,))
        conn.commit()
    finally:
        conn.close()
    return redirect(url_for("index"))


# ---------------------------------------------------------------------------
# 顧客詳細(履歴 + グラフ)
# ---------------------------------------------------------------------------

@app.route("/clients/<int:client_id>")
def client_detail(client_id):
    conn = db.get_connection()
    try:
        client = get_client_or_404(conn, client_id)
        rows = conn.execute(
            """
            SELECT * FROM measurements
            WHERE client_id = ?
            ORDER BY measured_at ASC, id ASC
            """,
            (client_id,),
        ).fetchall()
    finally:
        conn.close()

    measurements = [_row_to_measurement(r) for r in rows]

    for m in measurements:
        m["bmi"] = calc_bmi(m.get("weight_kg"), client["height_cm"])
        if m.get("body_fat_percent") is None:
            age = calc_age(client["birth_date"], m["measured_at"])
            m["body_fat_percent"] = calc_body_fat_percent_jp7(
                m["skinfold"], client["gender"], age
            )

    latest = measurements[-1] if measurements else None
    previous = measurements[-2] if len(measurements) > 1 else None

    chart_data = {
        "labels": [m["measured_at"] for m in measurements],
        "weight": [m.get("weight_kg") for m in measurements],
        "body_fat_percent": [m.get("body_fat_percent") for m in measurements],
        "bmi": [m.get("bmi") for m in measurements],
        "posture_score": [m.get("posture_score") for m in measurements],
        "circumference": {
            key: [m["circumference"].get(key) for m in measurements]
            for key, _label in CIRCUMFERENCE_SITES
        },
        "strength": {
            key: [m["strength"].get(key) for m in measurements]
            for key, _label, _unit in STRENGTH_ITEMS
        },
        "rom_latest": {
            key: latest["rom"].get(key) if latest else None
            for key, _label in ROM_ITEMS
        },
        "rom_labels": [label for _key, label in ROM_ITEMS],
        "rom_keys": [key for key, _label in ROM_ITEMS],
    }

    return render_template(
        "client_detail.html",
        client=client,
        measurements=list(reversed(measurements)),
        latest=latest,
        previous=previous,
        chart_data_json=json.dumps(chart_data, ensure_ascii=False),
        skinfold_sites=SKINFOLD_SITES,
        circumference_sites=CIRCUMFERENCE_SITES,
        rom_items=ROM_ITEMS,
        strength_items=STRENGTH_ITEMS,
        posture_items=POSTURE_ITEMS,
        posture_level_labels=POSTURE_LEVEL_LABELS,
    )


# ---------------------------------------------------------------------------
# 測定記録の登録・編集・削除
# ---------------------------------------------------------------------------

def _measurement_form_context(client, measurement=None):
    return {
        "client": client,
        "measurement": measurement,
        "today": date.today().isoformat(),
        "skinfold_sites": SKINFOLD_SITES,
        "circumference_sites": CIRCUMFERENCE_SITES,
        "rom_items": ROM_ITEMS,
        "strength_items": STRENGTH_ITEMS,
        "posture_items": POSTURE_ITEMS,
        "posture_levels": POSTURE_LEVELS,
    }


@app.route("/clients/<int:client_id>/measurements/new", methods=["GET"])
def new_measurement(client_id):
    conn = db.get_connection()
    try:
        client = get_client_or_404(conn, client_id)
    finally:
        conn.close()
    return render_template("measurement_form.html", **_measurement_form_context(client))


@app.route("/clients/<int:client_id>/measurements", methods=["POST"])
def create_measurement(client_id):
    _save_measurement(client_id, measurement_id=None)
    return redirect(url_for("client_detail", client_id=client_id))


@app.route("/clients/<int:client_id>/measurements/<int:measurement_id>/edit", methods=["GET"])
def edit_measurement(client_id, measurement_id):
    conn = db.get_connection()
    try:
        client = get_client_or_404(conn, client_id)
        row = conn.execute(
            "SELECT * FROM measurements WHERE id = ? AND client_id = ?",
            (measurement_id, client_id),
        ).fetchone()
        if row is None:
            from flask import abort

            abort(404)
        measurement = _row_to_measurement(row)
    finally:
        conn.close()
    return render_template(
        "measurement_form.html", **_measurement_form_context(client, measurement)
    )


@app.route("/clients/<int:client_id>/measurements/<int:measurement_id>", methods=["POST"])
def update_measurement(client_id, measurement_id):
    _save_measurement(client_id, measurement_id=measurement_id)
    return redirect(url_for("client_detail", client_id=client_id))


@app.route(
    "/clients/<int:client_id>/measurements/<int:measurement_id>/delete", methods=["POST"]
)
def delete_measurement(client_id, measurement_id):
    conn = db.get_connection()
    try:
        conn.execute(
            "DELETE FROM measurements WHERE id = ? AND client_id = ?",
            (measurement_id, client_id),
        )
        conn.commit()
    finally:
        conn.close()
    return redirect(url_for("client_detail", client_id=client_id))


def _save_measurement(client_id, measurement_id):
    form = request.form
    measured_at = form.get("measured_at") or date.today().isoformat()
    weight_kg = _to_float(form.get("weight_kg"))
    body_fat_percent = _to_float(form.get("body_fat_percent"))

    skinfold = _collect_numeric(form, "skinfold_", SKINFOLD_SITES)
    circumference = _collect_numeric(form, "circumference_", CIRCUMFERENCE_SITES)
    rom = _collect_numeric(form, "rom_", ROM_ITEMS)
    strength = _collect_numeric(form, "strength_", STRENGTH_ITEMS)
    posture = _collect_posture(form)

    if body_fat_percent is None:
        conn = db.get_connection()
        try:
            client = get_client_or_404(conn, client_id)
        finally:
            conn.close()
        age = calc_age(client["birth_date"], measured_at)
        body_fat_percent = calc_body_fat_percent_jp7(skinfold, client["gender"], age)

    values = (
        client_id,
        measured_at,
        weight_kg,
        body_fat_percent,
        json.dumps(skinfold, ensure_ascii=False),
        json.dumps(circumference, ensure_ascii=False),
        json.dumps(rom, ensure_ascii=False),
        json.dumps(strength, ensure_ascii=False),
        json.dumps(posture, ensure_ascii=False),
        form.get("memo") or None,
    )

    conn = db.get_connection()
    try:
        if measurement_id is None:
            conn.execute(
                """
                INSERT INTO measurements (
                    client_id, measured_at, weight_kg, body_fat_percent,
                    skinfold_json, circumference_json, rom_json, strength_json,
                    posture_json, memo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                values,
            )
        else:
            conn.execute(
                """
                UPDATE measurements
                SET client_id = ?, measured_at = ?, weight_kg = ?, body_fat_percent = ?,
                    skinfold_json = ?, circumference_json = ?, rom_json = ?,
                    strength_json = ?, posture_json = ?, memo = ?
                WHERE id = ?
                """,
                values + (measurement_id,),
            )
        conn.commit()
    finally:
        conn.close()


@app.template_filter("fmt")
def fmt(value, digits=1):
    if value is None:
        return "-"
    if isinstance(value, float):
        return f"{value:.{digits}f}"
    return value


@app.template_filter("posture_label")
def posture_label(value):
    if value is None or value == "":
        return "-"
    return POSTURE_LEVEL_LABELS.get(str(value), "-")


if __name__ == "__main__":
    db.init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
