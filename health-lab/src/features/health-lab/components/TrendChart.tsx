import type { TrendPoint } from '../engine/checkup';

/**
 * 同じ項目・同じ単位の値の推移（2件以上のときのみ表示）。
 * 基準線や「良い・悪い」の色分けは描かない（独自の判定をしないため）。
 */
export function TrendChart({ points, unitLabel, itemName }: { points: TrendPoint[]; unitLabel: string; itemName: string }) {
  if (points.length < 2) return null;
  const W = 320;
  const H = 160;
  const pad = { l: 16, r: 16, t: 28, b: 32 };
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || Math.max(Math.abs(max) * 0.1, 1);
  const lo = min - span * 0.25;
  const hi = max + span * 0.25;
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / (points.length - 1);
  const y = (v: number) => pad.t + ((hi - v) / (hi - lo)) * (H - pad.t - pad.b);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const summary = points.map((p) => `${p.date.replaceAll('-', '/')}：${p.value}${unitLabel}`).join('、');

  return (
    <figure style={{ margin: 0 }}>
      <svg className="hl-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${itemName}の推移。${summary}`}>
        <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="#E7E2D9" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={`${p.date}-${i}`}>
            <circle cx={x(i)} cy={y(p.value)} r="4.5" fill="#fff" stroke="var(--accent)" strokeWidth="2" />
            <text x={x(i)} y={y(p.value) - 10} textAnchor="middle" fontSize="12" fill="#211916" fontWeight="700">
              {p.value}
            </text>
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="#6B6560">
              {p.date.slice(0, 7).replace('-', '/')}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="hl-caption" style={{ textAlign: 'left' }}>
        単位：{unitLabel}
      </figcaption>
    </figure>
  );
}
