import { formatNumber } from '../game/format';

type Notation = 'suffix' | 'scientific';

/** Tiny inline-SVG line chart for the stats section. Values are log10-scaled so an idle game's
 *  many-orders-of-magnitude growth stays readable, with a soft gradient fill under the line. */
export function StatGraph({ id, data, color, notation, label }: {
  id: string; data: number[]; color: string; notation: Notation; label: string;
}) {
  if (data.length < 2) {
    return (
      <div className="stat-graph empty">
        <div className="sg-head"><span>{label}</span></div>
        <div className="sg-wait">···</div>
      </div>
    );
  }

  const W = 300, H = 68, pad = 5;
  const ys = data.map((v) => Math.log10(1 + Math.max(0, v)));
  const min = Math.min(...ys), max = Math.max(...ys);
  const range = max - min || 1;
  const n = data.length;
  const pts = ys.map((y, i) => {
    const x = pad + (i / (n - 1)) * (W - 2 * pad);
    const yy = H - pad - ((y - min) / range) * (H - 2 * pad);
    return [x, yy] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${pts[n - 1][0].toFixed(1)} ${H} L${pts[0][0].toFixed(1)} ${H} Z`;
  const last = data[n - 1];

  return (
    <div className="stat-graph">
      <div className="sg-head"><span>{label}</span><span className="sg-cur" style={{ color }}>{formatNumber(last, notation)}</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="sg-svg">
        <defs>
          <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#sg-${id})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
          vectorEffect="non-scaling-stroke" />
        <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r="2.5" fill={color} />
      </svg>
    </div>
  );
}
