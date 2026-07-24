// Event World — a limited-time PARALLEL world that plays exactly like the main game, in miniature:
// festival STAGES (like eras) each with 4 businesses (levels + ×2 milestones), and you UNLOCK the
// next stage with tokens to keep growing. Runs in rolling 10-day cycles; at the end your earned
// Event Tokens 🎟️ convert to a SMALL, capped number of Gems (an engagement reward, not a faucet),
// then the world resets. Progression is stage-gated so tokens can't be trivially farmed.

import { milestoneMult, nextMilestone } from './data';

export const EVENT_DURATION_DAYS = 10;
const DAY = 86_400_000;
export const EVENT_DURATION_MS = EVENT_DURATION_DAYS * DAY;
const EVENT_EPOCH = Date.UTC(2026, 0, 1);
export const EVENT_START_TOKENS = 20;
export const EVENT_OFFLINE_CAP_H = 8;
export const EVENT_BOOST_MULT = 3;
export const EVENT_BOOST_MIN = 60;

// ─── stages (like eras) — unlocking one adds 4 businesses AND multiplies all event income ───
export interface EventStageDef { id: string; icon: string; mult: number; unlockCost: number }
export const EVENT_STAGES: EventStageDef[] = [
  { id: 'fair',     icon: '🎪', mult: 1,    unlockCost: 0 },
  { id: 'bazaar',   icon: '🏮', mult: 1.9,  unlockCost: 5e3 },
  { id: 'carnival', icon: '🎡', mult: 3.4,  unlockCost: 4e5 },
  { id: 'expo',     icon: '🎆', mult: 6.2,  unlockCost: 3e7 },
  { id: 'cosmic',   icon: '🌌', mult: 11.5, unlockCost: 2e9 },
];

export interface EventGenDef {
  id: string; icon: string; stage: number; g: number;
  baseCost: number; baseRev: number; cycle: number; costRate: number;
}

// 4 businesses per stage (global index g = stage*4 + slot). Income deliberately LAGS cost, so the
// only way to keep growing is to unlock the next stage (which multiplies everything).
const RAW: [string, string][] = [
  ['ev_confetti', '🎊'], ['ev_popcorn', '🍿'], ['ev_balloon', '🎈'], ['ev_carousel', '🎠'], // fair
  ['ev_lantern', '🏮'], ['ev_fortune', '🔮'], ['ev_spice', '🫖'], ['ev_firedance', '🔥'],    // bazaar
  ['ev_organ', '🎵'], ['ev_ferris', '🎡'], ['ev_fireworks', '🎆'], ['ev_automaton', '🤖'],   // carnival
  ['ev_arcade', '🕹️'], ['ev_laser', '🔦'], ['ev_hover', '🛸'], ['ev_hologram', '📽️'],       // expo
  ['ev_starcaro', '🌟'], ['ev_nebula', '☄️'], ['ev_coaster', '🎢'], ['ev_portal', '🌀'],     // cosmic
];
export const EVENT_GENS: EventGenDef[] = RAW.map(([id, icon], g) => {
  const stage = Math.floor(g / 4);
  const cycle = 1 + stage;                       // 1s (fair) … 5s (cosmic)
  return {
    id, icon, stage, g,
    baseCost: 15 * Math.pow(3.1, g),
    baseRev: 0.6 * cycle * Math.pow(2.42, g),    // payback grows with g → need the next stage
    cycle,
    costRate: 1.10 + stage * 0.006,
  };
});
export const EVENT_GEN_BY_ID: Record<string, EventGenDef> = Object.fromEntries(EVENT_GENS.map((g) => [g.id, g]));
export const eventStageGens = (stage: number): EventGenDef[] => EVENT_GENS.filter((g) => g.stage === stage);

export function eventCycleId(now = Date.now()): number {
  return Math.floor((now - EVENT_EPOCH) / EVENT_DURATION_MS);
}
export function eventEndsAt(now = Date.now()): number {
  return EVENT_EPOCH + (eventCycleId(now) + 1) * EVENT_DURATION_MS;
}

/** raw tokens/sec from one business (BEFORE the stage multiplier), with ×2 milestone bonuses */
export function eventGenRate(def: EventGenDef, count: number): number {
  if (count === 0) return 0;
  return (def.baseRev * count * milestoneMult(count)) / def.cycle;
}
export { milestoneMult as eventMilestoneMult, nextMilestone as eventNextMilestone };

/** bulk-buy cost + count (geometric series), mirroring the main game's buyCost */
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

// ─── token → gem conversion (SMALL + CAPPED; and stage-gated by progression above) ───
export const EVENT_GEM_CAP = 50;
export function eventGemsFor(tokensEarned: number): number {
  if (tokensEarned <= 0) return 0;
  return Math.min(EVENT_GEM_CAP, Math.floor(12 * Math.log10(1 + tokensEarned / 5000)));
}
export const EVENT_MILESTONES = [5e4, 5e5, 5e6, 5e7, 5e8].map((t) => ({ tokens: t, gems: eventGemsFor(t) }));
