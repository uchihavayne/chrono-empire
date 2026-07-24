// Event World — a limited-time PARALLEL world you switch into from the main game. It runs in
// rolling 10-day cycles and plays like a compact version of the main game: buy festival stalls
// (each with levels + ×2 milestone bonuses), earn Event Tokens 🎟️, reinvest. When a cycle ends,
// the tokens you earned convert to a SMALL, capped number of Gems 💠 (events reward engagement,
// they are NOT a gem faucet), the world resets, and a new festival begins.

import { milestoneMult, nextMilestone } from './data';

export const EVENT_DURATION_DAYS = 10;
const DAY = 86_400_000;
export const EVENT_DURATION_MS = EVENT_DURATION_DAYS * DAY;
const EVENT_EPOCH = Date.UTC(2026, 0, 1); // fixed so cycles line up on every device
export const EVENT_START_TOKENS = 20;     // bootstrap grant each cycle
export const EVENT_OFFLINE_CAP_H = 8;
export const EVENT_BOOST_MULT = 3;        // Festival Frenzy multiplier (rewarded ad)
export const EVENT_BOOST_MIN = 60;        // Frenzy duration in minutes

export interface EventGenDef {
  id: string; icon: string;
  baseCost: number; baseRev: number; cycle: number; costRate: number;
}

// "Temporal Rift Festival" — festival stalls scattered across the timeline
export const EVENT_GENS: EventGenDef[] = [
  { id: 'ev_confetti',  icon: '🎊', baseCost: 15,    baseRev: 1,      cycle: 1, costRate: 1.10 },
  { id: 'ev_carousel',  icon: '🎠', baseCost: 220,   baseRev: 10,     cycle: 2, costRate: 1.11 },
  { id: 'ev_fireworks', icon: '🎆', baseCost: 4_500, baseRev: 160,    cycle: 3, costRate: 1.12 },
  { id: 'ev_ferris',    icon: '🎡', baseCost: 9e4,   baseRev: 2_600,  cycle: 4, costRate: 1.12 },
  { id: 'ev_bumper',    icon: '🎢', baseCost: 1.8e6, baseRev: 5.5e4,  cycle: 5, costRate: 1.13 },
  { id: 'ev_portal',    icon: '🌀', baseCost: 4e7,   baseRev: 1.3e6,  cycle: 6, costRate: 1.13 },
];
export const EVENT_GEN_BY_ID: Record<string, EventGenDef> = Object.fromEntries(EVENT_GENS.map((g) => [g.id, g]));

export function eventCycleId(now = Date.now()): number {
  return Math.floor((now - EVENT_EPOCH) / EVENT_DURATION_MS);
}
export function eventEndsAt(now = Date.now()): number {
  return EVENT_EPOCH + (eventCycleId(now) + 1) * EVENT_DURATION_MS;
}

/** tokens/sec produced by one event business (auto-producing), with ×2 milestone bonuses */
export function eventGenRate(def: EventGenDef, count: number): number {
  if (count === 0) return 0;
  return (def.baseRev * count * milestoneMult(count)) / def.cycle;
}
export { milestoneMult as eventMilestoneMult, nextMilestone as eventNextMilestone };

/** bulk-buy cost (geometric series), mirroring the main game's buyCost */
export function eventBuyCost(
  def: EventGenDef, count: number, amount: number | 'max', tokens: number,
): { count: number; cost: number } {
  const r = def.costRate;
  const next = def.baseCost * Math.pow(r, count);
  if (amount === 'max') {
    if (tokens < next) return { count: 1, cost: next };
    const k = Math.floor(Math.log((tokens * (r - 1)) / next + 1) / Math.log(r));
    const n = Math.max(1, k);
    return { count: n, cost: (next * (Math.pow(r, n) - 1)) / (r - 1) };
  }
  const n = amount;
  return { count: n, cost: (next * (Math.pow(r, n) - 1)) / (r - 1) };
}

// ─── token → gem conversion (SMALL + CAPPED) ───
// Deliberately stingy: events are an engagement reward, not a gem faucet.
export const EVENT_GEM_CAP = 50;
export function eventGemsFor(tokensEarned: number): number {
  if (tokensEarned <= 0) return 0;
  return Math.min(EVENT_GEM_CAP, Math.floor(12 * Math.log10(1 + tokensEarned / 5000)));
}

// informational reward-track (token → total gems at that point)
export const EVENT_MILESTONES = [5e4, 5e5, 5e6, 5e7, 5e8].map((t) => ({ tokens: t, gems: eventGemsFor(t) }));
