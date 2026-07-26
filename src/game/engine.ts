import {
  ACHIEVEMENTS, ACH_BONUS, ACH_TIER_GEMS, achTier, AD_BOOST_BASE_HOURS, ANOMALY_LIFETIME_S, ANOMALY_MAX_GAP_S,
  AD_GEM_REWARD, ANOMALY_MIN_GAP_S, CRYSTAL_AD_COOLDOWN_MIN, DAILY_REWARDS, ERAS, ERA_BASE,
  GEM_AD_COOLDOWN_MIN,
  EVENTS, EVENT_AD_EXTEND_S, EVENT_DURATION_S, EVENT_MAX_GAP_S, EVENT_MIN_GAP_S,
  GENERATORS, GEN_BY_ID,
  INVESTORS, INVESTOR_BY_ID, OFFLINE_CAP_BASE_HOURS, QUESTS, RANK_BONUS_PER_TIER,
  RUSH_FLIGHT_S, RUSH_FRENZY_MULT, RUSH_FRENZY_S, RUSH_MAX_GAP_S, RUSH_MIN_GAP_S,
  SET_BONUS_COUNT, SET_BONUS_MULT, SKILLS, SKILL_BY_ID,
  TIMEWARP_COOLDOWN_MIN, TIMEWARP_HOURS,
  UPGRADES, UPGRADE_BY_ID, crystalsForRun, milestoneMult, milestoneSpeed, rankIndex, skillCost,
  ASCEND_MIN_REBIRTHS, EON_BASE, EON_INCOME_BONUS, EON_CRYSTAL_BONUS, eonsForAscension,
  seasonalEvent, type SeasonalEvent,
  type GeneratorDef, type QuestDef,
} from './data';
import { audio } from '../services/audio';
import {
  EXP_FREE_PER_DAY, EXP_MAX_PER_DAY, EXP_START_STABILITY, EXP_UNLOCK_ERAS,
  RELIC_BY_ID, relicCost,
} from './expedition';
import {
  EVENT_BOOST_MIN, EVENT_BOOST_MULT, EVENT_GEN_BY_ID, EVENT_GENS, EVENT_OFFLINE_CAP_H,
  EVENT_STAGES, EVENT_START_TOKENS, eventBuyCost, eventCycleId, eventEndsAt, eventGemsFor, eventGenRate,
} from './event';
import { WHEEL_FREE_PER_DAY, WHEEL_MAX_PER_DAY, WHEEL_PRIZES, rollWheel } from './wheel';
import { CHALLENGES } from './challenge';
import { BOSS_DURATION_S, BOSS_TARGET_SECONDS, BOSS_TIERS, bossReward } from './boss';
import { SKIN_BY_ID } from './skins';
import { EON_UPGRADE_BY_ID, eonUpgradeCost } from './eon';
import {
  SEASON_XP_PER_TIER, assignTasks, seasonEndsAt, seasonFreeReward, seasonId, seasonPremiumReward,
  seasonTierForXp, seasonTierXp, type SeasonTask,
} from './season';
import { cloudPull, cloudPush, type CloudResult } from '../services/cloud';
import { PRODUCT_BY_ID, VIP_DAILY_GEMS } from '../services/iap';
import { submitScore, topScores, type LbEntry } from '../services/leaderboard';
import {
  BOX_BY_ID, CARD_BY_ID, CARDS_BY_RARITY, FUSION_COST, cardManagerUnlocked, cardProfitMult,
  FREE_BOX_PER_DAY, MANAGER_CARD_REQ, MAX_BOXES_PER_DAY, nextRarity, rollBox,
} from './cards';

export interface GeneratorState {
  count: number;
  hasManager: boolean;
  progress: number;   // 0..1 of current cycle
  running: boolean;
}

export interface AnomalyState {
  x: number; // 5..85 (% of screen)
  y: number; // 15..65
  expiresAt: number;
  rewardCash: number;
}

export interface GameState {
  version: number;
  cash: number;
  lifetimeCash: number;
  runCash: number;
  crystals: number;
  totalCrystalsEarned: number;
  rebirths: number;
  /** number of eras (chapters) unlocked this run; 1 = Stone Age only */
  erasUnlocked: number;
  generators: Record<string, GeneratorState>;
  upgrades: string[];
  skills: Record<string, number>;
  achievements: string[];
  boostUntil: number;
  timewarpReadyAt: number;
  crystalAdReadyAt: number;
  /** timestamp when the free "watch ad for gems" is next available */
  gemAdReadyAt: number;
  lastSeen: number;
  lastDailyDate: string;
  dailyStreak: number;
  dailyClaimable: boolean;
  adsWatched: number;
  anomaliesCaught: number;
  /** index into QUESTS of the current active quest (account-level, survives rebirth) */
  questIndex: number;
  /** owned investor ids (permanent, survive rebirth) */
  investors: string[];
  /** timestamp until which the Golden Rush frenzy is active */
  frenzyUntil: number;
  /** active Golden-Hour event: its EVENTS index and end timestamp (-1 = none) */
  eventIdx: number;
  eventUntil: number;
  lang: string;
  soundOn: boolean;    // legacy master (kept for migration); use musicOn/sfxOn now
  musicOn: boolean;
  sfxOn: boolean;
  musicVol: number;    // 0..1 music volume
  sfxVol: number;      // 0..1 SFX volume
  notifsOn: boolean;   // away-reminder push notifications (native only)
  notation: 'suffix' | 'scientific';
  createdAt: number;
  /** stable random code identifying this player's cloud backup slot */
  cloudCode: string;
  /** last time (ms) a cloud backup succeeded, 0 = never */
  cloudSyncedAt: number;
  /** IAP: rewarded-ads permanently removed */
  removeAds: boolean;
  /** IAP: Starter Pack bought → permanent ×2 global income */
  starterPack: boolean;
  /** ids of consumable/one-time IAP products already granted */
  iapOwned: string[];
  /** second prestige: permanent Eon Crystals (survive ascension) */
  eons: number;
  /** permanent Eon Upgrade levels (never reset) */
  eonUpgrades: Record<string, number>;
  /** era indices whose card album has been completed + claimed */
  albumsClaimed: number[];
  /** number of ascensions performed */
  ascensions: number;
  /** totalCrystalsEarned snapshot at the last ascension → epoch crystals = total − this */
  ascensionStartCrystals: number;
  /** first-run onboarding shown/dismissed */
  tutorialDone: boolean;
  /** weekly leaderboard: current week id, this-week baseline score, last week we claimed a reward */
  weekId: number;
  weekStartScore: number;
  weeklyRewardWeek: number;
  /** display name shown on the global leaderboard */
  playerName: string;
  /** premium Gems 💠 currency (buys card boxes; separate from Chrono Crystals) */
  gems: number;
  /** collected card counts per venture id (a permanent meta-collection) */
  cards: Record<string, number>;
  /** boxes opened today (free + ad) and the date, for the daily limit */
  boxesToday: number;
  lastBoxDate: string;
  // ─── Temporal Expeditions (active roguelite mode) ───
  /** Relic Shards — meta-currency earned in expeditions, spent on permanent relics */
  shards: number;
  /** permanent relic levels (survive rebirth AND ascension) */
  relics: Record<string, number>;
  /** expedition runs started today + the date, for the daily limit */
  expToday: number;
  expDate: string;
  /** deepest stage ever cleared (bragging + future unlocks) */
  expBestDepth: number;
  // ─── Event World (limited-time parallel world) ───
  /** the 10-day cycle these event values belong to (rollover resets the world) */
  eventCycleId: number;
  /** spendable Event Tokens this cycle */
  eventTokens: number;
  /** lifetime Event Tokens earned THIS cycle (drives the end-of-cycle gem payout) */
  eventTokensEarned: number;
  /** event-business counts this cycle */
  eventGens: Record<string, number>;
  /** festival stages unlocked this cycle (like eras); starts at 1 */
  eventStagesUnlocked: number;
  /** last time event income was accrued (for offline) */
  eventLastSeen: number;
  /** gems awaiting a "your event paid out" celebration (set on rollover) */
  eventPayoutGems: number;
  /** Festival Frenzy (ad-boost): ×3 event tokens until this timestamp */
  eventBoostUntil: number;
  /** Daily Wheel: spins used today + the date (for the free + ad daily limits) */
  wheelSpins: number;
  wheelDate: string;
  // ─── Season Pass ───
  seasonId: number;
  seasonXp: number;
  seasonPremium: boolean;
  /** highest tier whose FREE / PREMIUM reward has been claimed */
  seasonFreeClaimed: number;
  seasonPremiumClaimed: number;
  /** today's 3 tasks + the date they were assigned */
  seasonTasks: SeasonTask[];
  seasonTaskDate: string;
  /** daily action counters for task progress (reset each day) */
  dayDate: string;
  dayBought: number;
  dayEarned: number;
  dayBoxes: number;
  daySpins: number;
  dayExped: number;
  /** claimed Challenge Mode feats */
  challengesDone: string[];
  /** cosmetic skins: selected id + owned ids */
  skin: string;
  ownedSkins: string[];
  /** VIP subscription: active flag + last daily-gem claim date */
  vip: boolean;
  vipGemsDate: string;
  // ─── Time Keeper bosses ───
  /** era thresholds whose boss has been defeated */
  bossesDefeated: number[];
  /** active fight: era threshold (0 = none), end time, cash earned SO FAR this fight, target */
  bossThreshold: number;
  bossEndsAt: number;
  bossEarnedAmt: number;
  bossTarget: number;
  // ─── stats history (A7) ───
  /** rolling samples of income/sec + total crystals for the stats graphs */
  incomeHistory: number[];
  crystalHistory: number[];
  lastStatSampleAt: number;
}

/** random backup code, grouped for readability e.g. "CE-4F2A-9B7C-1D3E" */
export function makeCloudCode(): string {
  const hex = () => Math.floor(Math.random() * 0x10000).toString(16).toUpperCase().padStart(4, '0');
  return `CE-${hex()}-${hex()}-${hex()}`;
}

export type BuyAmount = 1 | 10 | 100 | 'max';

// Canonical save key. NEVER change this again — schema changes are handled by
// migrate() below, not by a new key. A new key would orphan the player's progress.
const SAVE_KEY = 'chrono_empire_save';
const BACKUP_KEY = 'chrono_empire_save_bak';
// Older keys read once and migrated forward, so existing players keep their progress.
const LEGACY_KEYS = ['chrono_empire_save_v2', 'chrono_empire_save_v1'];
const VERSION = 14;
const ALBUM_BONUS = 0.15; // +15% era output for completing that era's card album
const STAT_SAMPLE_MS = 90_000; // sample income/crystals for the history graphs every 90s of play
const STAT_MAX_SAMPLES = 48;   // rolling window (~72 min of active play)
// weekly leaderboard cadence (Mon 2026-01-05 UTC as epoch)
const LB_WEEK_EPOCH = Date.UTC(2026, 0, 5);
const LB_WEEK_MS = 7 * 86_400_000;

/** migrate a parsed save of any older version up to the current schema (never destructive).
 *  Migrations may only ADD access, never remove it, so a player can never lose progress. */
