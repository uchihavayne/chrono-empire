import {
  ACHIEVEMENTS, ACH_BONUS, AD_BOOST_BASE_HOURS, ANOMALY_LIFETIME_S, ANOMALY_MAX_GAP_S,
  ANOMALY_MIN_GAP_S, CRYSTAL_AD_COOLDOWN_MIN, DAILY_REWARDS, ERAS, ERA_BASE,
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
import { cloudPull, cloudPush, type CloudResult } from '../services/cloud';
import { PRODUCT_BY_ID } from '../services/iap';
import { submitScore, topScores, type LbEntry } from '../services/leaderboard';

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
  soundOn: boolean;
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
  /** number of ascensions performed */
  ascensions: number;
  /** totalCrystalsEarned snapshot at the last ascension → epoch crystals = total − this */
  ascensionStartCrystals: number;
  /** first-run onboarding shown/dismissed */
  tutorialDone: boolean;
  /** display name shown on the global leaderboard */
  playerName: string;
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
const VERSION = 5;

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
    cash: 0,
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
    notation: 'suffix',
    createdAt: Date.now(),
    cloudCode: makeCloudCode(),
    cloudSyncedAt: 0,
    removeAds: false,
    starterPack: false,
    iapOwned: [],
    eons: 0,
    ascensions: 0,
    ascensionStartCrystals: 0,
    tutorialDone: false,
    playerName: '',
  };
}

