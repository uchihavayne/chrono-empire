import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ERAS } from './game/data';
import { formatDuration, formatNumber } from './game/format';
import { isRTL, makeT } from './i18n';
import { AdContext, TContext, useGame } from './hooks';
import { registerAdSimulator, showRewardedAd } from './services/ads';
import { registerPurchaseSimulator, PRODUCT_BY_ID } from './services/iap';
import { scheduleRetention, cancelRetention } from './services/notify';
import { EmpireTab } from './components/EmpireTab';
import { UpgradesTab } from './components/UpgradesTab';
import { ManagersTab } from './components/ManagersTab';
import { RebirthTab } from './components/RebirthTab';
import { MoreTab } from './components/MoreTab';
import { BoostsModal } from './components/BoostsModal';
import { Modal } from './components/Modals';
import { CastleIcon, CoinIcon, CometIcon, GemIcon, HatIcon, MenuIcon, TvIcon, UpIcon, VortexIcon } from './components/icons';
import { RANKS } from './game/data';
import { audio } from './services/audio';
import { EraBackdrop } from './components/EraBackdrop';
import { Showcase } from './components/Showcase';
import { Tutorial } from './components/Tutorial';

type Tab = 'empire' | 'upgrades' | 'managers' | 'rebirth' | 'more';

const TABS: { id: Tab; icon: ReactNode }[] = [
  { id: 'empire', icon: <CastleIcon size={23} /> },
  { id: 'upgrades', icon: <UpIcon size={23} /> },
  { id: 'managers', icon: <HatIcon size={23} /> },
  { id: 'rebirth', icon: <VortexIcon size={23} /> },
  { id: 'more', icon: <MenuIcon size={23} /> },
];

interface SimAd { resolve: (ok: boolean) => void }