function migrate(save: any): any {
  const v = typeof save.version === 'number' ? save.version : 1;
  const bumpEras = (by: number) => {
    if (typeof save.erasUnlocked === 'number' && save.erasUnlocked > 1) {
      save.erasUnlocked = save.erasUnlocked + by;
    }
  };
  // v2→v3: Turkic era inserted mid-list, shifting later eras one step.
  if (v < 3) bumpEras(1);
  // v3→v4: First Turks moved before Egypt AND Ottoman era inserted — grant an extra
  // step so every civilization the player had unlocked stays unlocked.
  if (v < 4) bumpEras(1);
  // v4→v5: five prehistoric eras (Mesolithic, Neolithic, Copper, Bronze, Iron) inserted
  // between Paleolithic and First Turks — shift every unlocked-past-Paleolithic player +5
  // so the same civilizations they already reached remain unlocked.
  if (v < 5) bumpEras(5);
  // v5→v6: cash upgrades/managers replaced by the CARD system. Grant existing players the
  // cards for every venture they'd already automated, so they keep their managers.
  if (v < 6) {
    if (!save.cards || typeof save.cards !== 'object') save.cards = {};
    if (save.generators && typeof save.generators === 'object') {
      for (const id in save.generators) {
        if (save.generators[id]?.hasManager) {
          save.cards[id] = Math.max(save.cards[id] ?? 0, MANAGER_CARD_REQ);
        }
      }
    }
  }
  // v6→v7: split the single sound toggle into independent music + SFX toggles.
  if (v < 7) {
    const on = save.soundOn !== false;
    if (typeof save.musicOn !== 'boolean') save.musicOn = on;
    if (typeof save.sfxOn !== 'boolean') save.sfxOn = on;
  }
  // v7→v8: per-channel volume sliders (default full).
  if (v < 8) {
    if (typeof save.musicVol !== 'number') save.musicVol = 1;
    if (typeof save.sfxVol !== 'number') save.sfxVol = 1;
  }
  // v8→v9: Temporal Expeditions (shards + relics + daily-run bookkeeping).
  if (v < 9) {
    if (typeof save.shards !== 'number') save.shards = 0;
    if (!save.relics || typeof save.relics !== 'object') save.relics = {};
    if (typeof save.expToday !== 'number') save.expToday = 0;
    if (typeof save.expDate !== 'string') save.expDate = '';
    if (typeof save.expBestDepth !== 'number') save.expBestDepth = 0;
  }
  // v9→v10: Event World.
  if (v < 10) {
    if (typeof save.eventCycleId !== 'number') save.eventCycleId = eventCycleId();
    if (typeof save.eventTokens !== 'number') save.eventTokens = EVENT_START_TOKENS;
    if (typeof save.eventTokensEarned !== 'number') save.eventTokensEarned = 0;
    if (!save.eventGens || typeof save.eventGens !== 'object') save.eventGens = {};
    if (typeof save.eventLastSeen !== 'number') save.eventLastSeen = Date.now();
    if (typeof save.eventPayoutGems !== 'number') save.eventPayoutGems = 0;
  }
  if (typeof save.eventBoostUntil !== 'number') save.eventBoostUntil = 0;
  if (typeof save.eventStagesUnlocked !== 'number' || save.eventStagesUnlocked < 1) save.eventStagesUnlocked = 1;
  if (typeof save.wheelSpins !== 'number') save.wheelSpins = 0;
  if (typeof save.wheelDate !== 'string') save.wheelDate = '';
  if (typeof save.seasonId !== 'number') save.seasonId = seasonId();
  if (typeof save.seasonXp !== 'number') save.seasonXp = 0;
  if (typeof save.seasonPremium !== 'boolean') save.seasonPremium = false;
  if (typeof save.seasonFreeClaimed !== 'number') save.seasonFreeClaimed = 0;
  if (typeof save.seasonPremiumClaimed !== 'number') save.seasonPremiumClaimed = 0;
  if (!Array.isArray(save.seasonTasks)) save.seasonTasks = [];
  if (typeof save.seasonTaskDate !== 'string') save.seasonTaskDate = '';
  if (typeof save.dayDate !== 'string') save.dayDate = '';
  for (const k of ['dayBought', 'dayEarned', 'dayBoxes', 'daySpins', 'dayExped']) {
    if (typeof save[k] !== 'number') save[k] = 0;
  }
  if (!Array.isArray(save.challengesDone)) save.challengesDone = [];
  if (!save.eonUpgrades || typeof save.eonUpgrades !== 'object') save.eonUpgrades = {};
  if (!Array.isArray(save.albumsClaimed)) save.albumsClaimed = [];
  if (typeof save.weekId !== 'number') save.weekId = 0;
  if (typeof save.weekStartScore !== 'number') save.weekStartScore = 0;
  if (typeof save.weeklyRewardWeek !== 'number') save.weeklyRewardWeek = -1;
  if (typeof save.skin !== 'string') save.skin = 'default';
  if (!Array.isArray(save.ownedSkins)) save.ownedSkins = ['default'];
  if (!save.ownedSkins.includes('default')) save.ownedSkins.push('default');
  if (typeof save.vip !== 'boolean') save.vip = false;
  if (typeof save.vipGemsDate !== 'string') save.vipGemsDate = '';
  if (!Array.isArray(save.bossesDefeated)) save.bossesDefeated = [];
  for (const k of ['bossThreshold', 'bossEndsAt', 'bossEarnedAmt', 'bossTarget']) {
    if (typeof save[k] !== 'number') save[k] = 0;
  }
  // v12→v13: stats history graphs.
  if (!Array.isArray(save.incomeHistory)) save.incomeHistory = [];
  if (!Array.isArray(save.crystalHistory)) save.crystalHistory = [];
  if (typeof save.lastStatSampleAt !== 'number') save.lastStatSampleAt = 0;
  // v13→v14: away-reminder notifications (opt-out toggle, default on).
  if (typeof save.notifsOn !== 'boolean') save.notifsOn = true;
  save.version = VERSION;
  return save;
}

function defaultGenerators(): Record<string, GeneratorState> {
  const out: Record<string, GeneratorState> = {};
  for (const g of GENERATORS) {
    out[g.id] = { count: 0, hasManager: false, progress: 0, running: false };
  }
  out['firepit'].count = 1; // start with one fire pit
  return out;
}

function detectLang(): string {
  const supported = ['en', 'tr', 'zh', 'hi', 'es', 'fr', 'ar', 'pt', 'ru', 'ja', 'de', 'ko'];
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return supported.includes(nav) ? nav : 'en';
}

function defaultState(): GameState {
  return {
    version: VERSION,
    cash: 25,   // tiny head start so the tutorial's first purchase is affordable immediately
    lifetimeCash: 0,
    runCash: 0,
    crystals: 0,
    totalCrystalsEarned: 0,
    rebirths: 0,
    erasUnlocked: 1,
    generators: defaultGenerators(),
    upgrades: [],
    skills: {},
    achievements: [],
    boostUntil: 0,
    timewarpReadyAt: 0,
    crystalAdReadyAt: 0,
    gemAdReadyAt: 0,
    lastSeen: Date.now(),
    lastDailyDate: '',
    dailyStreak: 0,
    dailyClaimable: true,
    adsWatched: 0,
    anomaliesCaught: 0,
    questIndex: 0,
    investors: [],
    frenzyUntil: 0,
    eventIdx: -1,
    eventUntil: 0,
    lang: detectLang(),
    soundOn: true,
    musicOn: true,
    sfxOn: true,
    musicVol: 1,
    sfxVol: 1,
    notifsOn: true,
    notation: 'suffix',
    createdAt: Date.now(),
    cloudCode: makeCloudCode(),
    cloudSyncedAt: 0,
    removeAds: false,
    starterPack: false,
    iapOwned: [],
    eons: 0,
    eonUpgrades: {},
    albumsClaimed: [],
    ascensions: 0,
    ascensionStartCrystals: 0,
    tutorialDone: false,
    playerName: '',
    gems: 100, // starter gems so a new player can open a couple of boxes right away
    cards: {},
    boxesToday: 0,
    lastBoxDate: '',
    shards: 0,
    relics: {},
    expToday: 0,
    expDate: '',
    expBestDepth: 0,
    eventCycleId: eventCycleId(),
    eventTokens: EVENT_START_TOKENS,
    eventTokensEarned: 0,
    eventGens: {},
    eventStagesUnlocked: 1,
    eventLastSeen: Date.now(),
    eventPayoutGems: 0,
    eventBoostUntil: 0,
    wheelSpins: 0,
    wheelDate: '',
    seasonId: seasonId(),
    seasonXp: 0,
    seasonPremium: false,
    seasonFreeClaimed: 0,
    seasonPremiumClaimed: 0,
    seasonTasks: [],
    seasonTaskDate: '',
    dayDate: '',
    dayBought: 0,
    dayEarned: 0,
    dayBoxes: 0,
    daySpins: 0,
    dayExped: 0,
    challengesDone: [],
    weekId: 0,
    weekStartScore: 0,
    weeklyRewardWeek: -1,
    skin: 'default',
    ownedSkins: ['default'],
    vip: false,
    vipGemsDate: '',
    bossesDefeated: [],
    bossThreshold: 0,
    bossEndsAt: 0,
    bossEarnedAmt: 0,
    bossTarget: 0,
    incomeHistory: [],
    crystalHistory: [],
    lastStatSampleAt: 0,
  };
}

export interface OfflineReport {
  seconds: number;
  cashEarned: number;
  /** Event World tokens accrued while away (side world — only set if any were earned) */
  eventTokens?: number;
}

type Listener = () => void;

export class GameEngine {
  state: GameState;
  offlineReport: OfflineReport | null = null;
  anomaly: AnomalyState | null = null;
  /** Golden Rush comet: y position (%) and expiry; x is animated in CSS */
  rush: { y: number; expiresAt: number } | null = null;
  private nextAnomalyAt = 0;
  private nextRushAt = 0;
  private nextEventAt = 0;
  private listeners = new Set<Listener>();
  private tickHandle: number | null = null;
  private saveHandle: number | null = null;
  private renderVersion = 0;

  constructor() {
    this.state = this.load();
    this.syncManagers(); // managers derive from the (persistent) card collection
    this.checkEventRollover(); // pay out + reset a finished event cycle BEFORE offline accrual
    this.checkSeasonRollover(); // reset the season pass if a new 30-day season started
    this.checkWeekRollover(); // reset the weekly leaderboard baseline if a new week started
    this.applyOfflineProgress();
    this.refreshDaily();
    this.scheduleAnomaly();
    this.scheduleRush();
    this.scheduleEvent();
    // a resumed event from a previous session shouldn't linger stale
    if (this.state.eventUntil < Date.now()) this.state.eventIdx = -1;
    if (import.meta.env.DEV) {
      (window as unknown as { __engine: GameEngine }).__engine = this;
    }
  }

