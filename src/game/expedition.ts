// Temporal Expeditions — a DECISION-BASED push-your-luck roguelite (no reflex tapping).
// You dive into an unstable timeline and, at each node, pick 1 of a few event "doors": a safe
// drift, a risky rift (a % gamble), a greedy trade, a relic echo (run-buff), a healing haven, or
// a rare paradox jackpot. Winning banks Relic Shards; a bad gamble drains Stability. Escape any
// time to bank 100% — but if Stability hits 0 the timeline collapses and you keep only half.
// Shards buy PERMANENT relics (meta-progression that survives rebirth AND ascension).

// ─── run rules ───
export const EXP_START_STABILITY = 100;
export const EXP_COLLAPSE_KEEP = 0.5;   // fraction of banked shards kept on a collapse
export const EXP_FREE_PER_DAY = 2;      // free runs per day
export const EXP_MAX_PER_DAY = 3;       // free + 1 more via rewarded ad
export const EXP_UNLOCK_ERAS = 3;       // unlocked at 3 eras (or any rebirth)

export type OfferKind = 'safe' | 'gamble' | 'greed' | 'heal' | 'relic' | 'jackpot';

export interface Offer {
  kind: OfferKind;
  shards: number;     // reward magnitude (safe/greed guaranteed; gamble/jackpot on success)
  odds: number;       // success probability 0..1 (gamble/jackpot)
  stability: number;  // stability delta (heal +, greed/gamble-fail −)
  buff?: string;      // run-buff id when kind === 'relic'
}

// ─── run-buffs (relic echoes picked DURING a run; reset each run) ───
export interface RunBuffDef { id: string; icon: string }
export const RUN_BUFFS: RunBuffDef[] = [
  { id: 'shard_mult', icon: '💰' }, // +30% shards gained for the rest of the run
  { id: 'lucky',      icon: '🍀' }, // +8% to every gamble's odds
  { id: 'shield',     icon: '🛡️' }, // block the next Stability loss
  { id: 'regen',      icon: '💠' }, // +6 Stability after each node
];

export interface RunState {
  shards: number;                     // banked THIS run (not yet permanent)
  stability: number;
  depth: number;
  buffs: Record<string, number>;      // run-buff id → stacks
}

export const newRun = (): RunState => ({ shards: 0, stability: EXP_START_STABILITY, depth: 0, buffs: {} });

const rint = (rng: () => number, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));

// ─── offer constructors (values scale with depth) ───
function safe(depth: number, rng: () => number): Offer {
  return { kind: 'safe', shards: 2 + depth + rint(rng, 0, 2), odds: 1, stability: 0 };
}
function heal(rng: () => number): Offer {
  return { kind: 'heal', shards: rint(rng, 1, 3), odds: 1, stability: rint(rng, 18, 28) };
}
function greed(depth: number, rng: () => number): Offer {
  return { kind: 'greed', shards: 6 + depth * 2 + rint(rng, 0, 3), odds: 1, stability: -(10 + Math.floor(depth * 1.2)) };
}
function gamble(depth: number, rng: () => number): Offer {
  const odds = Math.max(0.42, 0.72 - depth * 0.025);      // riskier as you go deeper
  return { kind: 'gamble', shards: 9 + depth * 3 + rint(rng, 0, 4), odds, stability: -(14 + depth * 2) };
}
function jackpot(depth: number, rng: () => number): Offer {
  return { kind: 'jackpot', shards: 30 + depth * 6 + rint(rng, 0, 10), odds: 0.4, stability: 0 };
}
function relicOffer(rng: () => number): Offer {
  const b = RUN_BUFFS[Math.floor(rng() * RUN_BUFFS.length)];
  return { kind: 'relic', shards: 0, odds: 1, stability: 0, buff: b.id };
}

/** the 2–3 doors shown at a node — always a real decision (a safe-ish AND a risky option) */
export function rollNode(depth: number, rng: () => number = Math.random): Offer[] {
  const offers: Offer[] = [];
  offers.push(rng() < 0.68 ? safe(depth, rng) : heal(rng));
  offers.push(rng() < 0.5 ? gamble(depth, rng) : greed(depth, rng));
  const r = rng();
  if (depth >= 4 && r < 0.16) offers.push(jackpot(depth, rng));
  else if (r < 0.5) offers.push(relicOffer(rng));
  else offers.push(rng() < 0.5 ? safe(depth, rng) : gamble(depth, rng));
  // shuffle so the risky door isn't always in the same slot
  for (let i = offers.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [offers[i], offers[j]] = [offers[j], offers[i]];
  }
  return offers;
}

export interface Resolution {
  dShards: number;      // shards gained (after buffs)
  dStability: number;   // stability change applied
  success?: boolean;    // for gamble/jackpot
  buff?: string;        // run-buff gained
  wipedBank?: boolean;  // jackpot failure wiped this run's banked shards
}

/** pure resolution of a chosen door against the current run (buffs affect odds & shard gains) */
export function resolveOffer(offer: Offer, run: RunState, rng: () => number = Math.random): Resolution {
  const mult = 1 + 0.3 * (run.buffs.shard_mult ?? 0);
  const luck = 0.08 * (run.buffs.lucky ?? 0);
  const gain = (n: number) => Math.round(n * mult);

  switch (offer.kind) {
    case 'safe':
      return { dShards: gain(offer.shards), dStability: 0 };
    case 'heal':
      return { dShards: gain(offer.shards), dStability: offer.stability };
    case 'greed':
      return { dShards: gain(offer.shards), dStability: applyLoss(offer.stability, run) };
    case 'relic':
      return { dShards: 0, dStability: 0, buff: offer.buff };
    case 'gamble': {
      const success = rng() < Math.min(0.95, offer.odds + luck);
      return success
        ? { dShards: gain(offer.shards), dStability: 0, success: true }
        : { dShards: 0, dStability: applyLoss(offer.stability, run), success: false };
    }
    case 'jackpot': {
      const success = rng() < Math.min(0.9, offer.odds + luck);
      return success
        ? { dShards: gain(offer.shards), dStability: 0, success: true }
        : { dShards: -run.shards, dStability: 0, success: false, wipedBank: true };
    }
  }
}

/** a shield stack blocks the next Stability loss entirely */
function applyLoss(delta: number, run: RunState): number {
  if (delta < 0 && (run.buffs.shield ?? 0) > 0) { run.buffs.shield--; return 0; }
  return delta;
}

// ─── permanent relics (shard-bought; survive rebirth + ascension) ───
export interface RelicDef { id: string; icon: string; maxLevel: number; baseCost: number; value: number }
export const RELICS: RelicDef[] = [
  { id: 'relic_income',  icon: '🌀', maxLevel: 25, baseCost: 40, value: 0.04 }, // +4% global income/lvl
  { id: 'relic_speed',   icon: '⚡', maxLevel: 15, baseCost: 60, value: 0.02 }, // +2% cycle speed/lvl
  { id: 'relic_cost',    icon: '🪙', maxLevel: 10, baseCost: 80, value: 0.01 }, // -1% venture cost/lvl
  { id: 'relic_offline', icon: '🌙', maxLevel: 8,  baseCost: 50, value: 0.5 },  // +30min offline cap/lvl
  { id: 'relic_start',   icon: '🛡️', maxLevel: 10, baseCost: 45, value: 5 },    // +5 starting Stability/lvl
];
export const RELIC_BY_ID: Record<string, RelicDef> = Object.fromEntries(RELICS.map((r) => [r.id, r]));

export function relicCost(def: RelicDef, level: number): number {
  return Math.round(def.baseCost * Math.pow(level + 1, 1.7));
}
