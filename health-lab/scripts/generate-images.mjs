#!/usr/bin/env node
/**
 * シーンごとの画像を、画像生成AI（Google Gemini API / Imagen）で自動生成する。
 *
 *   GEMINI_API_KEY=... node scripts/generate-images.mjs <出力フォルダ> [シーン名...]
 *
 * - プロンプトは scripts/image-prompts.json（シーン別のプロンプト＋全シーン共通のスタイル）
 * - 1シーンにつき候補を CANDIDATES 枚生成し、<出力フォルダ>/<シーン>-<番号>.png に保存する
 * - 採用する候補を <シーン>.png にリネームしてから scripts/build-images.py を実行すると、
 *   色味をそろえて各サイズの WebP に変換される
 * - モデルは GEMINI_IMAGE_MODEL で変更できる（既定：imagen-4.0-generate-001）
 *
 * 注意：生成画像の人物は架空の人物。実在のスタッフ・お客様として紹介しないこと。
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const { style, scenes } = JSON.parse(readFileSync(path.join(here, 'image-prompts.json'), 'utf8'));

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_IMAGE_MODEL ?? 'imagen-4.0-generate-001';
const CANDIDATES = Number(process.env.CANDIDATES ?? 3);
const [outDir, ...only] = process.argv.slice(2);

if (!apiKey || !outDir) {
  console.error('使い方: GEMINI_API_KEY=... node scripts/generate-images.mjs <出力フォルダ> [シーン名...]');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const targets = Object.entries(scenes).filter(([name]) => only.length === 0 || only.includes(name));

for (const [name, scene] of targets) {
  const prompt = `${scene.prompt} ${style}`;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: CANDIDATES, aspectRatio: '16:9', personGeneration: 'allow_adult' },
    }),
  });
  if (!res.ok) {
    console.error(`${name}: 生成に失敗しました (${res.status}) ${(await res.text()).slice(0, 300)}`);
    continue;
  }
  const data = await res.json();
  const images = (data.predictions ?? []).map((p) => p.bytesBase64Encoded).filter(Boolean);
  images.forEach((b64, i) => {
    const file = path.join(outDir, `${name}-${i + 1}.png`);
    writeFileSync(file, Buffer.from(b64, 'base64'));
    console.log(`${name}（${scene.title}）: ${file}`);
  });
  if (images.length === 0) console.error(`${name}: 画像が返されませんでした（安全フィルター等）。プロンプトを調整してください。`);
}