  // ─── persistence ───
  /** parse + merge one raw string into a full state, or null if invalid */
  private parseSave(raw: string | null): GameState | null {
    if (!raw) return null;
    try {
      const parsed = migrate(JSON.parse(raw));
      if (typeof parsed.cash !== 'number' || !parsed.generators) return null;
      const base = defaultState();
      const merged: GameState = {
        ...base, ...parsed,
        generators: { ...base.generators, ...parsed.generators },
        skills: { ...parsed.skills },
      };
      // ensure every current generator has a state entry (new ventures added over updates)
      for (const g of GENERATORS) {
        if (!merged.generators[g.id]) merged.generators[g.id] = { count: 0, hasManager: false, progress: 0, running: false };
        const gs = merged.generators[g.id];
        if (!gs.hasManager) { gs.running = false; gs.progress = 0; }
      }
      return merged;
    } catch {
      return null;
    }
  }

  private load(): GameState {
    // primary → backup → legacy keys, in that order. Only a truly empty slot starts fresh.
    let state = this.parseSave(localStorage.getItem(SAVE_KEY));
    if (!state) state = this.parseSave(localStorage.getItem(BACKUP_KEY));
    if (!state) {
      for (const k of LEGACY_KEYS) {
        state = this.parseSave(localStorage.getItem(k));
        if (state) break;
      }
    }
    if (!state) return defaultState();
    // persist the migrated save under the canonical key straight away
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
    return state;
  }

  save(): void {
    this.state.lastSeen = Date.now();
    this.state.version = VERSION;
    try {
      const json = JSON.stringify(this.state);
      // write backup first, then primary — if the tab dies mid-write, one copy survives
      localStorage.setItem(BACKUP_KEY, json);
      localStorage.setItem(SAVE_KEY, json);
    } catch { /* storage full/unavailable */ }
  }

  hardReset(): void {
    // explicit user action only — clears every copy
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(BACKUP_KEY);
    for (const k of LEGACY_KEYS) localStorage.removeItem(k);
    this.state = defaultState();
    this.offlineReport = null;
    this.anomaly = null;
    this.rush = null;
    this.emit();
  }

  exportSave(): string {
    return btoa(unescape(encodeURIComponent(JSON.stringify(this.state))));
  }

  importSave(data: string): boolean {
    try {
      const parsed = JSON.parse(decodeURIComponent(escape(atob(data.trim()))));
      if (typeof parsed.cash !== 'number' || !parsed.generators) return false;
      localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
      this.state = this.load();
      this.emit();
      return true;
    } catch {
      return false;
    }
  }

  // ─── cloud backup ───
  cloudCode(): string { return this.state.cloudCode; }
  cloudSyncedAt(): number { return this.state.cloudSyncedAt; }

  /** Upload the current save to the player's cloud slot. */
  async cloudBackup(): Promise<CloudResult> {
    this.save();
    const res = await cloudPush(this.state.cloudCode, JSON.stringify(this.state));
    if (res.ok) {
      this.state.cloudSyncedAt = Date.now();
      this.save();
      this.emit();
    }
    return res;
  }

