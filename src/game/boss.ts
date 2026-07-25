// Time Keeper bosses — a timed encounter every 5 eras (5/10/15). Start the fight and you must
// earn a target amount of cash within a short window; the target = several minutes of your current
// income, so you have to lean on boosts / active buying to win. Beating it grants a big reward.

export const BOSS_TIERS = [5, 10, 15];        // era thresholds a Time Keeper appears at
export const BOSS_DURATION_S = 180;           // 3-minute fight
export const BOSS_TARGET_SECONDS = 240;       // must earn ~4 min of income in 3 min → needs a boost

export interface BossReward { gems: number; cards: number }
export function bossReward(threshold: number): BossReward {
  // bigger bosses, bigger rewards
  const i = BOSS_TIERS.indexOf(threshold);
  return { gems: 40 + i * 30, cards: 2 + i };
}
