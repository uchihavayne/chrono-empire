// Number formatting: K, M, B, T then aa, ab, ac ... or scientific.

const SUFFIXES = ['', 'K', 'M', 'B', 'T'];

function alphaSuffix(tier: number): string {
  // tier 5 → aa, 6 → ab ...
  const n = tier - 5;
  const a = Math.floor(n / 26);
  const b = n % 26;
  return String.fromCharCode(97 + a) + String.fromCharCode(97 + b);
}

export function formatNumber(v: number, notation: 'suffix' | 'scientific' = 'suffix'): string {
  if (!isFinite(v)) return '∞';
  if (v < 0) return '-' + formatNumber(-v, notation);
  if (v < 1000) {
    return v < 100 && v % 1 !== 0 ? v.toFixed(1) : Math.floor(v).toString();
  }
  const tier = Math.floor(Math.log10(v) / 3);
  if (notation === 'scientific' && tier >= 5) {
    const exp = Math.floor(Math.log10(v));
    return (v / Math.pow(10, exp)).toFixed(2) + 'e' + exp;
  }
  const scaled = v / Math.pow(10, tier * 3);
  const suffix = tier < SUFFIXES.length ? SUFFIXES[tier] : alphaSuffix(tier);
  return (scaled >= 100 ? scaled.toFixed(0) : scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2)) + suffix;
}

export function formatDuration(seconds: number): string {
  seconds = Math.max(0, Math.floor(seconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  if (m > 0) return `${m}:${s.toString().padStart(2, '0')}`;
  return `${s}s`;
}
