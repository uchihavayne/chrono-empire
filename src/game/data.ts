// ─── Static game data: eras (chapters/worlds), generators, upgrades, skills, achievements ───
//
// STRUCTURE: 18 eras act as chapters — six prehistoric (Paleolithic→Iron), then
// civilizations from the First Turks onward. Each era holds 4 unique ventures (First
// Turks holds 8). Unlocking the next era costs cash, grants its ventures and a permanent
// ×2 global multiplier. The game does not "end": after Far Future come Galactic and Cosmic.
//
// BALANCE MODEL:
//  - Era base cost grows ×2500 per era → each chapter is a fresh number scale.
//  - Cycle time is MONOTONIC across the whole game (global venture index), so a later
//    era's first venture is always slower than an earlier era's last — Fire Pit is the
//    fastest thing in the game, the Cosmic ventures the slowest.
//  - Milestones (10/50/100/250/500/1000 owned) both DOUBLE output and SPEED UP the cycle.
//  - Early era unlocks are deliberately expensive so Stone→Egypt takes real play time.

export interface EraDef {
  id: string;
  icon: string;
  /** permanent global income multiplier once this era is unlocked */
  mult: number;
  theme: string;
  /** cash cost to unlock this era (0 for the first) */
  unlockCost: number;
}

// Era order: First Turks come right after the Stone Age. Ottoman Empire is a
// dedicated civilization chapter. Eras can have DIFFERENT venture counts
// (First Turks has 8; the rest have 4).
export const ERA_IDS = [
  'paleo', 'meso', 'neo', 'copper', 'bronze', 'iron',
  'turkic', 'egypt', 'rome', 'medieval', 'ottoman', 'renaissance',
  'industrial', 'modern', 'space', 'future', 'galactic', 'cosmic',
] as const;
const ERA_ICONS = ['🔥', '🏹', '🌾', '🪙', '🛡️', '⚒️', '🐺', '🏺', '🏛️', '⚔️', '🕌', '🎨', '🏭', '🌆', '🚀', '🌌', '🌠', '✨'];

export interface GeneratorDef {
  id: string;
  era: number;   // index into ERAS
  slot: number;  // index within the era
  baseCost: number;
  costRate: number;
  baseRev: number;    // revenue per completed cycle per unit
  cycleTime: number;  // seconds per cycle (base, before milestones/upgrades)
  managerCost: number;
}

/** ventures per era, cheap→expensive. First Turks holds 8; others hold 4. */
const GEN_IDS: string[][] = [
  ['firepit', 'huntcamp', 'mammoth', 'carver'],                                  // Paleolithic (Eski Taş)
  ['harpoon', 'fishtrap', 'dugout', 'dogpack'],                                  // Mesolithic (Orta Taş)
  ['wheatfield', 'pottery', 'mudbrick', 'gobekli'],                              // Neolithic (Yeni Taş)
  ['coppersmelt', 'coppertools', 'cylseal', 'coppermine'],                       // Copper / Chalcolithic
  ['bronzeforge', 'ziggurat', 'scribe', 'tradeship'],                            // Bronze
  ['ironbloom', 'ironsmith', 'chariot', 'hillfort'],                             // Iron
  ['yurt', 'kimiz', 'archer', 'horsefarm', 'caravan', 'orkhon', 'kurgan', 'khagan'], // First Turks (8)
  ['papyrus', 'nilefarm', 'pyramid', 'pharaoh'],                                 // Egypt
  ['bazaar', 'legion', 'arena', 'baths'],                                        // Rome
  ['forge', 'mill', 'tourney', 'alchemy'],                                       // Medieval
  ['grandbazaar', 'janissary', 'mosque', 'topkapi'],                             // Ottoman
  ['atelier', 'press', 'bank', 'opera'],                                         // Renaissance
  ['steamworks', 'railway', 'coalmine', 'steel'],                                // Industrial
  ['technocorp', 'social', 'gamedev', 'satnet'],                                 // Modern
  ['mooncolony', 'marsmine', 'asteroid', 'shipyard'],                            // Space
  ['aicore', 'quantum', 'dyson', 'timeengine'],                                  // Far Future
  ['starport', 'galfleet', 'ringworld', 'nebula'],                               // Galactic
  ['wormhole', 'multiverse', 'singularity', 'godcore'],                          // Cosmic
];

