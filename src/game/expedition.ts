// Temporal Expeditions — the ACTIVE roguelite mode. The player dives into an "unstable
// timeline": a run of quick timed mini-stages. Clearing a stage banks Relic Shards and offers
// a draft pick (1 of 3 run-buffs). Shards buy PERMANENT relics (meta-progression that survives
// rebirth AND ascension). This is the game's skill-based counterweight to the idle economy.

// ─── run rules ───
export const EXP_STAGES = 10;          // stages in a full run
export const EXP_HEARTS = 3;           // lives per run
export const EXP_FREE_PER_DAY = 2;     // free runs per day
export const EXP_MAX_PER_DAY = 3;      // free + 1 more via rewarded ad
export const EXP_UNLOCK_ERAS = 3;      // unlocked at 3 eras (or any rebirth)
export const EXP_CLEAR_BONUS = 1.5;    // full-clear shard multiplier

export type StageKind = 'tap' | 'zone' | 'hunt';

export interface StageDef {
  kind: StageKind;
  timeSec: number;
  /** tap: taps needed · zone: golden hits needed · hunt: bubbles to pop */
  target: number;
  /** zone: width of the golden zone as a fraction of the bar (0..1) */
  zoneWidth: number;
  /** zone: marker oscillation speed (cycles/sec-ish) */
  zoneSpeed: number;
  /** hunt: bubble lifetime in seconds */
  bubbleLife: number;
}

/** deterministic difficulty curve; depth is 1-based */
export function stageForDepth(depth: number, rng: () => number = Math.random): StageDef {
  const kinds: StageKind[] = ['tap', 'zone', 'hunt'];
  const kind = kinds[Math.floor(rng() * kinds.length)];
  return {
    kind,
    timeSec: kind === 'tap' ? 10 : 12,
    target:
      kind === 'tap' ? 15 + depth * 3
      : kind === 'zone' ? 3
      : 6 + Math.floor(depth * 0.8),
    zoneWidth: Math.max(0.12, 0.26 - depth * 0.014),
    zoneSpeed: 0.55 + depth * 0.06,
    bubbleLife: Math.max(0.9, 1.5 - depth * 0.05),
  };
}

/** shards banked for clearing a stage at this depth */
export const shardsForStage = (depth: number): number => 2 + depth;

// ─── draft (run-buffs, picked 1-of-3 between stages) ───
export interface DraftDef { id: string; icon: string }
export const DRAFTS: DraftDef[] = [
  { id: 'time_plus',   icon: '⏱️' },  // +2s stage time (stacks)
  { id: 'ease',        icon: '🎯' },  // targets -12% (stacks)
  { id: 'zone_wide',   icon: '📏' },  // golden zone +40% wider
  { id: 'bubble_slow', icon: '🫧' },  // bubbles last +0.4s
  { id: 'heart_up',    icon: '❤️' },  // +1 heart immediately
  { id: 'shard_boost', icon: '💰' },  // +20% shards this run
];

/** pick 3 distinct draft options */
export function rollDraft(rng: () => number = Math.random): DraftDef[] {
  const pool = [...DRAFTS];
  const out: DraftDef[] = [];
  for (let i = 0; i < 3 && pool.length; i++) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return out;
}

// ─── permanent relics (shard-bought, survive rebirth + ascension) ───
export interface RelicDef {
  id: string;
  icon: string;
  maxLevel: number;
  baseCost: number;
  /** per-level effect magnitude, consumed by the engine (see comments) */
  value: number;
}

export const RELICS: RelicDef[] = [
  { id: 'relic_income',  icon: '🌀', maxLevel: 25, baseCost: 40, value: 0.04 }, // +4% global income/lvl
  { id: 'relic_speed',   icon: '⚡', maxLevel: 15, baseCost: 60, value: 0.02 }, // +2% cycle speed/lvl
  { id: 'relic_cost',    icon: '🪙', maxLevel: 10, baseCost: 80, value: 0.01 }, // -1% venture cost/lvl
  { id: 'relic_offline', icon: '🌙', maxLevel: 8,  baseCost: 50, value: 0.5 },  // +30min offline cap/lvl
  { id: 'relic_power',   icon: '🗡️', maxLevel: 10, baseCost: 30, value: 0.02 }, // +2% stage time/lvl (runs get easier)
];
export const RELIC_BY_ID: Record<string, RelicDef> = Object.fromEntries(RELICS.map((r) => [r.id, r]));

export function relicCost(def: RelicDef, level: number): number {
  return Math.round(def.baseCost * Math.pow(level + 1, 1.7));
}
