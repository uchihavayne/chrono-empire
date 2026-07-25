// Season Pass — a 30-day season with 3 refreshing DAILY TASKS that grant Season XP, and a
// reward track of tiers, each with a FREE reward (everyone) and a PREMIUM reward (unlocked by
// buying the pass). Rolling 30-day cycles like the event world. The single strongest retention +
// monetization system in an idle game.

export const SEASON_DURATION_DAYS = 30;
const DAY = 86_400_000;
export const SEASON_DURATION_MS = SEASON_DURATION_DAYS * DAY;
const SEASON_EPOCH = Date.UTC(2026, 0, 1);
export const SEASON_MAX_TIER = 30;
export const SEASON_XP_PER_TIER = 300;      // cumulative XP for each tier
export const SEASON_TASKS_PER_DAY = 3;

export function seasonId(now = Date.now()): number {
  return Math.floor((now - SEASON_EPOCH) / SEASON_DURATION_MS);
}
export function seasonEndsAt(now = Date.now()): number {
  return SEASON_EPOCH + (seasonId(now) + 1) * SEASON_DURATION_MS;
}

/** total XP needed to have reached a given tier (1-based) */
export const seasonTierXp = (tier: number): number => tier * SEASON_XP_PER_TIER;
/** tier reached for a total XP amount (0..SEASON_MAX_TIER) */
export function seasonTierForXp(xp: number): number {
  return Math.min(SEASON_MAX_TIER, Math.floor(xp / SEASON_XP_PER_TIER));
}

// ─── daily tasks ───
export type TaskId = 'buy' | 'earn' | 'boxes' | 'spins' | 'exped';
export interface TaskDef { id: TaskId; xp: number; icon: string }
export const TASK_POOL: TaskDef[] = [
  { id: 'buy',   xp: 120, icon: '🏭' }, // buy N businesses
  { id: 'earn',  xp: 120, icon: '💰' }, // earn N cash
  { id: 'boxes', xp: 110, icon: '🎁' }, // open N card boxes
  { id: 'spins', xp: 100, icon: '🎡' }, // spin the daily wheel
  { id: 'exped', xp: 130, icon: '🌀' }, // run an expedition
];
export interface SeasonTask { id: TaskId; target: number; xp: number; claimed: boolean }

/** pick SEASON_TASKS_PER_DAY distinct tasks with targets scaled to the player's progress */
export function assignTasks(incomePerSec: number, rng: () => number = Math.random): SeasonTask[] {
  const pool = [...TASK_POOL];
  const out: SeasonTask[] = [];
  for (let i = 0; i < SEASON_TASKS_PER_DAY && pool.length; i++) {
    const def = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    let target = 1;
    switch (def.id) {
      case 'buy': target = 40; break;
      case 'earn': target = Math.max(2000, Math.round(incomePerSec * 300)); break;
      case 'boxes': target = 2; break;
      case 'spins': target = 1; break;
      case 'exped': target = 1; break;
    }
    out.push({ id: def.id, target, xp: def.xp, claimed: false });
  }
  return out;
}

// ─── reward track ───
export type RewardKind = 'cash' | 'gems' | 'card' | 'boost';
export interface Reward { kind: RewardKind; amount: number }

/** FREE-track reward for a tier (modest) */
export function seasonFreeReward(tier: number): Reward {
  if (tier % 10 === 0) return { kind: 'gems', amount: 25 };
  if (tier % 5 === 0) return { kind: 'card', amount: 3 };
  if (tier % 3 === 0) return { kind: 'gems', amount: 8 };
  return { kind: 'cash', amount: 900 }; // income-relative in the engine
}
/** PREMIUM-track reward for a tier (buyer value: gems most tiers) */
export function seasonPremiumReward(tier: number): Reward {
  if (tier % 10 === 0) return { kind: 'gems', amount: 60 };
  if (tier % 4 === 0) return { kind: 'boost', amount: 60 };
  if (tier % 3 === 0) return { kind: 'card', amount: 5 };
  return { kind: 'gems', amount: 12 };
}