export const ERAS_COUNT = ERA_IDS.length;
export const TOTAL_VENTURES = GEN_IDS.reduce((a, ids) => a + ids.length, 0);

/** global index (0..TOTAL-1) where each era's first venture sits */
const ERA_START_G: number[] = (() => {
  const out: number[] = [];
  let acc = 0;
  for (const ids of GEN_IDS) { out.push(acc); acc += ids.length; }
  return out;
})();

// ─── Single MONOTONIC economy curve across the whole game ───
// Cost and income per second both rise with the global venture index g, so the
// FIRST venture of any era always costs more AND earns more than the LAST venture
// of the previous era. No per-era resets — that was the old bug.
const COST_GROWTH = 3.2;       // each successive venture's base cost ≈ ×3.2
export function baseCostAt(g: number): number {
  return 5 * Math.pow(COST_GROWTH, g);
}
/** seconds to recoup one unit at base. Payback grows FASTER per venture than in a
 *  naive curve, so income deliberately falls behind the cost curve as you advance —
 *  by the mid-game raw cash stalls and the Chrono-Crystal prestige multiplier becomes
 *  the only way forward. That rebirth loop is what gives the game its long, daily arc. */
function paybackAt(g: number): number {
  // 1.30 (was 1.14): income grows much SLOWER than cost per venture, so raw cash falls behind
  // the cost curve fast. Together with the tamed ×1.6/era income mult this makes progression get
  // HARDER each era (not easier) — a first run stalls around the mid-game and MUST rebirth.
  return 40 * Math.pow(1.30, g);
}
/** base cycle time (seconds), monotonic; fast early, up to 15 min for the last ventures */
function baseCycle(g: number): number {
  return Math.min(1.0 * Math.pow(1.145, g), 900);
}

/** base cost scale of each era = cost of its entry venture (used by unlocks & quest floors) */
export const ERA_BASE = ERA_IDS.map((_, i) => baseCostAt(ERA_START_G[i]));

/** unlock cost = a multiple of the new era's entry venture. Ramps hard in the late
 *  game so raw cash alone can't reach the final eras — you MUST rebirth for the
 *  Chrono-Crystal multiplier to break through. That is the long-term retention wall. */
const ERA_UNLOCK_FACTOR = [
  0, 35, 55, 90, 150, 260,                    // paleo→iron: real gates, no free skipping
  600, 1600, 5000, 18000, 70000, 3e5,         // turkic→renaissance (first run walls in here)
  1.4e6, 7e6, 4e7, 2.5e8, 1.8e9, 1.5e10,      // industrial→cosmic (many rebirths + ascensions)
];

export const ERAS: EraDef[] = ERA_IDS.map((id, i) => ({
  id,
  icon: ERA_ICONS[i],
  mult: Math.pow(1.6, i), // per-era income mult (was 2 — that let income explode & outpace cost)
  theme: `era-${id}`,
  unlockCost: i === 0 ? 0 : ERA_BASE[i] * ERA_UNLOCK_FACTOR[i],
}));

export const GENERATORS: GeneratorDef[] = (() => {
  const out: GeneratorDef[] = [];
  let g = 0; // running global venture index across ALL eras
  GEN_IDS.forEach((ids, era) => {
    const n = ids.length;
    ids.forEach((id, slot) => {
      const f = n <= 1 ? 0 : slot / (n - 1);
      const baseCost = baseCostAt(g);
      const cycleTime = baseCycle(g);
      out.push({
        id,
        era,
        slot,
        baseCost,
        costRate: 1.11 - 0.02 * f,          // 1.11 (cheap slots) → 1.09 (pricey slots)
        cycleTime,
        baseRev: Math.max((baseCost * cycleTime) / paybackAt(g), 1),
        managerCost: baseCost * (650 - 400 * f), // 650× (slot 0) → 250× (top): automation is now a real investment, not instant
      });
      g++;
    });
  });
  return out;
})();

