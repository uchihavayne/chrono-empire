// Eon Upgrades — the top meta layer, bought with Eon Crystals (from Ascension). Permanent (never
// reset by rebirth OR ascension), so they give the 2nd prestige real long-term depth beyond its
// flat +income-per-eon bonus. Spending eons lowers that passive bonus (same hold-vs-spend tradeoff
// as Chrono Crystals ↔ skills), so each upgrade must out-earn the eons it costs.

export interface EonUpgradeDef {
  id: string; icon: string; maxLevel: number; baseCost: number; costRate: number; value: number;
}

export const EON_UPGRADES: EonUpgradeDef[] = [
  { id: 'eon_power',    icon: '🌌', maxLevel: 20, baseCost: 1, costRate: 1.5, value: 0.15 }, // +15% global income/lvl
  { id: 'eon_prestige', icon: '💠', maxLevel: 15, baseCost: 2, costRate: 1.6, value: 0.10 }, // +10% crystal gain/lvl
  { id: 'eon_speed',    icon: '⚡', maxLevel: 12, baseCost: 2, costRate: 1.6, value: 0.04 }, // +4% cycle speed/lvl
  { id: 'eon_offline',  icon: '🌙', maxLevel: 8,  baseCost: 1, costRate: 1.5, value: 2 },    // +2h offline cap/lvl
  { id: 'eon_cost',     icon: '🏷️', maxLevel: 10, baseCost: 2, costRate: 1.6, value: 0.015 },// -1.5% venture cost/lvl
];
export const EON_UPGRADE_BY_ID: Record<string, EonUpgradeDef> = Object.fromEntries(EON_UPGRADES.map((u) => [u.id, u]));

export function eonUpgradeCost(def: EonUpgradeDef, level: number): number {
  return Math.round(def.baseCost * Math.pow(def.costRate, level));
}
