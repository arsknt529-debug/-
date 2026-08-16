-- Xcount Fitness 評価システム DBスキーマ

CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gender TEXT,
    birth_date TEXT,
    height_cm REAL,
    memo TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    measured_at TEXT NOT NULL,
    weight_kg REAL,
    body_fat_percent REAL,
    skinfold_json TEXT,
    circumference_json TEXT,
    rom_json TEXT,
    strength_json TEXT,
    posture_json TEXT,
    memo TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_measurements_client_date
    ON measurements(client_id, measured_at);