export const GEN_BY_ID: Record<string, GeneratorDef> = Object.fromEntries(
  GENERATORS.map((g) => [g.id, g]),
);

// Speed-up milestones: owning more of a venture also shortens its cycle.
const SPEED_MILESTONES = [10, 50, 100, 250, 500, 1000, 2000];
/** cycle-time multiplier (<1 = faster) from owning `count` units */
export function milestoneSpeed(count: number): number {
  let tiers = 0;
  for (const t of SPEED_MILESTONES) if (count >= t) tiers++;
  return Math.pow(0.9, tiers); // each tier = 10% faster
}

// Milestone counts that double a generator's output.
// Tail is deliberately tamed (every 1000 late, not every 100) so income can't run
// away and let players idle-skip whole eras — progression must stay earned.
const DOUBLE_MILESTONES = [10, 25, 50, 100, 250, 500, 1000];
export function milestoneMult(count: number): number {
  let m = 0;
  for (const t of DOUBLE_MILESTONES) if (count >= t) m++;
  if (count > 1000) m += Math.floor((count - 1000) / 1000); // every 1000 after
  return Math.pow(2, m);
}

export function nextMilestone(count: number): number {
  for (const t of DOUBLE_MILESTONES) if (count < t) return t;
  return (Math.floor((count - 1000) / 1000) + 1) * 1000 + 1000;
}

export interface UpgradeDef {
  id: string;
  target: string | 'all';
  mult: number;
  cost: number;
}

// Cash upgrades: three tiers per venture (×3, ×3, ×5) plus global tiers.
export const UPGRADES: UpgradeDef[] = [
  ...GENERATORS.flatMap((g): UpgradeDef[] => [
    { id: `${g.id}_u1`, target: g.id, mult: 3, cost: g.baseCost * 1.5e3 },
    { id: `${g.id}_u2`, target: g.id, mult: 3, cost: g.baseCost * 3e6 },
    { id: `${g.id}_u3`, target: g.id, mult: 4, cost: g.baseCost * 6e9 },
  ]),
  // Global upgrades: mults tamed (was up to ×7 → total ×661k; now total ~×13.8k) and costs
  // spaced tighter, so they no longer hand you a flat boost big enough to skip whole eras.
  { id: 'global_1', target: 'all', mult: 2, cost: 1e5 },
  { id: 'global_2', target: 'all', mult: 2, cost: 3e6 },
  { id: 'global_3', target: 'all', mult: 2, cost: 1e8 },
  { id: 'global_4', target: 'all', mult: 2, cost: 4e9 },
  { id: 'global_5', target: 'all', mult: 2, cost: 1e11 },
  { id: 'global_6', target: 'all', mult: 3, cost: 3e12 },
  { id: 'global_7', target: 'all', mult: 3, cost: 1e14 },
  { id: 'global_8', target: 'all', mult: 3, cost: 4e15 },
  { id: 'global_9', target: 'all', mult: 4, cost: 1e17 },
  { id: 'global_10', target: 'all', mult: 4, cost: 3e18 },
];

export const UPGRADE_BY_ID: Record<string, UpgradeDef> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u]),
);

export interface SkillDef {
  id: string;
  icon: string;
  maxLevel: number;
  baseCost: number;
  costRate: number;
}

export const SKILLS: SkillDef[] = [
  { id: 'chrono_power',  icon: '💎', maxLevel: 10, baseCost: 10,  costRate: 1.8 },
  { id: 'head_start',    icon: '🚀', maxLevel: 5,  baseCost: 15,  costRate: 2.2 },
  { id: 'offline_cap',   icon: '🌙', maxLevel: 4,  baseCost: 20,  costRate: 2.0 },
  { id: 'cheap_deals',   icon: '🏷️', maxLevel: 5,  baseCost: 25,  costRate: 2.0 },
  { id: 'fast_cycles',   icon: '⚡', maxLevel: 5,  baseCost: 30,  costRate: 2.2 },
  { id: 'golden_touch',  icon: '✨', maxLevel: 4,  baseCost: 20,  costRate: 2.0 },
  { id: 'ad_master',     icon: '📺', maxLevel: 4,  baseCost: 15,  costRate: 2.0 },
  { id: 'keep_managers', icon: '🎩', maxLevel: 3,  baseCost: 50,  costRate: 3.0 },
];

