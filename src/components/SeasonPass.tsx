import { useRef, useEffect } from 'react';
import {
  SEASON_MAX_TIER, TASK_POOL, seasonFreeReward, seasonPremiumReward, type Reward,
} from '../game/season';
import { formatDuration, formatNumber } from '../game/format';
import { purchase, shopVisible } from '../services/iap';
import { useGame, useT, type TFunc } from '../hooks';

// Season Pass — 30-day season: 3 daily tasks grant XP; XP climbs a reward track of tiers, each
// with a FREE reward and a PREMIUM reward (unlocked by the season_pass IAP). Fullscreen overlay.

const TASK_ICON: Record<string, string> = Object.fromEntries(TASK_POOL.map((d) => [d.id, d.icon]));

function rewardLabel(t: TFunc, r: Reward): string {
  if (r.kind === 'cash') return `💰 ${t('sp_r_cash')}`;
  if (r.kind === 'gems') return `💠 ${r.amount}`;
  if (r.kind === 'boost') return `⚡ ${r.amount}m`;
  if (r.kind === 'card') return `🃏 ${r.amount}`;
  return '';
}

export function SeasonPass({ onClose }: { onClose: () => void }) {
  const engine = useGame();
  const t = useT();
  const s = engine.state;
  const notation = s.notation;

  // make sure today's tasks are assigned when the pass opens
  const inited = useRef(false);
  if (!inited.current) { engine.refreshSeasonTasks(); inited.current = true; }

  const tier = engine.seasonTier();
  const { xpIn, xpNeed } = engine.seasonTierProgress();
  const unclaimed = engine.seasonUnclaimedCount();
  const trackRef = useRef<HTMLDivElement>(null);

  // scroll the track to the current tier
  useEffect(() => {
    const el = trackRef.current?.querySelector('.sp-tier.current') as HTMLElement | null;
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [tier]);

  const buyPremium = async () => {
    const res = await purchase('season_pass');
    if (res.ok) engine.unlockSeasonPremium();
  };

  const tiers = Array.from({ length: SEASON_MAX_TIER }, (_, i) => i + 1);

  return (
    <div className="event-overlay season-overlay">
      <div className="event-head">
        <button className="event-back" onClick={onClose}>‹ {t('ev_back')}</button>
        <div className="event-countdown">⏳ {t('ev_ends', { t: formatDuration(engine.seasonTimeLeftMs() / 1000) })}</div>
      </div>

      <div className="event-scroll">
        <div className="sp-hero">
          <h2 className="sp-title">🏆 {t('sp_title')}</h2>
          <div className="sp-tier-badge">{t('sp_tier', { n: tier })} / {SEASON_MAX_TIER}</div>
          <div className="event-ms-bar" style={{ marginTop: 8 }}>
            <span style={{ width: `${Math.min(100, (xpIn / xpNeed) * 100)}%` }} />
          </div>
          <div className="sp-xp">{xpIn} / {xpNeed} XP</div>
        </div>

        {!s.seasonPremium && shopVisible() && (
          <button className="sp-buy" onClick={buyPremium}>
            🌟 {t('sp_unlock')} <span className="sp-buy-sub">{t('sp_unlock_sub')}</span>
          </button>
        )}
        {s.seasonPremium && <div className="sp-owned">🌟 {t('sp_owned')}</div>}

        {unclaimed > 0 && (
          <button className="rebirth-btn sp-claim-all" onClick={() => engine.claimSeasonRewards()}>
            🎁 {t('sp_claim_all', { n: unclaimed })}
          </button>
        )}

        {/* reward track */}
        <div className="section-title">🎁 {t('sp_rewards')}</div>
        <div className="sp-track" ref={trackRef}>
          {tiers.map((tr) => {
            const reached = tier >= tr;
            const freeClaimed = s.seasonFreeClaimed >= tr;
            const premClaimed = s.seasonPremiumClaimed >= tr;
            return (
              <div key={tr} className={`sp-tier${tier === tr ? ' current' : ''}${reached ? ' reached' : ''}`}>
                <div className="sp-tier-n">{tr}</div>
                <div className={`sp-reward free${freeClaimed ? ' claimed' : reached ? ' ready' : ''}`}>
                  {rewardLabel(t, seasonFreeReward(tr))}
                  {freeClaimed && <span className="sp-check">✓</span>}
                </div>
                <div className={`sp-reward prem${premClaimed ? ' claimed' : reached && s.seasonPremium ? ' ready' : ''}${s.seasonPremium ? '' : ' locked'}`}>
                  {!s.seasonPremium && <span className="sp-lock">🔒</span>}
                  {rewardLabel(t, seasonPremiumReward(tr))}
                  {premClaimed && <span className="sp-check">✓</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* daily tasks */}
        <div className="section-title">📋 {t('sp_tasks')}</div>
        <p className="hint">{t('sp_tasks_hint')}</p>
        {s.seasonTasks.map((task, i) => {
          const prog = Math.min(engine.seasonTaskProgress(task.id), task.target);
          const done = prog >= task.target;
          return (
            <div className={`row-card sp-task${task.claimed ? ' done' : ''}`} key={i}>
              <div className="icon-tile" style={{ fontSize: 26 }}>{TASK_ICON[task.id]}</div>
              <div className="info">
                <div className="title">{t(`sp_task_${task.id}`, { n: formatNumber(task.target, notation) })}</div>
                <div className="sp-task-bar"><span style={{ width: `${(prog / task.target) * 100}%` }} /></div>
                <div className="desc">{formatNumber(prog, notation)} / {formatNumber(task.target, notation)} · +{task.xp} XP</div>
              </div>
              {task.claimed ? (
                <span className="check">✓</span>
              ) : (
                <button className="action-btn" disabled={!done} onClick={() => engine.claimSeasonTask(i)}>
                  {done ? t('sp_claim') : `+${task.xp}`}
                </button>
              )}
            </div>
          );
        })}

        <p className="hint" style={{ textAlign: 'center', margin: '14px 8px 4px' }}>{t('sp_footer')}</p>
      </div>
    </div>
  );
}
