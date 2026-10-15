// 共有用プレビュー（1ファイルの HTML）を作る： node preview/build.mjs
import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const out = process.argv[2] ?? path.join(root, 'preview-dist', 'index.html');

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
