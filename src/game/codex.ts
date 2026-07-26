// Codex / Chronicle — a completion layer that ties the game's existing content (eras, bosses,
// maxed cards, prestige) into a rewarding milestone checklist. Each entry grants a one-time gem
// reward on claim AND a small PERMANENT global-income bonus (while claimed). Pure long-tail
// completionism + a steady trickle of "you've come far" dopamine.

export type CodexCat = 'era' | 'boss' | 'card' | 'rebirth' | 'ascend';

export interface CodexEntry {
  id: string;
  cat: CodexCat;
  icon: string;
  /** threshold the category's progress must reach */
  need: number;
  /** permanent global income bonus once claimed (0.015 = +1.5%) */
  bonus: number;
  /** one-time gems granted on claim */
  gems: number;
}

// Ordered by category. Bonuses are deliberately tiny so a fully-completed Codex (~+30% global)
// rewards long-term play without trivializing progression.
export const CODEX_ENTRIES: CodexEntry[] = [
  // eras reached (state.erasUnlocked)
  { id: 'era_3',  cat: 'era', icon: '🏺', need: 3,  bonus: 0.015, gems: 20 },
  { id: 'era_6',  cat: 'era', icon: '⚔️', need: 6,  bonus: 0.015, gems: 25 },
  { id: 'era_9',  cat: 'era', icon: '🏰', need: 9,  bonus: 0.015, gems: 30 },
  { id: 'era_12', cat: 'era', icon: '🚂', need: 12, bonus: 0.02,  gems: 40 },
  { id: 'era_15', cat: 'era', icon: '🛰️', need: 15, bonus: 0.02,  gems: 50 },
  { id: 'era_18', cat: 'era', icon: '🌌', need: 18, bonus: 0.03,  gems: 80 },
  // Time Keeper bosses defeated (state.bossesDefeated.length)
  { id: 'boss_1', cat: 'boss', icon: '⏳', need: 1, bonus: 0.02, gems: 40 },
  { id: 'boss_2', cat: 'boss', icon: '⌛', need: 2, bonus: 0.02, gems: 50 },
  { id: 'boss_3', cat: 'boss', icon: '🕰️', need: 3, bonus: 0.03, gems: 70 },
  // cards fully maxed (count ≥ top tier)
  { id: 'card_1',  cat: 'card', icon: '🃏', need: 1,  bonus: 0.015, gems: 30 },
  { id: 'card_5',  cat: 'card', icon: '🎴', need: 5,  bonus: 0.02,  gems: 50 },
  { id: 'card_15', cat: 'card', icon: '👑', need: 15, bonus: 0.03,  gems: 90 },
  // prestige — rebirths (state.rebirths)
  { id: 'rebirth_1',  cat: 'rebirth', icon: '🔄', need: 1,  bonus: 0.02, gems: 40 },
  { id: 'rebirth_10', cat: 'rebirth', icon: '♻️', need: 10, bonus: 0.03, gems: 80 },
  // prestige — ascensions (state.ascensions)
  { id: 'ascend_1', cat: 'ascend', icon: '🌠', need: 1, bonus: 0.025, gems: 60 },
  { id: 'ascend_3', cat: 'ascend', icon: '✨', need: 3, bonus: 0.04,  gems: 120 },
];

export const CODEX_BY_ID: Record<string, CodexEntry> = Object.fromEntries(CODEX_ENTRIES.map((e) => [e.id, e]));