export const SKILL_BY_ID: Record<string, SkillDef> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
);

export function skillCost(def: SkillDef, level: number): number {
  return Math.round(def.baseCost * Math.pow(def.costRate, level));
}

export type AchKind = 'own' | 'earn' | 'rebirth' | 'ads' | 'anomaly' | 'managers' | 'era';

export interface AchievementDef {
  id: string;
  kind: AchKind;
  target?: string;
  n: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'own_firepit_100',   kind: 'own', target: 'firepit', n: 100 },
  { id: 'own_huntcamp_100',  kind: 'own', target: 'huntcamp', n: 100 },
  { id: 'own_pyramid_50',    kind: 'own', target: 'pyramid', n: 50 },
  { id: 'own_arena_50',      kind: 'own', target: 'arena', n: 50 },
  { id: 'own_alchemy_50',    kind: 'own', target: 'alchemy', n: 50 },
  { id: 'own_bank_50',       kind: 'own', target: 'bank', n: 50 },
  { id: 'own_steel_50',      kind: 'own', target: 'steel', n: 50 },
  { id: 'own_satnet_50',     kind: 'own', target: 'satnet', n: 50 },
  { id: 'own_shipyard_25',   kind: 'own', target: 'shipyard', n: 25 },
  { id: 'own_dyson_25',      kind: 'own', target: 'dyson', n: 25 },
  { id: 'own_timeengine_10', kind: 'own', target: 'timeengine', n: 10 },
  { id: 'own_khagan_25',     kind: 'own', target: 'khagan', n: 25 },
  { id: 'own_godcore_10',    kind: 'own', target: 'godcore', n: 10 },
  { id: 'own_kimiz_50',      kind: 'own', target: 'kimiz', n: 50 },
  { id: 'own_topkapi_25',    kind: 'own', target: 'topkapi', n: 25 },
  { id: 'era_3',  kind: 'era', n: 3 },
  { id: 'era_7',  kind: 'era', n: 7 },
  { id: 'era_11', kind: 'era', n: 11 },
  { id: 'era_15', kind: 'era', n: 15 },
  { id: 'era_18', kind: 'era', n: 18 },
  { id: 'earn_1e6',   kind: 'earn', n: 1e6 },
  { id: 'earn_1e9',   kind: 'earn', n: 1e9 },
  { id: 'earn_1e12',  kind: 'earn', n: 1e12 },
  { id: 'earn_1e15',  kind: 'earn', n: 1e15 },
  { id: 'earn_1e18',  kind: 'earn', n: 1e18 },
  { id: 'earn_1e21',  kind: 'earn', n: 1e21 },
  { id: 'earn_1e25',  kind: 'earn', n: 1e25 },
  { id: 'earn_1e30',  kind: 'earn', n: 1e30 },
  { id: 'rebirth_1',  kind: 'rebirth', n: 1 },
  { id: 'rebirth_3',  kind: 'rebirth', n: 3 },
  { id: 'rebirth_10', kind: 'rebirth', n: 10 },
  { id: 'rebirth_25', kind: 'rebirth', n: 25 },
  { id: 'ads_5',      kind: 'ads', n: 5 },
  { id: 'ads_25',     kind: 'ads', n: 25 },
  { id: 'ads_100',    kind: 'ads', n: 100 },
  { id: 'anomaly_5',  kind: 'anomaly', n: 5 },
  { id: 'anomaly_25', kind: 'anomaly', n: 25 },
  { id: 'anomaly_100',kind: 'anomaly', n: 100 },
  { id: 'managers_36', kind: 'managers', n: 36 },
  { id: 'managers_56', kind: 'managers', n: TOTAL_VENTURES },
];

/** each achievement grants +2% global income */
export const ACH_BONUS = 0.02;

// ─── Quest chain (account-level, survives rebirth) ───
// A single always-visible "next goal" that walks the player through all 9 eras,
// teaches every system (managers, ads, anomalies, rebirth) and pays escalating rewards.

export type QuestKind = 'own' | 'era' | 'managers' | 'ads' | 'anomaly' | 'rebirth' | 'earn';

