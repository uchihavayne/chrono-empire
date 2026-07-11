// ─── Card collection & loot-box system ───
// Replaces the old cash upgrades. You collect venture CARDS from BOXES; collecting enough
// of a venture's card unlocks its MANAGER (automation) and small permanent profit multipliers.
// Boxes: a free Uncommon box daily (+2 more via ads, max 3/day) and gem-bought rarity boxes.
// New premium currency: GEMS 💠 (separate from Chrono Crystals) — earned free + buyable via IAP.
//
// NOTE: numbers here are the balance knobs for the card economy — tune freely.

import { GENERATORS } from './data';

export type Rarity = 'common' | 'uncommon' | 'epic' | 'legendary';
export const RARITIES: Rarity[] = ['common', 'uncommon', 'epic', 'legendary'];

/** [light, dark] accent per rarity for card frames / glows */
export const RARITY_COLOR: Record<Rarity, [string, string]> = {
  common:    ['#b7c0d0', '#7c8598'],
  uncommon:  ['#5fd08a', '#2f8a54'],
  epic:      ['#b877ff', '#7a3ad0'],
  legendary: ['#ffcf5a', '#e0902a'],
};
export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Common', uncommon: 'Uncommon', epic: 'Epic', legendary: 'Legendary',
};

/** a venture's card rarity is set by how deep its era is */
export function cardRarity(era: number): Rarity {
  if (era <= 5) return 'common';        // paleo→iron
  if (era <= 9) return 'uncommon';      // turkic→rome
  if (era <= 13) return 'epic';         // medieval→modern
  return 'legendary';                   // space→cosmic
}

export interface CardDef {
  id: string;       // same as the venture id
  venture: string;
  rarity: Rarity;
  era: number;
}
export const CARDS: CardDef[] = GENERATORS.map((g) => ({
  id: g.id, venture: g.id, rarity: cardRarity(g.era), era: g.era,
}));
export const CARDS_BY_RARITY: Record<Rarity, CardDef[]> = {
  common: CARDS.filter((c) => c.rarity === 'common'),
  uncommon: CARDS.filter((c) => c.rarity === 'uncommon'),
  epic: CARDS.filter((c) => c.rarity === 'epic'),
  legendary: CARDS.filter((c) => c.rarity === 'legendary'),
};

// ─── collection → rewards ───
// Card-count thresholds and the CUMULATIVE profit multiplier reached at each. Deliberately
// small (the point is a slow collect-grind, not the old instant ×36 cash upgrade).
export const CARD_TIERS = [10, 25, 50, 100, 250, 500];
export const CARD_TIER_MULT = [0.5, 1, 2, 3.5, 5, 8]; // +mult; total profit ×(1+this)
/** cards needed before a venture's manager (automation) unlocks */
export const MANAGER_CARD_REQ = 10;

/** total profit multiplier for a venture from its collected card count (≥1) */
export function cardProfitMult(count: number): number {
  let bonus = 0;
  for (let i = 0; i < CARD_TIERS.length; i++) if (count >= CARD_TIERS[i]) bonus = CARD_TIER_MULT[i];
  return 1 + bonus;
}
export function cardManagerUnlocked(count: number): boolean {
  return count >= MANAGER_CARD_REQ;
}
/** next threshold the player is working toward, or null if maxed */
export function nextCardTier(count: number): number | null {
  for (const t of CARD_TIERS) if (count < t) return t;
  return null;
}

// ─── boxes ───
export interface BoxDef {
  id: string;
  rarity: Rarity;   // the rarity band this box mostly draws from
  cards: number;    // how many cards it drops
  gemCost: number;  // 0 = free/ad box
  icon: string;
}
export const BOXES: BoxDef[] = [
  { id: 'uncommon',  rarity: 'uncommon',  cards: 3, gemCost: 0,   icon: '📦' }, // free daily + ads
  { id: 'common',    rarity: 'common',    cards: 5, gemCost: 30,  icon: '🎁' },
  { id: 'epic',      rarity: 'epic',      cards: 6, gemCost: 150, icon: '🟪' },
  { id: 'legendary', rarity: 'legendary', cards: 8, gemCost: 600, icon: '👑' },
];
export const BOX_BY_ID: Record<string, BoxDef> = Object.fromEntries(BOXES.map((b) => [b.id, b]));

export const FREE_BOX_PER_DAY = 1;   // one free Uncommon box a day
export const MAX_BOXES_PER_DAY = 3;  // free + ad boxes combined

// draw weighting: a box of a given rarity mostly yields that band, with a little spillover.
const DRAW_WEIGHTS: Record<Rarity, Partial<Record<Rarity, number>>> = {
  common:    { common: 1 },
  uncommon:  { uncommon: 0.7, common: 0.3 },
  epic:      { epic: 0.6, uncommon: 0.3, common: 0.1 },
  legendary: { legendary: 0.5, epic: 0.3, uncommon: 0.2 },
};

function pickRarity(box: Rarity, rng: () => number): Rarity {
  const w = DRAW_WEIGHTS[box];
  let r = rng();
  for (const [rar, p] of Object.entries(w) as [Rarity, number][]) {
    if (r < p) return rar;
    r -= p;
  }
  return box;
}

/** roll the card ids a box yields. Only draws cards for ventures whose era is unlocked-ish
 *  is NOT enforced here — the engine decides; this just picks by rarity band. */
export function rollBox(boxId: string, rng: () => number = Math.random): string[] {
  const box = BOX_BY_ID[boxId];
  if (!box) return [];
  const out: string[] = [];
  for (let i = 0; i < box.cards; i++) {
    const rar = pickRarity(box.rarity, rng);
    const pool = CARDS_BY_RARITY[rar].length ? CARDS_BY_RARITY[rar] : CARDS;
    out.push(pool[Math.floor(rng() * pool.length)].id);
  }
  return out;
}
