// Event World — a limited-time PARALLEL world you switch into from the main game. It runs in
// rolling 10-day cycles: a fresh themed mini-idle where you earn Event Tokens 🎟️. When a cycle
// ends, the tokens you earned that cycle convert to Gems 💠 on a CAPPED curve (so events reward
// engagement without ever making players gem-rich), the world resets, and a new cycle begins.

import { milestoneMult } from './data';

export const EVENT_DURATION_DAYS = 10;
const DAY = 86_400_000;
export const EVENT_DURATION_MS = EVENT_DURATION_DAYS * DAY;
// fixed epoch so every device's cycles line up on the same 10-day boundaries
const EVENT_EPOCH = Date.UTC(2026, 0, 1); // 2026-01-01
export const EVENT_START_TOKENS = 30;     // granted at the start of each cycle to bootstrap
export const EVENT_OFFLINE_CAP_H = 8;

export interface EventGenDef { id: string; icon: string; baseCost: number; baseRev: number; cycle: number }

// "Temporal Rift Festival" — festival stalls scattered across the timeline
export const EVENT_GENS: EventGenDef[] = [
  { id: 'ev_confetti',  icon: '🎊', baseCost: 25,    baseRev: 1,    cycle: 1 },
  { id: 'ev_carousel',  icon: '🎠', baseCost: 500,   baseRev: 14,   cycle: 2 },
  { id: 'ev_fireworks', icon: '🎆', baseCost: 12_000, baseRev: 320,  cycle: 3 },
  { id: 'ev_ferris',    icon: '🎡', baseCost: 3e5,   baseRev: 9000, cycle: 5 },
];
export const EVENT_GEN_BY_ID: Record<string, EventGenDef> = Object.fromEntries(EVENT_GENS.map((g) => [g.id, g]));

/** which 10-day cycle we're in (changes every EVENT_DURATION_MS) */
export function eventCycleId(now = Date.now()): number {
  return Math.floor((now - EVENT_EPOCH) / EVENT_DURATION_MS);
}
/** ms timestamp when the current cycle ends */
export function eventEndsAt(now = Date.now()): number {
  return EVENT_EPOCH + (eventCycleId(now) + 1) * EVENT_DURATION_MS;
}

export function eventGenCost(def: EventGenDef, count: number): number {
  return def.baseCost * Math.pow(1.13, count);
}

/** tokens earned per second by one event business (auto-producing) */
export function eventGenRate(def: EventGenDef, count: number): number {
  if (count === 0) return 0;
  return (def.baseRev * count * milestoneMult(count)) / def.cycle;
}

// ─── token → gem conversion (CAPPED, diminishing) ───
export const EVENT_GEM_CAP = 200;
export function eventGemsFor(tokensEarned: number): number {
  if (tokensEarned <= 0) return 0;
  return Math.min(EVENT_GEM_CAP, Math.floor(38 * Math.log10(1 + tokensEarned / 200)));
}

// reward-track milestones shown in the UI (purely informational: token → total gems at that point)
export const EVENT_MILESTONES = [1e3, 1e4, 1e5, 1e6, 1e7, 1e8].map((t) => ({ tokens: t, gems: eventGemsFor(t) }));