export interface OfflineReport {
  seconds: number;
  cashEarned: number;
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
    } else if (p.crystals) {
      this.state.crystals += p.crystals;
      this.state.totalCrystalsEarned += p.crystals;
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
    if (this.state.soundOn) audio.sfxUnlock();
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
    if (this.state.soundOn) audio.sfxUnlock();
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
    if (this.state.soundOn) audio.sfxUnlock();
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
    if (this.state.starterPack) m *= 2; // permanent IAP boost
    if (this.state.eons > 0) m *= 1 + this.state.eons * EON_INCOME_BONUS; // 2nd-prestige boost
    const season = seasonalEvent();
    if (season) m *= season.mult; // weekend / power-hour / holiday live-ops bonus
    if (this.boostActive()) m *= 2;
    if (this.frenzyActive()) m *= RUSH_FRENZY_MULT;
    if (this.eventActive()) m *= this.eventMult();
    for (const id of this.state.upgrades) {
      const u = UPGRADE_BY_ID[id];
      if (u && u.target === 'all') m *= u.mult;
    }
    return m;
  }

  /** true when the player owns SET_BONUS_COUNT+ of all 4 ventures in an era */
  eraSetComplete(era: number): boolean {
    return GENERATORS.filter((g) => g.era === era).every(
      (g) => this.state.generators[g.id].count >= SET_BONUS_COUNT,
    );
  }

  generatorMult(genId: string): number {
    let m = 1;
    for (const id of this.state.upgrades) {
      const u = UPGRADE_BY_ID[id];
      if (u && u.target === genId) m *= u.mult;
    }
    const era = GEN_BY_ID[genId].era;
    // era "collection" bonus: complete the set to double the whole era's output
    if (this.eraSetComplete(era)) m *= SET_BONUS_MULT;
    // legendary investor era boost
    m *= this.investorEraMult(era);
    return m;
  }

  cycleSpeedMult(): number {
    return 1 + this.skillLevel('fast_cycles') * 0.1 + this.investorSpeedAdd();
  }

  /** effective seconds per cycle for a venture, after global speed + owned-count milestones */
  effectiveCycle(g: GeneratorDef): number {
    const count = this.state.generators[g.id].count;
    return (g.cycleTime * milestoneSpeed(count)) / this.cycleSpeedMult();
  }

  costDiscount(): number {
    return Math.max(0.1, 1 - this.skillLevel('cheap_deals') * 0.03 - this.investorCostCut());
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
    return OFFLINE_CAP_BASE_HOURS + this.skillLevel('offline_cap') * 4;
  }

  adBoostHours(): number {
    return AD_BOOST_BASE_HOURS + this.skillLevel('ad_master');
  }

  // ─── ticking ───
  private tick(dt: number): void {
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
    // instant reward: a chunk of frenzied production up front
    const reward = Math.max(this.totalIncomePerSec() * 60, this.state.cash * 0.1, 100);
    this.earn(reward);
    if (this.state.soundOn) audio.sfxReward();
    this.emit();
    return reward;
  }

  private earn(amount: number): void {
    this.state.cash += amount;
    this.state.lifetimeCash += amount;
    this.state.runCash += amount;
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
    if (this.state.soundOn) audio.sfxBuy();
    this.emit();
  }

  buyManager(genId: string): void {
    const g = GEN_BY_ID[genId];
    const gs = this.state.generators[genId];
    if (gs.hasManager || this.state.cash < g.managerCost) return;
    this.state.cash -= g.managerCost;
    gs.hasManager = true;
    if (this.state.soundOn) audio.sfxManager();
    this.emit();
  }

  buyUpgrade(upgradeId: string): void {
    const u = UPGRADE_BY_ID[upgradeId];
    if (!u || this.state.upgrades.includes(upgradeId) || this.state.cash < u.cost) return;
    // generator upgrades require owning at least one
    if (u.target !== 'all' && this.state.generators[u.target].count === 0) return;
    this.state.cash -= u.cost;
    this.state.upgrades.push(upgradeId);
    if (this.state.soundOn) audio.sfxBuy();
    this.emit();
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
    const base = crystalsForRun(this.state.runCash);
    if (this.state.eons > 0) return Math.floor(base * (1 + this.state.eons * EON_CRYSTAL_BONUS));
    return base;
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
    if (s.soundOn) audio.sfxRebirth();
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
    // keep_managers skill
    const km = this.skillLevel('keep_managers');
    for (let i = 0; i < km && i < GENERATORS.length; i++) {
      s.generators[GENERATORS[i].id].hasManager = true;
    }
    s.boostUntil = 0;
    s.frenzyUntil = 0;
    s.eventIdx = -1;
    this.anomaly = null;
    this.rush = null;
    this.scheduleAnomaly();
    this.scheduleRush();
    this.scheduleEvent();
    if (s.soundOn) audio.sfxRebirth();
    this.save();
    this.emit();
  }

  // ─── offline progress ───
  private applyOfflineProgress(): void {
    const now = Date.now();
    const rawSeconds = (now - this.state.lastSeen) / 1000;
    this.state.lastSeen = now;
    if (rawSeconds < 60) return;
    const cap = this.offlineCapHours() * 3600;
    const seconds = Math.min(rawSeconds, cap);
    const income = this.totalIncomePerSec();
    if (income <= 0) return;
    const cashEarned = income * seconds * this.investorPerk('offline'); // Nefertari boosts offline
    this.earn(cashEarned);
    this.offlineReport = { seconds, cashEarned };
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

  claimDaily(): { type: 'cash' | 'crystal'; value: number } | null {
    if (!this.state.dailyClaimable) return null;
    const day = this.state.dailyStreak % DAILY_REWARDS.length;
    const def = DAILY_REWARDS[day];
    let value: number;
    if (def.type === 'cash') {
      const income = Math.max(this.totalIncomePerSec(), 1);
      value = income * def.amount * 60;
      this.earn(value);
    } else {
      value = def.amount;
      this.state.crystals += value;
      this.state.totalCrystalsEarned += value;
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
    const reward = Math.max(income * 90 * golden, this.state.cash * 0.05 * golden, 50);
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
    if (this.state.soundOn) audio.sfxAnomaly();
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
      if (done) s.achievements.push(a.id);
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
  claimQuest(): { crystals?: number; cash?: number } | null {
    const q = this.currentQuest();
    if (!q || !this.questProgress().done) return null;
    const out: { crystals?: number; cash?: number } = {};
    if (q.crystals) {
      this.state.crystals += q.crystals;
      this.state.totalCrystalsEarned += q.crystals;
      out.crystals = q.crystals;
    }
    if (q.cashMins) {
      // reward = a modest slice of production with an era-scaled floor so it never feels tiny.
      // Deliberately small: quests GUIDE progression — they must not hand you cash to skip an era.
      // Strip transient multipliers (×2 boost, frenzy, event) so a lucky moment can't inflate it.
      let income = this.totalIncomePerSec();
      if (this.boostActive()) income /= 2;
      if (this.frenzyActive()) income /= RUSH_FRENZY_MULT;
      if (this.eventActive()) income /= this.eventMult();
      const floor = ERA_BASE[this.eraIndex()] * 6 * q.cashMins;
      const cash = Math.max(income * q.cashMins * 18, floor);
      this.earn(cash);
      out.cash = cash;
    }
    this.state.questIndex++;
    if (this.state.soundOn) audio.sfxReward();
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

  // ─── global leaderboard ───
  /** the number ranked on the board: lifetime crystals, boosted by ascension Eons */
  leaderboardScore(): number {
    return Math.floor(this.state.totalCrystalsEarned + this.state.eons * 1000);
  }
  async submitLeaderboard(name: string): Promise<boolean> {
    const clean = name.trim().slice(0, 16);
    this.state.playerName = clean;
    this.save();
    this.emit();
    return submitScore(this.state.cloudCode, clean, this.leaderboardScore());
  }
  async fetchLeaderboard(limit = 20): Promise<LbEntry[]> {
    return topScores(limit, this.state.cloudCode);
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

  setSound(on: boolean): void {
    this.state.soundOn = on;
    audio.setEnabled(on);
    if (on) audio.playEra(this.currentEraId());
    this.save();
    this.emit();
  }
}

export const engine = new GameEngine();