export interface QuestDef {
  id: string;
  kind: QuestKind;
  target?: string;
  n: number;
  /** cash reward measured in minutes of current production (with an era-scaled floor) */
  cashMins?: number;
  crystals?: number;
}

export const QUESTS: QuestDef[] = [
  // Paleolithic
  { id: 'q01', kind: 'own', target: 'firepit', n: 10, cashMins: 10 },
  { id: 'q02', kind: 'own', target: 'huntcamp', n: 5, cashMins: 10 },
  { id: 'q03', kind: 'managers', n: 1, cashMins: 15 },
  { id: 'q04', kind: 'own', target: 'carver', n: 3, cashMins: 20 },
  // Mesolithic
  { id: 'q05', kind: 'era', n: 2, crystals: 2 },
  { id: 'q06', kind: 'own', target: 'fishtrap', n: 15, cashMins: 15 },
  { id: 'q07', kind: 'own', target: 'dogpack', n: 8, cashMins: 20 },
  // Neolithic
  { id: 'q08', kind: 'era', n: 3, crystals: 3 },
  { id: 'q09', kind: 'anomaly', n: 1, crystals: 2 },
  { id: 'q10', kind: 'own', target: 'wheatfield', n: 25, cashMins: 18 },
  { id: 'q11', kind: 'own', target: 'gobekli', n: 8, cashMins: 25 },
  // Copper
  { id: 'q12', kind: 'era', n: 4, crystals: 4 },
  { id: 'q13', kind: 'managers', n: 12, cashMins: 22 },
  { id: 'q14', kind: 'own', target: 'coppermine', n: 10, cashMins: 25 },
  // Bronze
  { id: 'q15', kind: 'era', n: 5, crystals: 6 },
  { id: 'q16', kind: 'own', target: 'ziggurat', n: 15, cashMins: 25 },
  { id: 'q17', kind: 'own', target: 'tradeship', n: 8, cashMins: 30 },
  // Iron
  { id: 'q18', kind: 'era', n: 6, crystals: 8 },
  { id: 'q19', kind: 'own', target: 'ironbloom', n: 25, cashMins: 28 },
  { id: 'q20', kind: 'own', target: 'hillfort', n: 8, cashMins: 32 },
  // First Turks
  { id: 'q21', kind: 'era', n: 7, crystals: 12 },
  { id: 'q22', kind: 'own', target: 'yurt', n: 25, cashMins: 25 },
  { id: 'q23', kind: 'managers', n: 24, cashMins: 30 },
  { id: 'q24', kind: 'own', target: 'khagan', n: 10, cashMins: 35 },
  // Egypt
  { id: 'q25', kind: 'era', n: 8, crystals: 16 },
  { id: 'q26', kind: 'ads', n: 1, cashMins: 30 },
  { id: 'q27', kind: 'own', target: 'pharaoh', n: 15, cashMins: 35 },
  // Rome
  { id: 'q28', kind: 'era', n: 9, crystals: 20 },
  { id: 'q29', kind: 'anomaly', n: 5, crystals: 5 },
  { id: 'q30', kind: 'own', target: 'baths', n: 15, cashMins: 40 },
  // Medieval
  { id: 'q31', kind: 'era', n: 10, crystals: 26 },
  { id: 'q32', kind: 'own', target: 'alchemy', n: 15, cashMins: 40 },
  // Ottoman
  { id: 'q33', kind: 'era', n: 11, crystals: 32 },
  { id: 'q34', kind: 'own', target: 'topkapi', n: 15, cashMins: 45 },
  { id: 'q35', kind: 'rebirth', n: 1, crystals: 40 },
  // Renaissance
  { id: 'q36', kind: 'era', n: 12, crystals: 42 },
  { id: 'q37', kind: 'ads', n: 10, crystals: 10 },
  { id: 'q38', kind: 'own', target: 'opera', n: 15, cashMins: 50 },
  // Industrial
  { id: 'q39', kind: 'era', n: 13, crystals: 55 },
  { id: 'q40', kind: 'own', target: 'steel', n: 25, cashMins: 50 },
  // Modern
  { id: 'q41', kind: 'era', n: 14, crystals: 70 },
  { id: 'q42', kind: 'anomaly', n: 25, crystals: 14 },
  { id: 'q43', kind: 'own', target: 'satnet', n: 25, cashMins: 55 },
  // Space
  { id: 'q44', kind: 'era', n: 15, crystals: 90 },
  { id: 'q45', kind: 'managers', n: 55, cashMins: 60 },
  { id: 'q46', kind: 'own', target: 'shipyard', n: 25, cashMins: 65 },
  // Far Future
  { id: 'q47', kind: 'era', n: 16, crystals: 120 },
  { id: 'q48', kind: 'own', target: 'timeengine', n: 15, cashMins: 90 },
  { id: 'q49', kind: 'rebirth', n: 3, crystals: 90 },
  // Galactic
  { id: 'q50', kind: 'era', n: 17, crystals: 160 },
  { id: 'q51', kind: 'own', target: 'nebula', n: 15, cashMins: 100 },
  // Cosmic
  { id: 'q52', kind: 'era', n: 18, crystals: 220 },
  { id: 'q53', kind: 'own', target: 'godcore', n: 15, cashMins: 150 },
  { id: 'q54', kind: 'rebirth', n: 10, crystals: 300 },
  { id: 'q55', kind: 'managers', n: TOTAL_VENTURES, crystals: 350 },
  { id: 'q56', kind: 'earn', n: 1e33, crystals: 400 },
  { id: 'q57', kind: 'rebirth', n: 25, crystals: 600 },
];