  /** Pull a save from a cloud code and adopt it (used on a new device). */
  async cloudRestore(code: string): Promise<CloudResult> {
    const res = await cloudPull(code.trim());
    if (!res.ok || !res.data) return res;
    try {
      const parsed = JSON.parse(res.data);
      if (typeof parsed.cash !== 'number' || !parsed.generators) return { ok: false, error: 'invalid' };
      localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
      this.state = this.load();
      this.emit();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  // ─── in-app purchases ───
  hasRemoveAds(): boolean { return this.state.removeAds; }

  /** Grant the effects of a completed purchase (called after the store confirms). */
  applyPurchase(productId: string): boolean {
    const p = PRODUCT_BY_ID[productId];
    if (!p) return false;
    if (p.kind === 'noncon') {
      if (this.state.iapOwned.includes(productId)) return false; // already owned
      this.state.iapOwned.push(productId);
      if (productId === 'remove_ads') this.state.removeAds = true;
      if (productId === 'starter_pack') this.state.starterPack = true;
    } else if (productId === 'vip_monthly' || p.kind === 'sub') {
      this.state.vip = true;
    } else if (productId === 'season_pass') {
      this.unlockSeasonPremium();
    } else if (p.gems) {
      this.state.gems += p.gems;
    }
    this.save();
    this.emit();
    return true;
  }

  /** Re-grant non-consumable entitlements after a store restore. */
  applyRestore(entitlements: string[]): void {
    if (entitlements.includes('remove_ads') && !this.state.removeAds) {
      this.state.removeAds = true;
      if (!this.state.iapOwned.includes('remove_ads')) this.state.iapOwned.push('remove_ads');
    }
    if (entitlements.includes('starter_pack') && !this.state.starterPack) {
      this.state.starterPack = true;
      if (!this.state.iapOwned.includes('starter_pack')) this.state.iapOwned.push('starter_pack');
    }
    // VIP is a subscription — its entitlement reflects the CURRENT active state
    this.state.vip = entitlements.includes('vip');
    this.save();
    this.emit();
  }

  // ─── lifecycle ───
  start(): void {
    if (this.tickHandle !== null) return;
    let last = performance.now();
    this.tickHandle = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 5);
      last = now;
      this.tick(dt);
      this.emit();
    }, 100);
    this.saveHandle = window.setInterval(() => this.save(), 10000);
    document.addEventListener('visibilitychange', this.onVisibility);
    window.addEventListener('beforeunload', () => this.save());
  }

  private onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      this.save();
    } else {
      // returning to a backgrounded tab/app: grant offline progress if meaningful
      const away = (Date.now() - this.state.lastSeen) / 1000;
      if (away > 60) {
        this.checkEventRollover(); // an event may have ended while away
        this.applyOfflineProgress();
        this.refreshDaily();
        this.emit();
      }
    }
  };

  subscribe = (fn: Listener): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getVersion = (): number => this.renderVersion;

  private emit(): void {
    this.renderVersion++;
    for (const fn of this.listeners) fn();
  }

  // ─── derived multipliers ───
  skillLevel(id: string): number {
    return this.state.skills[id] ?? 0;
  }

  eraIndex(): number {
    return Math.min(Math.max(this.state.erasUnlocked, 1), ERAS.length) - 1;
  }

  /** cash cost of the next era, or null when all eras are unlocked */
  nextEraCost(): number | null {
    if (this.state.erasUnlocked >= ERAS.length) return null;
    return ERAS[this.state.erasUnlocked].unlockCost;
  }

  unlockEra(): boolean {
    const cost = this.nextEraCost();
    if (cost === null || this.state.cash < cost) return false;
    this.state.cash -= cost;
    this.state.erasUnlocked++;
    if (this.state.sfxOn) audio.sfxUnlock();
    this.save();
    this.emit();
    return true;
  }

  prestigeMult(): number {
    const eff = 1 + this.skillLevel('chrono_power') * 0.1;
    return 1 + this.state.crystals * 0.02 * eff;
  }

  achievementMult(): number {
    return 1 + this.state.achievements.length * ACH_BONUS;
  }

  boostActive(): boolean {
    return Date.now() < this.state.boostUntil;
  }

  frenzyActive(): boolean {
    return Date.now() < this.state.frenzyUntil;
  }

  // ─── Golden Hour events ───
  eventActive(): boolean {
    return this.state.eventIdx >= 0 && Date.now() < this.state.eventUntil;
  }

  currentEvent() {
    return this.eventActive() ? EVENTS[this.state.eventIdx] : null;
  }

  eventMult(): number {
    const ev = this.currentEvent();
    return ev ? ev.mult : 1;
  }

  private scheduleEvent(): void {
    const gap = EVENT_MIN_GAP_S + Math.random() * (EVENT_MAX_GAP_S - EVENT_MIN_GAP_S);
    this.nextEventAt = Date.now() + gap * 1000;
  }

  private startRandomEvent(): void {
    this.state.eventIdx = Math.floor(Math.random() * EVENTS.length);
    this.state.eventUntil = Date.now() + EVENT_DURATION_S * 1000;
    if (this.state.sfxOn) audio.sfxUnlock();
    this.emit();
  }

  /** watching an ad extends the running event */
  extendEvent(): void {
    if (!this.eventActive()) return;
    this.state.eventUntil += EVENT_AD_EXTEND_S * 1000;
    this.state.adsWatched++;
    this.save();
    this.emit();
  }

  // ─── investors ───
  hasInvestor(id: string): boolean {
    return this.state.investors.includes(id);
  }

  /** aggregate a numeric perk across owned investors */
  private investorPerk(kind: 'global' | 'offline'): number {
    let m = 1;
    for (const id of this.state.investors) {
      const p = INVESTOR_BY_ID[id]?.perk;
      if (p && p.kind === kind) m *= p.mult;
    }
    return m;
  }

  investorSpeedAdd(): number {
    let a = 0;
    for (const id of this.state.investors) {
      const p = INVESTOR_BY_ID[id]?.perk;
      if (p && p.kind === 'speed') a += p.add;
    }
    return a;
  }

  investorCostCut(): number {
    let c = 0;
    for (const id of this.state.investors) {
      const p = INVESTOR_BY_ID[id]?.perk;
      if (p && p.kind === 'cost') c += p.cut;
    }
    return c;
  }

  investorAnomalyMult(): number {
    let m = 1;
    for (const id of this.state.investors) {
      const p = INVESTOR_BY_ID[id]?.perk;
      if (p && p.kind === 'anomaly') m *= p.mult;
    }
    return m;
  }

  investorEraMult(era: number): number {
    let m = 1;
    for (const id of this.state.investors) {
      const p = INVESTOR_BY_ID[id]?.perk;
      if (p && p.kind === 'era' && p.era === era) m *= p.mult;
    }
    return m;
  }

  buyInvestor(id: string): boolean {
    const def = INVESTOR_BY_ID[id];
    if (!def || this.hasInvestor(id) || this.state.crystals < def.cost) return false;
    this.state.crystals -= def.cost;
    this.state.investors.push(id);
    if (this.state.sfxOn) audio.sfxUnlock();
    this.save();
    this.emit();
    return true;
  }

  // ─── chrono rank ───
  rankIdx(): number {
    return rankIndex(this.state.totalCrystalsEarned);
  }

  rankMult(): number {
    return 1 + this.rankIdx() * RANK_BONUS_PER_TIER;
  }

  globalMult(): number {
    let m = ERAS[this.eraIndex()].mult * this.prestigeMult() * this.achievementMult() * this.rankMult();
    m *= this.investorPerk('global');
    m *= 1 + this.relicLevel('relic_income') * RELIC_BY_ID['relic_income'].value; // expedition relic
    m *= 1 + this.skillLevel('crit_income') * 0.04; // Critical Income skill
    m *= 1 + this.eonLevel('eon_power') * EON_UPGRADE_BY_ID['eon_power'].value; // Eon Upgrade
    if (this.state.starterPack) m *= 2; // permanent IAP boost
    if (this.state.vip) m *= 2; // VIP subscription perk
    if (this.state.eons > 0) m *= 1 + this.state.eons * EON_INCOME_BONUS; // 2nd-prestige boost
    const season = seasonalEvent();
    if (season) m *= season.mult; // weekend / power-hour / holiday live-ops bonus
    if (this.boostActive()) m *= 2;
    if (this.frenzyActive()) m *= RUSH_FRENZY_MULT;
    if (this.eventActive()) m *= this.eventMult();
    // (cash upgrades removed — profit boosts now come from collected cards, per venture)
    return m;
  }

  /** true when the player owns SET_BONUS_COUNT+ of all 4 ventures in an era */
  eraSetComplete(era: number): boolean {
    return GENERATORS.filter((g) => g.era === era).every(
      (g) => this.state.generators[g.id].count >= SET_BONUS_COUNT,
    );
  }

  generatorMult(genId: string): number {
    // profit multiplier from this venture's collected cards (replaces the old cash upgrades)
    let m = cardProfitMult(this.state.cards[genId] ?? 0);
    const era = GEN_BY_ID[genId].era;
    // era "collection" bonus: complete the set to double the whole era's output
    if (this.eraSetComplete(era)) m *= SET_BONUS_MULT;
    // legendary investor era boost
    m *= this.investorEraMult(era);
    m *= 1 + this.skillLevel('combo_master') * 0.05; // Combo Master skill
    if (this.state.albumsClaimed.includes(era)) m *= 1 + ALBUM_BONUS; // completed card album
    return m;
  }

  // ─── card albums (collect every card in an era) ───
  /** collected ≥1 of every venture's card in the era */
  albumComplete(era: number): boolean {
    return GENERATORS.filter((g) => g.era === era).every((g) => (this.state.cards[g.id] ?? 0) >= 1);
  }
  albumProgress(era: number): { have: number; total: number } {
    const gens = GENERATORS.filter((g) => g.era === era);
    return { have: gens.filter((g) => (this.state.cards[g.id] ?? 0) >= 1).length, total: gens.length };
  }
  albumClaimed(era: number): boolean { return this.state.albumsClaimed.includes(era); }
  albumsClaimable(): number {
    let n = 0;
    for (let era = 0; era < ERAS.length; era++) if (this.albumComplete(era) && !this.albumClaimed(era)) n++;
    return n;
  }
  claimAlbum(era: number): number {
    if (this.albumClaimed(era) || !this.albumComplete(era)) return 0;
    const gems = 15 + era * 4; // deeper eras → bigger reward
    this.state.gems += gems;
    this.state.albumsClaimed.push(era);
    if (this.state.sfxOn) audio.sfxUnlock();
    this.save();
    this.emit();
    return gems;
  }

  cycleSpeedMult(): number {
    return 1 + this.skillLevel('fast_cycles') * 0.1 + this.investorSpeedAdd()
      + this.relicLevel('relic_speed') * RELIC_BY_ID['relic_speed'].value
      + this.eonLevel('eon_speed') * EON_UPGRADE_BY_ID['eon_speed'].value;
  }

  /** effective seconds per cycle for a venture, after global speed + owned-count milestones */
  effectiveCycle(g: GeneratorDef): number {
    const count = this.state.generators[g.id].count;
    return (g.cycleTime * milestoneSpeed(count)) / this.cycleSpeedMult();
  }

  costDiscount(): number {
    return Math.max(0.1, 1 - this.skillLevel('cheap_deals') * 0.03 - this.investorCostCut()
      - this.relicLevel('relic_cost') * RELIC_BY_ID['relic_cost'].value
      - this.eonLevel('eon_cost') * EON_UPGRADE_BY_ID['eon_cost'].value);
  }

  /** revenue for one full cycle of a generator (all units) */
  cycleRevenue(g: GeneratorDef): number {
    const gs = this.state.generators[g.id];
    return g.baseRev * gs.count * milestoneMult(gs.count) * this.generatorMult(g.id) * this.globalMult();
  }

  /** average income per second for a generator (managed or running continuously) */
  revPerSec(g: GeneratorDef): number {
    const gs = this.state.generators[g.id];
    if (gs.count === 0) return 0;
    return this.cycleRevenue(g) / this.effectiveCycle(g);
  }

  /** total passive income/sec from managed generators */
  totalIncomePerSec(): number {
    let total = 0;
    for (const g of GENERATORS) {
      const gs = this.state.generators[g.id];
      if (gs.hasManager && gs.count > 0) total += this.revPerSec(g);
    }
    return total;
  }

  offlineCapHours(): number {
    return OFFLINE_CAP_BASE_HOURS + this.skillLevel('offline_cap') * 4
      + this.relicLevel('relic_offline') * RELIC_BY_ID['relic_offline'].value
      + this.eonLevel('eon_offline') * EON_UPGRADE_BY_ID['eon_offline'].value;
  }

  adBoostHours(): number {
    return AD_BOOST_BASE_HOURS + this.skillLevel('ad_master');
  }

  // ─── ticking ───
  private autoBuyAccum = 0;
  private autoBuyStep(): void {
    const gens = GENERATORS.filter((g) => g.era < this.state.erasUnlocked)
      .sort((a, b) => this.buyCost(a.id, 1).cost - this.buyCost(b.id, 1).cost);
    for (const g of gens) {
      if (this.state.cash >= this.buyCost(g.id, 1).cost) this.buyGenerator(g.id, 1);
    }
  }

  private tick(dt: number): void {
    // Event World tokens accrue continuously (event businesses are auto-producing)
    this.accrueEvent(dt);
    if (this.state.bossThreshold > 0) this.checkBoss();
    // Auto-Buy skill: periodically buy 1 of every affordable business (interval shrinks with level)
    const autoLvl = this.skillLevel('auto_buy');
    if (autoLvl > 0) {
      this.autoBuyAccum += dt;
      if (this.autoBuyAccum >= Math.max(1, 4 - autoLvl)) { this.autoBuyAccum = 0; this.autoBuyStep(); }
    }
    for (const g of GENERATORS) {
      const gs = this.state.generators[g.id];
      if (gs.count === 0) continue;
      const effCycle = this.effectiveCycle(g);
      if (gs.hasManager && effCycle <= 0.35) {
        // fast-cycle generators become continuous income
        this.earn(this.revPerSec(g) * dt);
        gs.progress = 1;
        gs.running = true;
        continue;
      }
      if (gs.hasManager && !gs.running) {
        gs.running = true;
        gs.progress = 0;
      }
      if (gs.running) {
        gs.progress += dt / effCycle;
        while (gs.progress >= 1) {
          this.earn(this.cycleRevenue(g));
          if (gs.hasManager) {
            gs.progress -= 1;
          } else {
            gs.progress = 0;
            gs.running = false;
            break;
          }
        }
      }
    }

    // anomaly spawning / expiry
    const now = Date.now();
    const anomFreq = this.investorAnomalyMult(); // faster anomalies with Merlin
    if (this.anomaly && now > this.anomaly.expiresAt) {
      this.anomaly = null;
      this.scheduleAnomaly();
    } else if (!this.anomaly && now >= this.nextAnomalyAt && this.state.lifetimeCash > 1000) {
      this.spawnAnomaly();
    }
    // apply anomaly frequency perk by shortening the next spawn window
    if (anomFreq > 1 && this.nextAnomalyAt - now > (ANOMALY_MAX_GAP_S * 1000) / anomFreq) {
      this.nextAnomalyAt = now + ((this.nextAnomalyAt - now) / anomFreq);
    }

    // Golden Rush comet spawning / expiry
    if (this.rush && now > this.rush.expiresAt) {
      this.rush = null;
      this.scheduleRush();
    } else if (!this.rush && now >= this.nextRushAt && this.state.lifetimeCash > 5000) {
      this.rush = { y: 20 + Math.random() * 40, expiresAt: now + RUSH_FLIGHT_S * 1000 };
    }

    // Golden Hour event: auto-start when scheduled; end + reschedule when over
    if (this.state.eventIdx >= 0 && now >= this.state.eventUntil) {
      this.state.eventIdx = -1;
      this.scheduleEvent();
    } else if (this.state.eventIdx < 0 && now >= this.nextEventAt && this.state.lifetimeCash > 10000) {
      this.startRandomEvent();
    }

    this.checkAchievements();
    this.sampleStats(now);
  }

  /** append an income/crystal data point to the rolling history for the stats graphs */
  private sampleStats(now: number): void {
    if (now - this.state.lastStatSampleAt < STAT_SAMPLE_MS) return;
    this.state.lastStatSampleAt = now;
    this.state.incomeHistory.push(this.totalIncomePerSec());
    this.state.crystalHistory.push(this.state.totalCrystalsEarned);
    if (this.state.incomeHistory.length > STAT_MAX_SAMPLES) this.state.incomeHistory.shift();
    if (this.state.crystalHistory.length > STAT_MAX_SAMPLES) this.state.crystalHistory.shift();
  }

  private scheduleRush(): void {
    const gap = RUSH_MIN_GAP_S + Math.random() * (RUSH_MAX_GAP_S - RUSH_MIN_GAP_S);
    this.nextRushAt = Date.now() + gap * 1000;
  }

  /** player caught the Golden Rush comet: instant cash + start the frenzy */
  catchRush(): number {
    if (!this.rush) return 0;
    this.rush = null;
    this.scheduleRush();
    this.state.frenzyUntil = Date.now() + RUSH_FRENZY_S * 1000;
    // instant reward: a chunk of frenzied production up front (was 60s + 10% cash — trimmed)
    const reward = Math.max(this.totalIncomePerSec() * 20, this.state.cash * 0.03, 100);
    this.earn(reward);
    if (this.state.sfxOn) audio.sfxReward();
    this.emit();
    return reward;
  }

  private earn(amount: number): void {
    this.state.cash += amount;
    this.state.lifetimeCash += amount;
    this.state.runCash += amount;
    this.state.dayEarned += amount;
    if (this.state.bossThreshold > 0) this.state.bossEarnedAmt += amount; // Time Keeper fight
  }

  // ─── player actions ───
  runGenerator(genId: string): void {
    const gs = this.state.generators[genId];
    if (gs.count === 0 || gs.running || gs.hasManager) return;
    const g = GEN_BY_ID[genId];
    const effCycle = this.effectiveCycle(g);
    if (effCycle <= 0.35) {
      // instant payout for very fast unmanaged cycles
      this.earn(this.cycleRevenue(g));
    } else {
      gs.running = true;
      gs.progress = 0;
    }
    this.emit();
  }

  buyCost(genId: string, amount: BuyAmount): { count: number; cost: number } {
    const g = GEN_BY_ID[genId];
    const gs = this.state.generators[genId];
    const r = g.costRate;
    const disc = this.costDiscount();
    const nextCost = g.baseCost * Math.pow(r, gs.count) * disc;
    if (amount === 'max') {
      const cash = this.state.cash;
      if (cash < nextCost) return { count: 1, cost: nextCost };
      const k = Math.floor(Math.log((cash * (r - 1)) / nextCost + 1) / Math.log(r));
      const n = Math.max(1, k);
      const cost = nextCost * (Math.pow(r, n) - 1) / (r - 1);
      return { count: n, cost };
    }
    const n = amount;
    const cost = nextCost * (Math.pow(r, n) - 1) / (r - 1);
    return { count: n, cost };
  }

  buyGenerator(genId: string, amount: BuyAmount): void {
    if (GEN_BY_ID[genId].era >= this.state.erasUnlocked) return; // era locked
    const { count, cost } = this.buyCost(genId, amount);
    if (this.state.cash < cost) return;
    this.state.cash -= cost;
    this.state.generators[genId].count += count;
    this.state.dayBought += count;
    if (this.state.sfxOn) audio.sfxBuy();
    this.emit();
  }

  /** QoL: buy MAX of every business in an era, cheapest first (most units for the cash) */
  buyMaxAll(era: number): void {
    if (era >= this.state.erasUnlocked) return;
    const gens = GENERATORS.filter((g) => g.era === era)
      .sort((a, b) => this.buyCost(a.id, 1).cost - this.buyCost(b.id, 1).cost);
    let boughtAny = false;
    // a few passes so cash freed-up ordering keeps buying until nothing is affordable
    for (let pass = 0; pass < 3; pass++) {
      let passBought = false;
      for (const g of gens) {
        const { cost } = this.buyCost(g.id, 'max');
        if (this.state.cash >= cost && this.buyCost(g.id, 'max').count >= 1 && this.state.cash >= this.buyCost(g.id, 1).cost) {
          this.buyGenerator(g.id, 'max');
          passBought = true; boughtAny = true;
        }
      }
      if (!passBought) break;
    }
    if (boughtAny) this.emit();
  }

  /** QoL: kick off every idle un-managed generator at once */
  collectAllIdle(): number {
    let started = 0;
    for (const g of GENERATORS) {
      const gs = this.state.generators[g.id];
      if (gs.count > 0 && !gs.hasManager && !gs.running) { this.runGenerator(g.id); started++; }
    }
    if (started > 0) this.emit();
    return started;
  }

  // ─── cosmetic skins ───
  buySkin(id: string): boolean {
    const def = SKIN_BY_ID[id];
    if (!def || this.state.ownedSkins.includes(id) || this.state.gems < def.cost) return false;
    this.state.gems -= def.cost;
    this.state.ownedSkins.push(id);
    this.state.skin = id; // auto-equip on purchase
    if (this.state.sfxOn) audio.sfxUnlock();
    this.save();
    this.emit();
    return true;
  }
  setSkin(id: string): void {
    if (!this.state.ownedSkins.includes(id)) return;
    this.state.skin = id;
    this.save();
    this.emit();
  }
  skinAccent(): Record<string, string> | null {
    return (SKIN_BY_ID[this.state.skin] ?? SKIN_BY_ID['default']).accent;
  }

  // ─── VIP subscription ───
  /** VIP owners skip ads (rewards granted instantly) — same as the No-Ads Pass */
  adsRemoved(): boolean { return this.state.removeAds || this.state.vip; }
  vipGemsAvailable(): boolean { return this.state.vip && this.state.vipGemsDate !== this.todayStr(); }
  claimVipGems(): boolean {
    if (!this.vipGemsAvailable()) return false;
    this.state.vipGemsDate = this.todayStr();
    this.state.gems += VIP_DAILY_GEMS;
    if (this.state.sfxOn) audio.sfxReward();
    this.save();
    this.emit();
    return true;
  }

  // ─── Time Keeper bosses ───
  /** transient: era threshold whose "you won!" celebration is pending (never saved) */
  bossWon = 0;

  /** the lowest reached-but-undefeated boss threshold, or null */
  availableBoss(): number | null {
    for (const th of BOSS_TIERS) {
      if (this.state.erasUnlocked >= th && !this.state.bossesDefeated.includes(th)) return th;
    }
    return null;
  }
  bossActive(): boolean { return this.state.bossThreshold > 0 && Date.now() < this.state.bossEndsAt; }
  bossTimeLeftMs(): number { return Math.max(0, this.state.bossEndsAt - Date.now()); }
  bossEarned(): number { return this.state.bossEarnedAmt; }

  startBoss(): boolean {
    const th = this.availableBoss();
    if (th === null || this.bossActive()) return false;
    this.state.bossThreshold = th;
    this.state.bossEndsAt = Date.now() + BOSS_DURATION_S * 1000;
    this.state.bossEarnedAmt = 0;
    this.state.bossTarget = Math.max(this.totalIncomePerSec() * BOSS_TARGET_SECONDS, this.state.cash * 0.5, 1000);
    if (this.state.sfxOn) audio.sfxAnomaly();
    this.save();
    this.emit();
    return true;
  }

  /** called from the tick: resolve a win (target reached) or a loss (time up) */
  private checkBoss(): void {
    if (this.state.bossThreshold <= 0) return;
    const th = this.state.bossThreshold;
    if (this.bossEarned() >= this.state.bossTarget) {
      // WIN
      const r = bossReward(th);
      this.state.gems += r.gems;
      const pool = CARDS_BY_RARITY['legendary'];
      for (let i = 0; i < r.cards; i++) {
        const pick = pool[Math.floor(Math.random() * pool.length)].id;
        this.state.cards[pick] = (this.state.cards[pick] ?? 0) + 1;
      }
      this.state.bossesDefeated.push(th);
      this.state.bossThreshold = 0;
      this.bossWon = th;
      this.syncManagers();
      if (this.state.sfxOn) audio.sfxRebirth();
      this.save();
    } else if (Date.now() >= this.state.bossEndsAt) {
      // time up → lose (can retry)
      this.state.bossThreshold = 0;
      if (this.state.sfxOn) audio.sfxError();
      this.save();
    }
  }
  clearBossWon(): void { this.bossWon = 0; this.emit(); }

  // ─── Challenge Mode ───
  private challengeValue(kind: string): number {
    const s = this.state;
    switch (kind) {
      case 'total_owned': return GENERATORS.reduce((a, g) => a + s.generators[g.id].count, 0);
      case 'own_single': return GENERATORS.reduce((m, g) => Math.max(m, s.generators[g.id].count), 0);
      case 'managers': return GENERATORS.filter((g) => s.generators[g.id].hasManager).length;
      case 'cards_single': return Object.values(s.cards).reduce((m, n) => Math.max(m, n), 0);
      case 'rebirth': return s.rebirths;
      case 'earn': return s.lifetimeCash;
      case 'era': return s.erasUnlocked;
      case 'exped_depth': return s.expBestDepth;
      case 'ascend': return s.ascensions;
      default: return 0;
    }
  }
  challengeProgress(id: string): number {
    const c = CHALLENGES.find((x) => x.id === id);
    return c ? Math.min(this.challengeValue(c.kind), c.n) : 0;
  }
  challengeDone(id: string): boolean {
    const c = CHALLENGES.find((x) => x.id === id);
    return !!c && this.challengeValue(c.kind) >= c.n;
  }
  challengeClaimed(id: string): boolean { return this.state.challengesDone.includes(id); }

  claimChallenge(id: string): boolean {
    if (this.challengeClaimed(id) || !this.challengeDone(id)) return false;
    const c = CHALLENGES.find((x) => x.id === id)!;
    this.state.gems += c.reward.gems;
    const pool = CARDS_BY_RARITY[c.reward.rarity];
    for (let i = 0; i < c.reward.cards; i++) {
      const pick = pool[Math.floor(Math.random() * pool.length)].id;
      this.state.cards[pick] = (this.state.cards[pick] ?? 0) + 1;
    }
    this.state.challengesDone.push(id);
    this.syncManagers();
    if (this.state.sfxOn) audio.sfxUnlock();
    this.save();
    this.emit();
    return true;
  }
  /** number of challenges done-but-unclaimed (for a badge) */
  challengesClaimable(): number {
    return CHALLENGES.filter((c) => this.challengeDone(c.id) && !this.challengeClaimed(c.id)).length;
  }

  /** count of idle un-managed generators (for the Collect All button) */
  idleGeneratorCount(): number {
    let n = 0;
    for (const g of GENERATORS) {
      const gs = this.state.generators[g.id];
      if (gs.count > 0 && !gs.hasManager && !gs.running) n++;
    }
    return n;
  }

  // Managers and profit boosts now come from CARDS, not cash. These stay as no-ops so any
  // legacy callers don't break; the Managers/Upgrades tabs are replaced by the Cards tab.
  buyManager(_genId: string): void { /* managers are card-gated now — see syncManagers() */ }
  buyUpgrade(_upgradeId: string): void { /* cash upgrades removed — profit comes from cards */ }

  // ─── cards & boxes ───
  /** a venture auto-runs once you've collected MANAGER_CARD_REQ of its card */
  syncManagers(): void {
    for (const g of GENERATORS) {
      const gs = this.state.generators[g.id];
      const active = cardManagerUnlocked(this.state.cards[g.id] ?? 0);
      gs.hasManager = active;
      if (!active) { gs.running = false; gs.progress = 0; }
    }
  }
  cardCount(venture: string): number { return this.state.cards[venture] ?? 0; }
  addGems(n: number): void { this.state.gems += n; this.save(); this.emit(); }

  // free "watch ad for gems" with a cooldown
  gemAdReady(): boolean { return Date.now() >= this.state.gemAdReadyAt; }
  gemAdReadyIn(): number { return Math.max(0, this.state.gemAdReadyAt - Date.now()); }
  grantGemAd(): void {
    if (!this.gemAdReady()) return;
    this.state.gems += AD_GEM_REWARD;
    this.state.gemAdReadyAt = Date.now() + GEM_AD_COOLDOWN_MIN * 60 * 1000;
    if (this.state.sfxOn) audio.sfxReward();
    this.save();
    this.emit();
  }

  private refreshBoxDay(): void {
    const today = this.todayStr();
    if (this.state.lastBoxDate !== today) { this.state.lastBoxDate = today; this.state.boxesToday = 0; }
  }
  boxesLeftToday(): number { this.refreshBoxDay(); return Math.max(0, MAX_BOXES_PER_DAY - this.state.boxesToday); }
  freeBoxAvailable(): boolean { this.refreshBoxDay(); return this.state.boxesToday < FREE_BOX_PER_DAY; }
  /** opening the daily box past the free one (but under the cap) requires watching an ad */
  boxNeedsAd(): boolean { this.refreshBoxDay(); return this.state.boxesToday >= FREE_BOX_PER_DAY && this.state.boxesToday < MAX_BOXES_PER_DAY; }

  private grantCards(ids: string[]): void {
    for (const id of ids) this.state.cards[id] = (this.state.cards[id] ?? 0) + 1;
    this.syncManagers();
  }

  /** open the free/ad daily Uncommon box → drawn card ids, or null if the daily cap is hit */
  openDailyBox(): string[] | null {
    this.refreshBoxDay();
    if (this.state.boxesToday >= MAX_BOXES_PER_DAY) return null;
    const ids = rollBox('uncommon');
    this.grantCards(ids);
    this.state.boxesToday++;
    this.state.dayBoxes++;
    if (this.state.sfxOn) audio.sfxReward();
    this.save(); this.emit();
    return ids;
  }

  /** fusion is offered only for SURPLUS cards, so it can never drop a manager/tier you rely on */
  canFuse(cardId: string): boolean {
    return this.cardCount(cardId) - FUSION_COST >= MANAGER_CARD_REQ;
  }

  /** fuse 5 copies of a card → 1 random card of the next rarity up. Returns the new card id. */
  fuseCard(cardId: string): string | null {
    if (!this.canFuse(cardId)) return null;
    const def = CARD_BY_ID[cardId];
    if (!def) return null;
    const targetRarity = nextRarity(def.rarity);
    const pool = CARDS_BY_RARITY[targetRarity];
    const pick = pool[Math.floor(Math.random() * pool.length)].id;
    this.state.cards[cardId] -= FUSION_COST;
    this.state.cards[pick] = (this.state.cards[pick] ?? 0) + 1;
    this.syncManagers();
    if (this.state.sfxOn) audio.sfxManager();
    this.save();
    this.emit();
    return pick;
  }

  /** open a gem-bought box → drawn card ids, or null if not enough gems */
  openGemBox(boxId: string): string[] | null {
    const box = BOX_BY_ID[boxId];
    if (!box || box.gemCost <= 0 || this.state.gems < box.gemCost) return null;
    this.state.gems -= box.gemCost;
    const ids = rollBox(boxId);
    this.grantCards(ids);
    this.state.dayBoxes++;
    if (this.state.sfxOn) audio.sfxReward();
    this.save(); this.emit();
    return ids;
  }

  buySkill(skillId: string): void {
    const def = SKILL_BY_ID[skillId];
    const lvl = this.skillLevel(skillId);
    if (!def || lvl >= def.maxLevel) return;
    const cost = skillCost(def, lvl);
    if (this.state.crystals < cost) return;
    this.state.crystals -= cost;
    this.state.skills[skillId] = lvl + 1;
    this.emit();
  }

  pendingCrystals(): number {
    let base = crystalsForRun(this.state.runCash);
    base *= 1 + this.eonLevel('eon_prestige') * EON_UPGRADE_BY_ID['eon_prestige'].value; // Eon Upgrade
    if (this.state.eons > 0) return Math.floor(base * (1 + this.state.eons * EON_CRYSTAL_BONUS));
    return Math.floor(base);
  }

  canRebirth(): boolean {
    return this.pendingCrystals() >= 1;
  }

  // ─── second prestige: Ascension → Eon Crystals ───
  /** Chrono Crystals earned since the last ascension (drives the Eon payout). */
  epochCrystals(): number {
    return Math.max(0, this.state.totalCrystalsEarned - this.state.ascensionStartCrystals);
  }
  pendingEons(): number {
    return eonsForAscension(this.epochCrystals());
  }
  /** true once the player has rebirthed enough AND has ≥1 Eon waiting */
  canAscend(): boolean {
    return this.state.rebirths >= ASCEND_MIN_REBIRTHS && this.pendingEons() >= 1;
  }
  /** progress toward the ascension gate, 0..1 (rebirth gate × crystal gate) */
  ascendProgress(): number {
    const rebirthPart = Math.min(1, this.state.rebirths / ASCEND_MIN_REBIRTHS);
    const crystalPart = Math.min(1, this.epochCrystals() / EON_BASE);
    return Math.min(rebirthPart, crystalPart);
  }
  eonIncomeBonus(): number {
    return this.state.eons * EON_INCOME_BONUS;
  }

  // ─── Eon Upgrades (permanent, bought with eons) ───
  eonLevel(id: string): number { return this.state.eonUpgrades?.[id] ?? 0; }
  eonUpgradeCostFor(id: string): number { return eonUpgradeCost(EON_UPGRADE_BY_ID[id], this.eonLevel(id)); }
  buyEonUpgrade(id: string): boolean {
    const def = EON_UPGRADE_BY_ID[id];
    if (!def) return false;
    const lvl = this.eonLevel(id);
    if (lvl >= def.maxLevel) return false;
    const cost = this.eonUpgradeCostFor(id);
    if (this.state.eons < cost) return false;
    this.state.eons -= cost;
    this.state.eonUpgrades[id] = lvl + 1;
    if (this.state.sfxOn) audio.sfxManager();
    this.save();
    this.emit();
    return true;
  }

  ascend(): void {
    if (!this.canAscend()) return;
    const s = this.state;
    s.eons += this.pendingEons();
    s.ascensions += 1;
    s.ascensionStartCrystals = s.totalCrystalsEarned;
    // deep reset: crystals, skills and investors are all crystal-bought → they reset too
    s.crystals = 0;
    s.skills = {};
    s.investors = [];
    s.rebirths = 0;
    s.cash = 0;
    s.runCash = 0;
    s.upgrades = [];
    s.generators = defaultGenerators();
    s.erasUnlocked = 1;
    s.boostUntil = 0;
    s.frenzyUntil = 0;
    s.eventIdx = -1;
    s.questIndex = 0; // fresh quest chain for the new epoch
    this.anomaly = null;
    this.rush = null;
    this.scheduleAnomaly();
    this.scheduleRush();
    this.scheduleEvent();
    this.syncManagers(); // cards persist through ascension → managers re-derive
    if (s.sfxOn) audio.sfxRebirth();
    this.save();
    this.emit();
  }

  rebirth(): void {
    const gained = this.pendingCrystals();
    if (gained < 1) return;
    const s = this.state;
    s.crystals += gained;
    s.totalCrystalsEarned += gained;
    s.rebirths += 1;
    s.cash = 0;
    s.runCash = 0;
    s.upgrades = [];
    s.generators = defaultGenerators();
    s.erasUnlocked = 1;
    // head_start skill: begin each timeline with free Stone Age ventures
    const hs = this.skillLevel('head_start');
    if (hs > 0) {
      s.generators['firepit'].count = hs * 15;
      s.generators['huntcamp'].count = hs * 8;
      s.generators['mammoth'].count = hs * 3;
    }
    s.boostUntil = 0;
    s.frenzyUntil = 0;
    s.eventIdx = -1;
    this.anomaly = null;
    this.rush = null;
    this.scheduleAnomaly();
    this.scheduleRush();
    this.scheduleEvent();
    this.syncManagers(); // cards persist through rebirth → managers re-derive from the collection
    if (s.sfxOn) audio.sfxRebirth();
    this.save();
    this.emit();
  }

  // ─── offline progress ───
  private applyOfflineProgress(): void {
    const now = Date.now();
    const rawSeconds = (now - this.state.lastSeen) / 1000;
    this.state.lastSeen = now;
    // Event World offline: accrue tokens (capped). Capture the gain so the welcome-back summary
    // can report festival earnings alongside the main game.
    let eventTokens = 0;
    if (rawSeconds >= 60) {
      const before = this.state.eventTokens;
      this.accrueEvent(Math.min(rawSeconds, EVENT_OFFLINE_CAP_H * 3600));
      eventTokens = this.state.eventTokens - before;
    }
    this.state.eventLastSeen = now;
    if (rawSeconds < 60) return;
    const cap = this.offlineCapHours() * 3600;
    const seconds = Math.min(rawSeconds, cap);
    const income = this.totalIncomePerSec();
    const cashEarned = income > 0 ? income * seconds * this.investorPerk('offline') : 0; // Nefertari boosts offline
    if (cashEarned > 0) this.earn(cashEarned);
    if (cashEarned <= 0 && eventTokens <= 0) return;
    this.offlineReport = { seconds, cashEarned, eventTokens: eventTokens > 0 ? eventTokens : undefined };
  }

  claimOfflineDouble(): void {
    if (!this.offlineReport) return;
    this.earn(this.offlineReport.cashEarned);
    this.state.adsWatched++;
    this.offlineReport = null;
    this.emit();
  }

  dismissOffline(): void {
    this.offlineReport = null;
    this.emit();
  }

  // ─── daily rewards ───
  private todayStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  private refreshDaily(): void {
    const today = this.todayStr();
    if (this.state.lastDailyDate === today) {
      this.state.dailyClaimable = false;
      return;
    }
    // streak broken if more than ~1 day gap
    const last = this.state.lastDailyDate ? new Date(this.state.lastDailyDate).getTime() : 0;
    if (last && Date.now() - last > 2 * 86400 * 1000) {
      this.state.dailyStreak = 0;
    }
    this.state.dailyClaimable = true;
  }

  claimDaily(): { type: 'cash' | 'crystal' | 'gems' | 'card'; value: number } | null {
    if (!this.state.dailyClaimable) return null;
    const day = this.state.dailyStreak % DAILY_REWARDS.length;
    const def = DAILY_REWARDS[day];
    let value = def.amount;
    if (def.type === 'cash') {
      value = Math.max(this.totalIncomePerSec(), 1) * def.amount * 60;
      this.earn(value);
    } else if (def.type === 'crystal') {
      this.state.crystals += value;
      this.state.totalCrystalsEarned += value;
    } else if (def.type === 'gems') {
      this.state.gems += value;
    } else if (def.type === 'card') {
      this.grantCards(rollBox('uncommon').slice(0, value));
    }
    this.state.dailyStreak++;
    this.state.lastDailyDate = this.todayStr();
    this.state.dailyClaimable = false;
    this.save();
    this.emit();
    return { type: def.type, value };
  }

  // ─── ads ───
  applyAdBoost(): void {
    const now = Date.now();
    const base = Math.max(now, this.state.boostUntil);
    const capped = Math.min(base + this.adBoostHours() * 3600 * 1000, now + 24 * 3600 * 1000);
    this.state.boostUntil = capped;
    this.state.adsWatched++;
    this.save();
    this.emit();
  }

  timewarpReady(): boolean {
    return Date.now() >= this.state.timewarpReadyAt;
  }

  applyTimewarp(): number {
    const income = this.totalIncomePerSec();
    const gained = income * TIMEWARP_HOURS * 3600;
    this.earn(gained);
    this.state.timewarpReadyAt = Date.now() + TIMEWARP_COOLDOWN_MIN * 60 * 1000;
    this.state.adsWatched++;
    this.save();
    this.emit();
    return gained;
  }

  crystalAdReady(): boolean {
    return Date.now() >= this.state.crystalAdReadyAt;
  }

  crystalAdAmount(): number {
    return Math.max(1, Math.floor(this.pendingCrystals() * 0.05));
  }

  applyCrystalAd(): number {
    const amount = this.crystalAdAmount();
    this.state.crystals += amount;
    this.state.totalCrystalsEarned += amount;
    this.state.crystalAdReadyAt = Date.now() + CRYSTAL_AD_COOLDOWN_MIN * 60 * 1000;
    this.state.adsWatched++;
    this.save();
    this.emit();
    return amount;
  }

  // ─── anomalies ───
  private scheduleAnomaly(): void {
    const gap = ANOMALY_MIN_GAP_S + Math.random() * (ANOMALY_MAX_GAP_S - ANOMALY_MIN_GAP_S);
    this.nextAnomalyAt = Date.now() + gap * 1000;
  }

  private spawnAnomaly(): void {
    const income = this.totalIncomePerSec();
    const golden = (1 + this.skillLevel('golden_touch') * 0.25) * this.investorAnomalyMult();
    // was income*90 + 5% of cash — a huge free lump every couple minutes. Cut to ~25s of income.
    const reward = Math.max(income * 25 * golden, this.state.cash * 0.015 * golden, 50);
    this.anomaly = {
      x: 8 + Math.random() * 74,
      y: 18 + Math.random() * 45,
      expiresAt: Date.now() + ANOMALY_LIFETIME_S * 1000,
      rewardCash: reward,
    };
  }

  /** ad-rewarded ×3 on an already-collected anomaly: grant the missing 2× */
  grantAnomalyTriple(baseReward: number): number {
    this.earn(baseReward * 2);
    this.state.adsWatched++;
    this.emit();
    return baseReward * 2;
  }

  catchAnomaly(tripled: boolean): number {
    if (!this.anomaly) return 0;
    const reward = this.anomaly.rewardCash * (tripled ? 3 : 1);
    this.earn(reward);
    this.state.anomaliesCaught++;
    if (tripled) this.state.adsWatched++;
    this.anomaly = null;
    this.scheduleAnomaly();
    if (this.state.sfxOn) audio.sfxAnomaly();
    this.emit();
    return reward;
  }

  // ─── achievements ───
  private checkAchievements(): void {
    const s = this.state;
    for (const a of ACHIEVEMENTS) {
      if (s.achievements.includes(a.id)) continue;
      let done = false;
      switch (a.kind) {
        case 'own': done = s.generators[a.target!].count >= a.n; break;
        case 'earn': done = s.lifetimeCash >= a.n; break;
        case 'rebirth': done = s.rebirths >= a.n; break;
        case 'ads': done = s.adsWatched >= a.n; break;
        case 'anomaly': done = s.anomaliesCaught >= a.n; break;
        case 'managers': done = GENERATORS.filter((g) => s.generators[g.id].hasManager).length >= a.n; break;
        case 'era': done = s.erasUnlocked >= a.n; break;
      }
      if (done) {
        s.achievements.push(a.id);
        s.gems += ACH_TIER_GEMS[achTier(a)]; // bronze/silver/gold → 10/25/50 gems
      }
    }
  }

  // ─── quest chain ───
  currentQuest(): QuestDef | null {
    return QUESTS[this.state.questIndex] ?? null;
  }

  questProgress(): { cur: number; goal: number; done: boolean } {
    const q = this.currentQuest();
    if (!q) return { cur: 1, goal: 1, done: true };
    const s = this.state;
    let cur = 0;
    switch (q.kind) {
      case 'own': cur = s.generators[q.target!].count; break;
      case 'era': cur = s.erasUnlocked; break;
      case 'managers': cur = GENERATORS.filter((g) => s.generators[g.id].hasManager).length; break;
      case 'ads': cur = s.adsWatched; break;
      case 'anomaly': cur = s.anomaliesCaught; break;
      case 'rebirth': cur = s.rebirths; break;
      case 'earn': cur = s.lifetimeCash; break;
    }
    return { cur: Math.min(cur, q.n), goal: q.n, done: cur >= q.n };
  }

  /** claim the current quest reward and advance; returns a short reward label or null */
  claimQuest(): { crystals?: number; cash?: number; gems?: number } | null {
    const q = this.currentQuest();
    if (!q || !this.questProgress().done) return null;
    const out: { crystals?: number; cash?: number; gems?: number } = {};
    if (q.crystals) {
      this.state.crystals += q.crystals;
      this.state.totalCrystalsEarned += q.crystals;
      out.crystals = q.crystals;
    }
    // every quest also drops a few Gems for card boxes (steady free-to-play gem income)
    const gemReward = (q.gems ?? 0) + 10;
    this.state.gems += gemReward;
    out.gems = gemReward;
    if (q.cashMins) {
      // reward = a modest slice of production with an era-scaled floor so it never feels tiny.
      // Deliberately small: quests GUIDE progression — they must not hand you cash to skip an era.
      // Strip transient multipliers (×2 boost, frenzy, event) so a lucky moment can't inflate it.
      let income = this.totalIncomePerSec();
      if (this.boostActive()) income /= 2;
      if (this.frenzyActive()) income /= RUSH_FRENZY_MULT;
      if (this.eventActive()) income /= this.eventMult();
      const floor = ERA_BASE[this.eraIndex()] * 1.5 * q.cashMins;
      const cash = Math.max(income * q.cashMins * 3, floor);
      this.earn(cash);
      out.cash = cash;
    }
    this.state.questIndex++;
    if (this.state.sfxOn) audio.sfxReward();
    this.save();
    this.emit();
    return out;
  }

  setLang(lang: string): void {
    this.state.lang = lang;
    this.save();
    this.emit();
  }

  dismissTutorial(): void {
    this.state.tutorialDone = true;
    this.save();
    this.emit();
  }

  /** the active calendar-driven seasonal bonus, or null */
  currentSeasonal(): SeasonalEvent | null {
    return seasonalEvent();
  }

  // ─── global leaderboard (weekly) ───
  /** the number ranked on the all-time board: lifetime crystals, boosted by ascension Eons */
  leaderboardScore(): number {
    return Math.floor(this.state.totalCrystalsEarned + this.state.eons * 1000);
  }
  /** the current 7-day competition id, and how much time is left in it */
  weeklyId(now = Date.now()): number { return Math.floor((now - LB_WEEK_EPOCH) / LB_WEEK_MS); }
  weekTimeLeftMs(): number { return Math.max(0, LB_WEEK_EPOCH + (this.weeklyId() + 1) * LB_WEEK_MS - Date.now()); }
  /** PROGRESS made this week — resets every week for a fresh competition */
  weeklyScore(): number { return Math.max(0, this.leaderboardScore() - this.state.weekStartScore); }

  /** roll the weekly baseline when a new week starts (called on load + before submitting) */
  checkWeekRollover(): void {
    const cur = this.weeklyId();
    if (this.state.weekId !== cur) {
      this.state.weekId = cur;
      this.state.weekStartScore = this.leaderboardScore(); // this week's progress restarts at 0
    }
  }

  async submitLeaderboard(name: string): Promise<boolean> {
    const clean = name.trim().slice(0, 16);
    this.state.playerName = clean;
    this.checkWeekRollover();
    this.save();
    this.emit();
    // submit to both the all-time board and the current weekly board
    await submitScore(this.state.cloudCode, clean, this.leaderboardScore());
    return submitScore(this.state.cloudCode, clean, this.weeklyScore(), `scores_w${this.state.weekId}`);
  }
  async fetchLeaderboard(limit = 20): Promise<LbEntry[]> {
    this.checkWeekRollover();
    return topScores(limit, this.state.cloudCode, `scores_w${this.state.weekId}`);
  }

  /** weekly reward is claimable once per week; reward scales with your rank in the board */
  weeklyRewardClaimable(): boolean { return this.state.weeklyRewardWeek !== this.weeklyId(); }
  /** gems for a given weekly rank (1-based); 0 if not ranked */
  weeklyRewardGems(rank: number): number {
    if (rank <= 0) return 8;
    if (rank === 1) return 100;
    if (rank <= 3) return 60;
    if (rank <= 10) return 40;
    if (rank <= 50) return 20;
    return 10;
  }
  claimWeeklyReward(rank: number): number {
    if (!this.weeklyRewardClaimable()) return 0;
    const gems = this.weeklyRewardGems(rank);
    this.state.gems += gems;
    this.state.weeklyRewardWeek = this.weeklyId();
    if (this.state.sfxOn) audio.sfxReward();
    this.save();
    this.emit();
    return gems;
  }

  setNotation(n: 'suffix' | 'scientific'): void {
    this.state.notation = n;
    this.save();
    this.emit();
  }

  /** current era id, used to pick background music */
  currentEraId(): string {
    return ERAS[this.eraIndex()].id;
  }

  setMusic(on: boolean): void {
    this.state.musicOn = on;
    audio.setMusicEnabled(on);
    this.save();
    this.emit();
  }

  setSfx(on: boolean): void {
    this.state.sfxOn = on;
    this.save();
    this.emit();
  }

  setNotifs(on: boolean): void {
    this.state.notifsOn = on;
    this.save();
    this.emit();
  }

  setMusicVol(v: number): void {
    this.state.musicVol = Math.max(0, Math.min(1, v));
    audio.setMusicVolume(this.state.musicVol);
    this.save();
    this.emit();
  }

  setSfxVol(v: number): void {
    this.state.sfxVol = Math.max(0, Math.min(1, v));
    audio.setSfxVolume(this.state.sfxVol);
    // little audible confirmation so the slider gives feedback while dragging
    if (this.state.sfxOn) audio.sfxTap();
    this.save();
    this.emit();
  }

  // ─── Temporal Expeditions (active roguelite mode) ───

  /** transient UI flag — true while the expedition overlay is mounted (never saved) */
  expeditionOpen = false;

  expeditionUnlocked(): boolean {
    return this.state.erasUnlocked >= EXP_UNLOCK_ERAS || this.state.rebirths >= 1;
  }

  private refreshExpDay(): void {
    const today = this.todayStr();
    if (this.state.expDate !== today) { this.state.expDate = today; this.state.expToday = 0; }
  }
  expeditionsLeftToday(): number { this.refreshExpDay(); return Math.max(0, EXP_MAX_PER_DAY - this.state.expToday); }
  /** past the free runs (but under the cap) the extra run requires a rewarded ad */
  expeditionNeedsAd(): boolean {
    this.refreshExpDay();
    return this.state.expToday >= EXP_FREE_PER_DAY && this.state.expToday < EXP_MAX_PER_DAY;
  }

  /** consume a daily slot and open the run overlay */
  startExpedition(): boolean {
    this.refreshExpDay();
    if (!this.expeditionUnlocked() || this.state.expToday >= EXP_MAX_PER_DAY) return false;
    this.state.expToday++;
    this.state.dayExped++;
    this.expeditionOpen = true;
    if (this.state.sfxOn) audio.sfxAnomaly();
    this.save();
    this.emit();
    return true;
  }

  /** bank a decision-run's earned shards. `shards` already computed by the run UI; `depth` = nodes
   *  survived. The UI applies the 50% collapse penalty before calling this. */
  finishExpedition(shards: number, depth: number): number {
    const banked = Math.max(0, Math.round(shards));
    this.state.shards += banked;
    this.state.expBestDepth = Math.max(this.state.expBestDepth, depth);
    if (banked > 0 && this.state.sfxOn) audio.sfxReward();
    this.save();
    this.emit();
    return banked;
  }

  /** unmount the expedition overlay (called from its result screen) */
  closeExpedition(): void {
    this.expeditionOpen = false;
    this.emit();
  }

  relicLevel(id: string): number {
    return this.state.relics?.[id] ?? 0;
  }

  buyRelic(id: string): boolean {
    const def = RELIC_BY_ID[id];
    if (!def) return false;
    const lvl = this.relicLevel(id);
    if (lvl >= def.maxLevel) return false;
    const cost = relicCost(def, lvl);
    if (this.state.shards < cost) return false;
    this.state.shards -= cost;
    this.state.relics[id] = lvl + 1;
    if (this.state.sfxOn) audio.sfxManager();
    this.save();
    this.emit();
    return true;
  }

  /** relic_start adds to the Stability a run begins with */
  expeditionStartStability(): number {
    return EXP_START_STABILITY + this.relicLevel('relic_start') * RELIC_BY_ID['relic_start'].value;
  }

  // ─── Season Pass ───
  private refreshDayCounters(): void {
    const today = this.todayStr();
    if (this.state.dayDate !== today) {
      this.state.dayDate = today;
      this.state.dayBought = 0; this.state.dayEarned = 0;
      this.state.dayBoxes = 0; this.state.daySpins = 0; this.state.dayExped = 0;
    }
  }

  /** roll the season over when the 30-day cycle changes: reset XP/tiers/premium/tasks */
  checkSeasonRollover(): void {
    const cur = seasonId();
    if (this.state.seasonId === cur) return;
    this.state.seasonId = cur;
    this.state.seasonXp = 0;
    this.state.seasonPremium = false;
    this.state.seasonFreeClaimed = 0;
    this.state.seasonPremiumClaimed = 0;
    this.state.seasonTasks = [];
    this.state.seasonTaskDate = '';
  }

  seasonTimeLeftMs(): number { return Math.max(0, seasonEndsAt() - Date.now()); }
  seasonTier(): number { return seasonTierForXp(this.state.seasonXp); }
  seasonTierProgress(): { xpIn: number; xpNeed: number } {
    const tier = this.seasonTier();
    return { xpIn: this.state.seasonXp - seasonTierXp(tier), xpNeed: SEASON_XP_PER_TIER };
  }

  /** assign today's 3 tasks if not done yet (or the day changed) */
  refreshSeasonTasks(): void {
    this.checkSeasonRollover();
    this.refreshDayCounters();
    const today = this.todayStr();
    if (this.state.seasonTaskDate !== today || this.state.seasonTasks.length === 0) {
      this.state.seasonTaskDate = today;
      this.state.seasonTasks = assignTasks(this.totalIncomePerSec());
    }
  }

  seasonTaskProgress(id: string): number {
    switch (id) {
      case 'buy': return this.state.dayBought;
      case 'earn': return this.state.dayEarned;
      case 'boxes': return this.state.dayBoxes;
      case 'spins': return this.state.daySpins;
      case 'exped': return this.state.dayExped;
      default: return 0;
    }
  }

  claimSeasonTask(index: number): boolean {
    this.refreshSeasonTasks();
    const task = this.state.seasonTasks[index];
    if (!task || task.claimed) return false;
    if (this.seasonTaskProgress(task.id) < task.target) return false;
    task.claimed = true;
    this.state.seasonXp += task.xp;
    if (this.state.sfxOn) audio.sfxReward();
    this.save();
    this.emit();
    return true;
  }

  private grantReward(r: { kind: string; amount: number }): void {
    switch (r.kind) {
      case 'cash': this.earn(Math.max(this.totalIncomePerSec() * r.amount, this.state.cash * 0.03, 500)); break;
      case 'gems': this.state.gems += r.amount; break;
      case 'boost': { const base = Math.max(Date.now(), this.state.boostUntil); this.state.boostUntil = base + r.amount * 60_000; break; }
      case 'card': this.grantCards(rollBox('uncommon').slice(0, r.amount)); break;
    }
  }

  /** claim all unclaimed FREE (and PREMIUM if owned) rewards up to the current tier */
  claimSeasonRewards(): number {
    const tier = this.seasonTier();
    let claimed = 0;
    for (let tr = this.state.seasonFreeClaimed + 1; tr <= tier; tr++) {
      this.grantReward(seasonFreeReward(tr));
      this.state.seasonFreeClaimed = tr;
      claimed++;
    }
    if (this.state.seasonPremium) {
      for (let tr = this.state.seasonPremiumClaimed + 1; tr <= tier; tr++) {
        this.grantReward(seasonPremiumReward(tr));
        this.state.seasonPremiumClaimed = tr;
        claimed++;
      }
    }
    if (claimed > 0 && this.state.sfxOn) audio.sfxUnlock();
    this.save();
    this.emit();
    return claimed;
  }

  seasonUnclaimedCount(): number {
    const tier = this.seasonTier();
    let n = Math.max(0, tier - this.state.seasonFreeClaimed);
    if (this.state.seasonPremium) n += Math.max(0, tier - this.state.seasonPremiumClaimed);
    return n;
  }

  /** unlock the premium track for this season (called after the season_pass IAP) */
  unlockSeasonPremium(): void {
    this.state.seasonPremium = true;
    // retro-grant premium rewards for tiers already reached
    this.claimSeasonRewards();
    this.save();
    this.emit();
  }

  // ─── Event World (limited-time parallel world) ───

  /** transient — true while the Event World overlay is open (never saved) */
  eventWorldOpen = false;

  openEventWorld(): void {
    this.checkEventRollover();
    this.eventWorldOpen = true;
    if (this.state.sfxOn) audio.sfxUnlock();
    this.emit();
  }
  closeEventWorld(): void { this.eventWorldOpen = false; this.emit(); }

  eventTimeLeftMs(): number { return Math.max(0, eventEndsAt() - Date.now()); }

  /** if the 10-day cycle rolled over, pay out the previous cycle's tokens as gems and reset. */
  checkEventRollover(): void {
    const cur = eventCycleId();
    if (this.state.eventCycleId === cur) return;
    const gems = eventGemsFor(this.state.eventTokensEarned);
    if (gems > 0) {
      this.state.gems += gems;
      this.state.eventPayoutGems += gems; // queued for the celebration modal
    }
    this.state.eventCycleId = cur;
    this.state.eventTokens = EVENT_START_TOKENS;
    this.state.eventTokensEarned = 0;
    this.state.eventGens = {};
    this.state.eventStagesUnlocked = 1;
    this.state.eventLastSeen = Date.now();
  }

  /** the current stage's global multiplier (unlocking a stage multiplies ALL event income) */
  eventStageMult(): number {
    const i = Math.min(this.state.eventStagesUnlocked, EVENT_STAGES.length) - 1;
    return EVENT_STAGES[Math.max(0, i)].mult;
  }

  /** tokens/sec from one business AFTER the stage multiplier (for the UI) */
  eventGenIncome(id: string): number {
    return eventGenRate(EVENT_GEN_BY_ID[id], this.eventGenCount(id)) * this.eventStageMult();
  }

  /** total Event Tokens produced per second (stage mult × Frenzy boost) */
  eventIncomePerSec(): number {
    let t = 0;
    for (const g of EVENT_GENS) t += eventGenRate(g, this.state.eventGens[g.id] ?? 0);
    return t * this.eventStageMult() * (this.eventBoostActive() ? EVENT_BOOST_MULT : 1);
  }

  /** token cost to unlock the next festival stage, or null if all unlocked */
  eventNextStageCost(): number | null {
    const next = EVENT_STAGES[this.state.eventStagesUnlocked];
    return next ? next.unlockCost : null;
  }

  unlockEventStage(): boolean {
    const cost = this.eventNextStageCost();
    if (cost === null || this.state.eventTokens < cost) return false;
    this.state.eventTokens -= cost;
    this.state.eventStagesUnlocked++;
    if (this.state.sfxOn) audio.sfxUnlock();
    this.save();
    this.emit();
    return true;
  }

  eventBoostActive(): boolean { return Date.now() < (this.state.eventBoostUntil ?? 0); }
  eventBoostLeftMs(): number { return Math.max(0, (this.state.eventBoostUntil ?? 0) - Date.now()); }

  /** grant a Festival Frenzy (called after a rewarded ad): ×3 event tokens for a while */
  startEventBoost(): void {
    const base = Math.max(Date.now(), this.state.eventBoostUntil ?? 0);
    this.state.eventBoostUntil = base + EVENT_BOOST_MIN * 60_000;
    if (this.state.sfxOn) audio.sfxReward();
    this.save();
    this.emit();
  }

  eventGenCount(id: string): number { return this.state.eventGens[id] ?? 0; }

  /** bulk-buy cost + count for an event business, like the main game's buyCost */
  eventBuyCost(id: string, amount: BuyAmount): { count: number; cost: number } {
    return eventBuyCost(EVENT_GEN_BY_ID[id], this.eventGenCount(id), amount, this.state.eventTokens);
  }

  buyEventGen(id: string, amount: BuyAmount = 1): boolean {
    const def = EVENT_GEN_BY_ID[id];
    if (!def) return false;
    const { count, cost } = this.eventBuyCost(id, amount);
    if (this.state.eventTokens < cost) return false;
    this.state.eventTokens -= cost;
    this.state.eventGens[id] = this.eventGenCount(id) + count;
    if (this.state.sfxOn) audio.sfxBuy();
    this.save();
    this.emit();
    return true;
  }

  /** gems the current cycle's earnings would pay out right now (live preview) */
  eventGemsPreview(): number { return eventGemsFor(this.state.eventTokensEarned); }

  /** clear the queued payout after the celebration modal is shown */
  claimEventPayout(): void { this.state.eventPayoutGems = 0; this.save(); this.emit(); }

  // ─── Daily Wheel ───
  private refreshWheelDay(): void {
    const today = this.todayStr();
    if (this.state.wheelDate !== today) { this.state.wheelDate = today; this.state.wheelSpins = 0; }
  }
  wheelSpinsLeft(): number { this.refreshWheelDay(); return Math.max(0, WHEEL_MAX_PER_DAY - this.state.wheelSpins); }
  wheelFreeAvailable(): boolean { this.refreshWheelDay(); return this.state.wheelSpins < WHEEL_FREE_PER_DAY; }
  /** past the free spin (but under the cap) the next spin needs a rewarded ad */
  wheelNeedsAd(): boolean {
    this.refreshWheelDay();
    return this.state.wheelSpins >= WHEEL_FREE_PER_DAY && this.state.wheelSpins < WHEEL_MAX_PER_DAY;
  }

  /** spin the wheel → the winning prize index + a human amount granted. Caller checks limits. */
  spinWheel(): { index: number; prizeId: string; kind: string; amount: number } | null {
    this.refreshWheelDay();
    if (this.state.wheelSpins >= WHEEL_MAX_PER_DAY) return null;
    const index = rollWheel();
    const prize = WHEEL_PRIZES[index];
    let amount = prize.amount;
    switch (prize.kind) {
      case 'cash': {
        amount = Math.max(this.totalIncomePerSec() * prize.amount, this.state.cash * 0.02, 250);
        this.earn(amount);
        break;
      }
      case 'gems':
      case 'jackpot':
        this.state.gems += prize.amount;
        break;
      case 'boost': {
        const now = Date.now();
        const base = Math.max(now, this.state.boostUntil);
        this.state.boostUntil = base + prize.amount * 60_000;
        break;
      }
      case 'card': {
        const ids = rollBox('uncommon').slice(0, prize.amount);
        this.grantCards(ids);
        break;
      }
    }
    this.state.wheelSpins++;
    this.state.daySpins++;
    if (this.state.sfxOn) audio.sfxReward();
    this.save();
    this.emit();
    return { index, prizeId: prize.id, kind: prize.kind, amount };
  }

  /** accrue event tokens for elapsed seconds (live tick + offline) */
  private accrueEvent(seconds: number): void {
    const rate = this.eventIncomePerSec();
    if (rate <= 0) return;
    const gained = rate * seconds;
    this.state.eventTokens += gained;
    this.state.eventTokensEarned += gained;
  }
}

export const engine = new GameEngine();