export default function App() {
  const engine = useGame();
  const s = engine.state;

  // design-review showcase (not part of normal play)
  if (typeof window !== 'undefined' && window.location.search.includes('showcase')) {
    return <Showcase />;
  }
  const t = useMemo(() => makeT(s.lang), [s.lang]);
  const [tab, setTab] = useState<Tab>('empire');
  // the era the player is currently VIEWING (drives backdrop + accent theme). Income
  // still uses the highest unlocked era; only the visuals follow what you browse.
  const [viewedEra, setViewedEra] = useState(engine.eraIndex());
  const [showBoosts, setShowBoosts] = useState(false);
  const [simAd, setSimAd] = useState<SimAd | null>(null);
  const [simCount, setSimCount] = useState(3);
  const [simBuy, setSimBuy] = useState<{ id: string; resolve: (ok: boolean) => void } | null>(null);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);
  const [anomalyReward, setAnomalyReward] = useState<number | null>(null);
  const toastKey = useRef(0);

  const onToast = useCallback((msg: string) => {
    toastKey.current++;
    setToast({ msg, key: toastKey.current });
  }, []);

  // engine loop
  useEffect(() => {
    engine.start();
  }, [engine]);

  // unlock audio on the first user gesture (autoplay policy), then start era music
  useEffect(() => {
    const unlock = () => {
      if (engine.state.soundOn) audio.unlock(engine.currentEraId());
      window.removeEventListener('pointerdown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    return () => window.removeEventListener('pointerdown', unlock);
  }, [engine]);

  // switch background music whenever the era changes
  const eraId = engine.currentEraId();
  useEffect(() => {
    if (engine.state.soundOn) audio.playEra(eraId);
  }, [eraId, engine]);

  // simulated ad provider for web/localhost testing
  useEffect(() => {
    registerAdSimulator(
      () =>
        new Promise<boolean>((resolve) => {
          setSimCount(3);
          setSimAd({ resolve });
        }),
    );
  }, []);

  // simulated purchase provider for web / unconfigured-store testing
  useEffect(() => {
    registerPurchaseSimulator(
      (id) => new Promise<boolean>((resolve) => setSimBuy({ id, resolve })),
    );
  }, []);

  // away-reminder notifications: schedule on background, clear on return (native only)
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        engine.save();
        void scheduleRetention([
          { title: t('notif_t1'), body: t('notif_b1') },
          { title: t('notif_t2'), body: t('notif_b2') },
          { title: t('notif_t3'), body: t('notif_b3') },
        ]);
      } else {
        void cancelRetention();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [engine, t]);

  // simulated ad countdown
  useEffect(() => {
    if (!simAd) return;
    if (simCount <= 0) {
      simAd.resolve(true);
      setSimAd(null);
      return;
    }
    const h = setTimeout(() => setSimCount((c) => c - 1), 1000);
    return () => clearTimeout(h);
  }, [simAd, simCount]);

  // RTL + document language
  useEffect(() => {
    document.documentElement.dir = isRTL(s.lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = s.lang;
  }, [s.lang]);

  // when a new era unlocks (or after rebirth), jump the viewed era to the frontier
  useEffect(() => {
    setViewedEra(engine.eraIndex());
  }, [s.erasUnlocked, engine]);

  const watchAd = useCallback(
    (onReward: () => void) => {
      // No-Ads Pass owners get the reward instantly, no ad shown.
      if (engine.state.removeAds) { onReward(); return; }
      void showRewardedAd().then((ok) => {
        if (ok) onReward();
      });
    },
    [engine],
  );

  const eraIdx = Math.min(viewedEra, s.erasUnlocked - 1);
  const era = ERAS[eraIdx];
  const income = engine.totalIncomePerSec();
  const boostLeft = s.boostUntil - Date.now();
  const frenzyLeft = s.frenzyUntil - Date.now();
  const rank = RANKS[engine.rankIdx()];
  const event = engine.currentEvent();
  const season = engine.currentSeasonal();
  const eventLeft = s.eventUntil - Date.now();

  const starEras = ['space', 'future', 'galactic', 'cosmic'];
  const hasStars = starEras.includes(era.id) ? ' has-stars' : '';

  return (
    <TContext.Provider value={t}>
      <AdContext.Provider value={watchAd}>
        <div className={`app ${era.theme}${hasStars}`}>
          {/* per-era atmospheric backdrop */}
          <EraBackdrop era={era.id} />

          {/* header */}
          <div className="header">
            <button
              className="sound-toggle"
              onClick={() => engine.setSound(!s.soundOn)}
              aria-label="sound"
            >
              {s.soundOn ? '🔊' : '🔇'}
            </button>
            <div className="cash-row">
              <span className="coin"><CoinIcon size={30} /></span>
              <div className="cash">{formatNumber(s.cash, s.notation)}</div>
            </div>
            <div className="income">
              {t('income')}: <b>{formatNumber(income, s.notation)}{t('per_sec')}</b>
            </div>
            <div className="chips">
              <span className="chip rank" onClick={() => setTab('rebirth')}>
                {rank.icon} {rank.name}
              </span>
              <span className="chip era">{era.icon} {t(`era_${era.id}`)}</span>
              <span className="chip gem"><GemIcon size={13} /> {formatNumber(s.crystals, s.notation)}</span>
              {frenzyLeft > 0 && (
                <span className="chip frenzy">{t('frenzy_left', { t: formatDuration(frenzyLeft / 1000) })}</span>
              )}
              {boostLeft > 0 && (
                <span className="chip boost">⚡ {t('boost_left', { t: formatDuration(boostLeft / 1000) })}</span>
              )}
              {s.dailyClaimable && (
                <span className="chip gift" onClick={() => setTab('more')}>🎁 {t('daily_title')}</span>
              )}
            </div>
          </div>

          {/* Golden Hour event banner */}
          {event && (
            <div className="event-banner">
              <span className="event-icon">{event.icon}</span>
              <div className="event-mid">
                <div className="event-name">{t(`event_${event.id}`)}</div>
                <div className="event-sub">
                  {t('event_active', { n: event.mult, t: formatDuration(eventLeft / 1000) })}
                </div>
              </div>
              <button className="action-btn gold event-ext" onClick={() => watchAd(() => engine.extendEvent())}>
                {t('event_extend')}
              </button>
            </div>
          )}

          {/* seasonal / live-ops bonus banner */}
          {season && (
            <div className="season-banner">
              <span className="event-icon">{season.icon}</span>
              <div className="event-mid">
                <div className="event-name">{t(`season_${season.key}`)}</div>
                <div className="event-sub">{t('season_active', { n: season.mult })}</div>
              </div>
            </div>
          )}

          {/* content */}
          <div className="content">
            {tab === 'empire' && <EmpireTab onToast={onToast} viewedEra={viewedEra} setViewedEra={setViewedEra} />}
            {tab === 'upgrades' && <UpgradesTab />}
            {tab === 'managers' && <ManagersTab />}
            {tab === 'rebirth' && <RebirthTab />}
            {tab === 'more' && <MoreTab onToast={onToast} />}
          </div>

          {/* boosts FAB */}
          <button className="fab" onClick={() => setShowBoosts(true)} aria-label={t('ads_title')}>
            <TvIcon size={28} />
          </button>

          {/* anomaly bubble */}
          {engine.anomaly && (
            <button
              className="anomaly"
              style={{ left: `${engine.anomaly.x}%`, top: `${engine.anomaly.y}%` }}
              onClick={() => {
                const reward = engine.catchAnomaly(false);
                setAnomalyReward(reward);
              }}
              aria-label={t('anomaly_title')}
            >
              <VortexIcon size={40} spin />
            </button>
          )}

          {/* Golden Rush comet flying across the screen */}
          {engine.rush && (
            <button
              className="rush-comet"
              style={{ top: `${engine.rush.y}%` }}
              onClick={() => {
                const reward = engine.catchRush();
                onToast(`🌠 ${t('rush_title')} +${formatNumber(reward, s.notation)}`);
              }}
              aria-label={t('rush_title')}
            >
              <CometIcon size={52} />
            </button>
          )}

          {/* tab bar */}
          <div className="tabbar">
            {TABS.map((tb) => (
              <button key={tb.id} className={tab === tb.id ? 'active' : ''} onClick={() => setTab(tb.id)}>
                {tb.id === 'rebirth' && engine.canRebirth() && <span className="dot" />}
                <span className="ticon">{tb.icon}</span>
                {t(`tab_${tb.id}`)}
              </button>
            ))}
          </div>

          {/* modals */}
          {showBoosts && <BoostsModal onClose={() => setShowBoosts(false)} />}

          {engine.offlineReport && (
            <Modal>
              <div className="m-icon">🌙</div>
              <h3>{t('offline_title')}</h3>
              <p>{t('offline_desc', { t: formatDuration(engine.offlineReport.seconds) })}</p>
              <div className="m-value">💰 {formatNumber(engine.offlineReport.cashEarned, s.notation)}</div>
              <div className="m-actions">
                <button className="m-secondary" onClick={() => engine.dismissOffline()}>{t('collect')}</button>
                <button className="m-green" onClick={() => watchAd(() => engine.claimOfflineDouble())}>
                  {t('offline_double')}
                </button>
              </div>
            </Modal>
          )}

          {anomalyReward !== null && (
            <Modal>
              <div className="m-icon">🌀</div>
              <h3>{t('anomaly_title')}</h3>
              <p>{t('anomaly_desc', { v: formatNumber(anomalyReward, s.notation) })}</p>
              <div className="m-actions">
                <button className="m-secondary" onClick={() => setAnomalyReward(null)}>
                  {t('anomaly_collect')}
                </button>
                <button
                  className="m-green"
                  onClick={() => {
                    const r = anomalyReward;
                    watchAd(() => {
                      engine.grantAnomalyTriple(r);
                      setAnomalyReward(null);
                    });
                  }}
                >
                  {t('anomaly_triple')}
                </button>
              </div>
            </Modal>
          )}

          {simAd && (
            <Modal>
              <h3>{t('ad_playing')}</h3>
              <div className="sim-ad">
                <span className="sim-spinner"><TvIcon size={40} /></span>
                <p style={{ marginTop: 10 }}>{t('reward_in', { s: simCount })}</p>
              </div>
              <p className="hint">{t('sim_note')}</p>
            </Modal>
          )}

          {simBuy && (
            <Modal>
              <h3>{t('shop_confirm_title')}</h3>
              <div style={{ textAlign: 'center', fontSize: 40, margin: '6px 0' }}>
                {PRODUCT_BY_ID[simBuy.id]?.icon ?? '🛒'}
              </div>
              <p style={{ textAlign: 'center' }}>{t(`iap_${simBuy.id}_t`)}</p>
              <p className="hint">{t('shop_sim_note')}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="action-btn purple" style={{ flex: 1, padding: 11 }}
                  onClick={() => { simBuy.resolve(false); setSimBuy(null); }}>
                  {t('cancel')}
                </button>
                <button className="action-btn" style={{ flex: 1, padding: 11 }}
                  onClick={() => { simBuy.resolve(true); setSimBuy(null); }}>
                  {t('confirm')}
                </button>
              </div>
            </Modal>
          )}

          {!s.tutorialDone && <Tutorial />}

          {toast && <div className="toast" key={toast.key}>{toast.msg}</div>}
        </div>
      </AdContext.Provider>
    </TContext.Provider>
  );
}