/** owning 25+ of all 4 ventures in an era doubles that era's profits */
export const SET_BONUS_COUNT = 25;
export const SET_BONUS_MULT = 2;

// ─── Investors: one legendary character per era, bought with crystals (permanent) ───
// Each grants a distinct, powerful perk so the player builds a strategic "board" of
// investors over many rebirths — the main long-term depth/collection layer.

export type InvestorPerk =
  | { kind: 'era'; era: number; mult: number }
  | { kind: 'global'; mult: number }
  | { kind: 'offline'; mult: number }
  | { kind: 'speed'; add: number }
  | { kind: 'anomaly'; mult: number }
  | { kind: 'cost'; cut: number };

export interface InvestorDef {
  id: string;
  era: number;
  name: string;   // proper noun, not translated
  icon: string;
  cost: number;   // crystals
  perk: InvestorPerk;
}

export const INVESTORS: InvestorDef[] = [
  { id: 'ognar',   era: 0,  name: 'Ognar',      icon: '🪓', cost: 8,     perk: { kind: 'era', era: 0, mult: 8 } },
  { id: 'nara',    era: 1,  name: 'Nara',       icon: '🏹', cost: 14,    perk: { kind: 'speed', add: 0.15 } },
  { id: 'gaia',    era: 2,  name: 'Gaia',       icon: '🌾', cost: 24,    perk: { kind: 'offline', mult: 2 } },
  { id: 'kubar',   era: 3,  name: 'Kubar',      icon: '🪙', cost: 40,    perk: { kind: 'cost', cut: 0.08 } },
  { id: 'sargon',  era: 4,  name: 'Sargon',     icon: '🛡️', cost: 70,    perk: { kind: 'global', mult: 1.8 } },
  { id: 'tomyris', era: 5,  name: 'Tomyris',    icon: '⚒️', cost: 120,   perk: { kind: 'anomaly', mult: 2 } },
  { id: 'bilge',   era: 6,  name: 'Bilge Kağan', icon: '🐺', cost: 220,  perk: { kind: 'speed', add: 0.20 } },
  { id: 'nefer',   era: 7,  name: 'Nefertari',  icon: '👑', cost: 400,   perk: { kind: 'offline', mult: 2.5 } },
  { id: 'maximus', era: 8,  name: 'Maximus',    icon: '🛡️', cost: 800,   perk: { kind: 'speed', add: 0.25 } },
  { id: 'merlin',  era: 9,  name: 'Merlin',     icon: '🔮', cost: 1600,  perk: { kind: 'anomaly', mult: 2.5 } },
  { id: 'suleyman', era: 10, name: 'Süleyman',  icon: '🕌', cost: 3200,  perk: { kind: 'global', mult: 2 } },
  { id: 'davinci', era: 11, name: 'Da Vinci',   icon: '🎭', cost: 6500,  perk: { kind: 'cost', cut: 0.12 } },
  { id: 'tesla',   era: 12, name: 'Tesla',      icon: '⚡', cost: 13000, perk: { kind: 'global', mult: 2 } },
  { id: 'ada',     era: 13, name: 'Ada',        icon: '💻', cost: 27000, perk: { kind: 'global', mult: 2.5 } },
  { id: 'nova',    era: 14, name: 'Nova',       icon: '🌟', cost: 55000, perk: { kind: 'global', mult: 3 } },
  { id: 'archon',  era: 15, name: 'Archon',     icon: '🌀', cost: 12e4,  perk: { kind: 'global', mult: 4 } },
  { id: 'vega',    era: 16, name: 'Vega',       icon: '🌠', cost: 26e4,  perk: { kind: 'global', mult: 5 } },
  { id: 'omniel',  era: 17, name: 'Omniel',     icon: '✨', cost: 6e5,   perk: { kind: 'global', mult: 7 } },
];

