// 共有用プレビュー（1ファイルの HTML）を作る： node preview/build.mjs
import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
// 使い方: node preview/build.mjs [出力HTML] [--photos <写真フォルダ>]
const argv = process.argv.slice(2);
const photosIdx = argv.indexOf('--photos');
const photosDir = photosIdx >= 0 ? path.resolve(argv[photosIdx + 1]) : path.join(root, 'public/health-lab/images');
const positional = photosIdx >= 0 ? argv.filter((_, i) => i !== photosIdx && i !== photosIdx + 1) : argv;
const out = positional[0] ?? path.join(root, 'preview-dist', 'index.html');

// 写真は data URI として埋め込む（プレビューのページは外部の画像を読み込めないため）
const photoNames = ['hub', 'posture', 'checkup', 'signals', 'future', 'gift'];
const dataUri = (file) => `data:image/webp;base64,${readFileSync(path.join(photosDir, file)).toString('base64')}`;
const photosModule = `
const LG = ${JSON.stringify(Object.fromEntries(photoNames.map((n) => [n, dataUri(`${n}.webp`)])))};
const SM = ${JSON.stringify(Object.fromEntries(photoNames.map((n) => [n, dataUri(`${n}-sm.webp`)])))};
export const photoAlt = ${JSON.stringify({ hub: 'XCOUNT Fitness の受付と観葉植物', posture: '明るいトレーニングスペースとバランスボード', checkup: 'やわらかな灯りのデスクスペース', signals: '植物と窓辺のくつろげるコーナー', future: 'XCOUNT のスタッフ', gift: 'みずみずしい観葉植物' })};
export function photoSrc(name, size = 'lg') { return (size === 'sm' ? SM : LG)[name]; }
`;

// React は CDN（UMD）のグローバルを使う
const globals = {
  name: 'globals',
  setup(b) {
    b.onResolve({ filter: /^(react|react-dom\/client|react\/jsx-runtime)$/ }, (a) => ({ path: a.path, namespace: 'g' }));
    b.onLoad({ filter: /.*/, namespace: 'g' }, (a) => ({
      contents:
        a.path === 'react' ? 'module.exports = window.React' :
        a.path === 'react-dom/client' ? 'module.exports = window.ReactDOM' :
        'module.exports = { jsx: (t, p, k) => window.React.createElement(t, k === undefined ? p : { ...p, key: k }), jsxs: (t, p, k) => window.React.createElement(t, k === undefined ? p : { ...p, key: k }), Fragment: window.React.Fragment }',
      loader: 'js',
    }));
    b.onLoad({ filter: /content[\\/]photos\.ts$/ }, () => ({ contents: photosModule, loader: 'js' }));
    b.onResolve({ filter: /^next\/link$/ }, () => ({ path: path.join(here, 'shims/next-link.tsx') }));
    b.onResolve({ filter: /^next\/script$/ }, () => ({ path: path.join(here, 'shims/next-script.tsx') }));
    b.onResolve({ filter: /^@\// }, (a) => b.resolve('./' + a.path.slice(2), { resolveDir: path.join(root, 'src'), kind: a.kind }));
  },
};

const result = await build({
  entryPoints: [path.join(here, 'main.tsx')],
  bundle: true,
  write: false,
  minify: true,
  format: 'iife',
  target: 'es2020',
  jsx: 'automatic',
  plugins: [globals],
  resolveExtensions: ['.tsx', '.ts', '.js'],
  logLevel: 'error',
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.NEXT_PUBLIC_HEALTHLAB_SIGNALS_ENABLED': '"true"',
    'process.env.NEXT_PUBLIC_HEALTHLAB_SHOW_DRAFT_BADGE': '"false"',
    'process.env.NEXT_PUBLIC_LIFF_ID': '""',
  },
});

const js = result.outputFiles[0].text.replaceAll('</script', '<\\/script');
const css = readFileSync(path.join(root, 'src/features/health-lab/styles/health-lab.css'), 'utf8');

const html = `<title>XCOUNT HEALTH LAB</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=Zen+Maru+Gothic:wght@500;700&display=swap">
<style>
/* XCOUNT HEALTH LAB は明るい1テーマの世界観で統一する（ダークモードでも同じ見た目） */
:root { --page-bg: #FAF8F4; color-scheme: light; }
body { background: var(--page-bg); color: #211916; }
${css}
.preview-banner {
  margin: 0; padding: 6px max(16px, env(safe-area-inset-left, 0px)); text-align: center;
  font-size: 11px; line-height: 1.6; background: #211916; color: #FAF8F4; letter-spacing: 0.04em;
}
.hl { min-height: 100%; }
</style>
<div id="app"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script>${js}</script>
`;
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(1)} KB)`);
