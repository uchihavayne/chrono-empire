// Daily Wheel — a once-a-day free spin (plus a few ad spins) for small rewards. Cheap, sticky
// retention + rewarded-ad revenue. Weighted so cash is common and gems/jackpot are rare.

export type WheelKind = 'cash' | 'gems' | 'card' | 'boost' | 'jackpot';

export interface WheelPrize {
  id: string;
  kind: WheelKind;
  icon: string;
  /** cash: income-seconds multiplier · gems/jackpot: gem count · boost: minutes · card: card count */
  amount: number;
  weight: number;
  color: string;
}

// 8 segments; weights sum to 100.
export const WHEEL_PRIZES: WheelPrize[] = [
  { id: 'cash_s',  kind: 'cash',    icon: '💰', amount: 240,  weight: 22, color: '#f0a838' },
  { id: 'gems_s',  kind: 'gems',    icon: '💠', amount: 4,    weight: 14, color: '#4aa8e0' },
  { id: 'boost',   kind: 'boost',   icon: '⚡', amount: 30,   weight: 14, color: '#8d6bff' },
  { id: 'cash_m',  kind: 'cash',    icon: '💰', amount: 720,  weight: 16, color: '#e08a2a' },
  { id: 'card',    kind: 'card',    icon: '🃏', amount: 2,    weight: 12, color: '#2f9a58' },
  { id: 'gems_m',  kind: 'gems',    icon: '💠', amount: 12,   weight: 8,  color: '#3a86c8' },
  { id: 'cash_l',  kind: 'cash',    icon: '💰', amount: 2200, weight: 10, color: '#cf6a10' },
  { id: 'jackpot', kind: 'jackpot', icon: '🎉', amount: 35,   weight: 4,  color: '#d63a58' },
];
export const WHEEL_BY_ID: Record<string, WheelPrize> = Object.fromEntries(WHEEL_PRIZES.map((p) => [p.id, p]));

export const WHEEL_FREE_PER_DAY = 1;   // one free spin daily
export const WHEEL_MAX_PER_DAY = 4;    // + up to 3 more via rewarded ad
export const WHEEL_BOOST_MULT_NOTE = 2; // the boost prize is the standard ×2 profit boost

/** weighted pick → prize index (0..7) */
export function rollWheel(rng: () => number = Math.random): number {
  const total = WHEEL_PRIZES.reduce((a, p) => a + p.weight, 0);
  let r = rng() * total;
  for (let i = 0; i < WHEEL_PRIZES.length; i++) {
    if (r < WHEEL_PRIZES[i].weight) return i;
    r -= WHEEL_PRIZES[i].weight;
  }
  return 0;
}