export const INVESTOR_BY_ID: Record<string, InvestorDef> = Object.fromEntries(
  INVESTORS.map((i) => [i.id, i]),
);

// ─── Chrono Rank: account-level prestige tier from total crystals earned ───
// Long-term identity + a small permanent global bonus per rank, shown in the header.

export interface RankDef { name: string; icon: string; at: number }

export const RANKS: RankDef[] = [
  { name: 'Gezgin',      icon: '🕒', at: 0 },
  { name: 'Çırak',       icon: '⏳', at: 50 },
  { name: 'Kâşif',       icon: '🧭', at: 250 },
  { name: 'Zaman Ustası',icon: '⌛', at: 1000 },
  { name: 'Şovalye',     icon: '🛡️', at: 4000 },
  { name: 'Büyücü',      icon: '🔮', at: 15000 },
  { name: 'Efendi',      icon: '👑', at: 60000 },
  { name: 'Kâhin',       icon: '🌙', at: 250000 },
  { name: 'Yıldız Lordu',icon: '🌟', at: 1e6 },
  { name: 'Ebedi',       icon: '🌌', at: 5e6 },
  { name: 'Zaman Tanrısı',icon: '⚡', at: 25e6 },
  { name: 'Sonsuz',      icon: '♾️', at: 1e8 },
];

/** each rank tier adds this much permanent global income */
export const RANK_BONUS_PER_TIER = 0.05;

export function rankIndex(totalCrystals: number): number {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (totalCrystals >= RANKS[i].at) idx = i;
  return idx;
}

// ─── Golden Rush: rare flying comet → tap for a short income frenzy ───
export const RUSH_MIN_GAP_S = 300;   // ~5–11 min between comets
export const RUSH_MAX_GAP_S = 660;
export const RUSH_FLIGHT_S = 9;      // seconds the comet is on screen
export const RUSH_FRENZY_S = 30;     // frenzy duration after catching
export const RUSH_FRENZY_MULT = 3;   // ×3 all income during frenzy (was 5 — too generous)

// ─── Golden Hour: a scheduled limited-time EVENT that auto-starts periodically ───
// Rotating themed events give a strong global boost for a few minutes with a live
// countdown banner — creates "moments" and a reason to keep the game open.
export interface EventDef { id: string; icon: string; mult: number; boostAnomaly?: boolean }
export const EVENTS: EventDef[] = [
  { id: 'golden_hour', icon: '🌟', mult: 2 },
  { id: 'time_storm',  icon: '🌀', mult: 2, boostAnomaly: true },
  { id: 'gold_fever',  icon: '💰', mult: 2 },
  { id: 'chrono_surge',icon: '⚡', mult: 3 },
];
export const EVENT_DURATION_S = 180;      // 3 minutes
export const EVENT_MIN_GAP_S = 1200;      // ~20–35 min between events
export const EVENT_MAX_GAP_S = 2100;
/** watching an ad extends the running event by this long */
export const EVENT_AD_EXTEND_S = 180;

