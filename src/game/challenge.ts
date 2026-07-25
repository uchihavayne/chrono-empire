// Challenge Mode — a curated set of tough one-time feats, harder than achievements, with bigger
// CLAIMABLE rewards (gems + guaranteed cards of a rarity). Passive-tracked; you press Claim when
// the condition is met. Gives long-term goals beyond the normal progression.

import type { Rarity } from './cards';

export type ChallengeKind =
  | 'own_single' | 'managers' | 'cards_single' | 'rebirth' | 'earn'
  | 'era' | 'exped_depth' | 'ascend' | 'total_owned';

export interface ChallengeReward { gems: number; cards: number; rarity: Rarity }
export interface ChallengeDef {
  id: string;
  kind: ChallengeKind;
  n: number;
  icon: string;
  reward: ChallengeReward;
}

export const CHALLENGES: ChallengeDef[] = [
  { id: 'total_500',    kind: 'total_owned',  n: 500,   icon: '🏗️', reward: { gems: 20, cards: 2, rarity: 'uncommon' } },
  { id: 'own_1000',     kind: 'own_single',   n: 1000,  icon: '🏭', reward: { gems: 40, cards: 3, rarity: 'epic' } },
  { id: 'managers_20',  kind: 'managers',     n: 20,    icon: '⚙️', reward: { gems: 25, cards: 2, rarity: 'uncommon' } },
  { id: 'cards_50',     kind: 'cards_single', n: 50,    icon: '🃏', reward: { gems: 30, cards: 2, rarity: 'epic' } },
  { id: 'rebirth_5',    kind: 'rebirth',      n: 5,     icon: '🌀', reward: { gems: 40, cards: 3, rarity: 'epic' } },
  { id: 'earn_1e15',    kind: 'earn',         n: 1e15,  icon: '💰', reward: { gems: 30, cards: 2, rarity: 'uncommon' } },
  { id: 'era_10',       kind: 'era',          n: 10,    icon: '🗺️', reward: { gems: 45, cards: 1, rarity: 'legendary' } },
  { id: 'era_15',       kind: 'era',          n: 15,    icon: '🌌', reward: { gems: 70, cards: 2, rarity: 'legendary' } },
  { id: 'exped_15',     kind: 'exped_depth',  n: 15,    icon: '🌀', reward: { gems: 40, cards: 2, rarity: 'epic' } },
  { id: 'ascend_1',     kind: 'ascend',       n: 1,     icon: '✨', reward: { gems: 80, cards: 3, rarity: 'legendary' } },
];