// ─── Prestige math ───
// Lower base so the FIRST rebirth is reachable a few eras in — you should feel the
// prestige loop early, then lean on it harder each run to punch through late eras.
// Raised from 1e10 → 1e34 to match the MUCH harder economy. With the old base, a single
// rebirth at the (now far deeper) wall handed out trillions of crystals → prestige ×1e11 →
// you'd skip straight to the end. At 1e34, reaching the final era takes ~20 rebirths (weeks–
// months of real play), which is the whole point of the idle prestige loop.
export const CRYSTAL_BASE = 1e34;

export function crystalsForRun(runCash: number): number {
  if (runCash < CRYSTAL_BASE / 1e6) return 0; // tiny floor so 0-crystal rebirths don't happen
  return Math.floor(40 * Math.sqrt(runCash / CRYSTAL_BASE));
}

// ─── Second prestige: Ascension → Eon Crystals ───
// The long-term meta above rebirth. Once you've rebirthed enough and banked serious
// Chrono Crystals, you can ASCEND: it resets crystals, skills, investors and the run,
// but grants permanent Eon Crystals that boost ALL income AND future crystal gains — so
// each ascension cycle punches deeper than the last. This is what keeps whales playing
// for weeks instead of hitting a ceiling.
export const ASCEND_MIN_REBIRTHS = 8;   // gate: enough rebirths before ascension unlocks
export const EON_BASE = 5e5;            // crystals-earned-this-epoch per Eon scale
export function eonsForAscension(epochCrystals: number): number {
  if (epochCrystals < EON_BASE) return 0;
  return Math.floor(3 * Math.sqrt(epochCrystals / EON_BASE));
}
export const EON_INCOME_BONUS = 0.25;   // +25% permanent global income per Eon
export const EON_CRYSTAL_BONUS = 0.10;  // +10% crystal gain per Eon

// ─── Seasonal / live-ops bonuses ───
// Calendar-driven global multipliers (no backend needed — computed from local time).
// Gives the game a live-ops heartbeat: weekends, a daily power hour, and holiday events.
// A real remote-config live-ops layer would need the same backend as cloud/leaderboard.
export interface SeasonalEvent { mult: number; key: string; icon: string }
export function seasonalEvent(now: Date = new Date()): SeasonalEvent | null {
  const mo = now.getMonth(), d = now.getDate(), day = now.getDay(), h = now.getHours();
  // themed holidays (strongest, take priority)
  if (mo === 11 && d >= 24 && d <= 26) return { mult: 3, key: 'winterfest', icon: '❄️' };
  if (mo === 0 && d === 1) return { mult: 3, key: 'newyear', icon: '🎆' };
  if (mo === 9 && d === 31) return { mult: 2.5, key: 'halloween', icon: '🎃' };
  // daily "power hour" 20:00–21:00 local time
  if (h === 20) return { mult: 2, key: 'powerhour', icon: '⚡' };
  // weekend bonus (Sat/Sun)
  if (day === 0 || day === 6) return { mult: 1.5, key: 'weekend', icon: '🎉' };
  return null;
}

// ─── Ads / boosts ───
export const AD_BOOST_BASE_HOURS = 3;   // ×2 boost duration (was 4h)
export const TIMEWARP_HOURS = 1;        // instant-collect ad = 1h of production (was 2h)
export const TIMEWARP_COOLDOWN_MIN = 45;
export const CRYSTAL_AD_COOLDOWN_MIN = 90;
export const OFFLINE_CAP_BASE_HOURS = 4; // offline earnings cap (was 8h — too much catch-up)
export const ANOMALY_MIN_GAP_S = 90;
export const ANOMALY_MAX_GAP_S = 240;
export const ANOMALY_LIFETIME_S = 14;

export interface DailyDef { type: 'cash' | 'crystal'; amount: number }
export const DAILY_REWARDS: DailyDef[] = [
  { type: 'cash', amount: 30 },
  { type: 'cash', amount: 60 },
  { type: 'crystal', amount: 5 },
  { type: 'cash', amount: 120 },
  { type: 'crystal', amount: 10 },
  { type: 'cash', amount: 240 },
  { type: 'crystal', amount: 25 },
];
