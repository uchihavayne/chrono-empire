import { useState } from 'react';
import {
  EVENT_GEM_CAP, EVENT_MILESTONES, EVENT_STAGES, eventMilestoneMult, eventNextMilestone, eventStageGens,
} from '../game/event';
import { formatDuration, formatNumber } from '../game/format';
import type { BuyAmount } from '../game/engine';
import { useGame, useT, useWatchAd } from '../hooks';

// Event World — a miniature of the main game: festival STAGES (like eras), 4 businesses each with
// levels + ×2 milestones, and an "unlock next stage" gate. Earn Event Tokens 🎟️; at cycle end they
// convert to a small, capped number of Gems. Fullscreen overlay opened from the festival banner.

const AMOUNTS: BuyAmount[] = [1, 10, 100, 'max'];

export function EventWorld() {
  const engine = useGame();
  const t = useT();
  const watchAd = useWatchAd();
  const s = engine.state;
  const notation = s.notation;
  const [amount, setAmount] = useState<BuyAmount>(1);
  const frontier = s.eventStagesUnlocked - 1;
  const [viewed, setViewed] = useState(frontier);
  const sel = Math.min(viewed, frontier);

  const tokens = s.eventTokens;
  const earned = s.eventTokensEarned;
  const rate = engine.eventIncomePerSec();
  const gemsNow = engine.eventGemsPreview();
  const boostOn = engine.eventBoostActive();
  const nextStageCost = engine.eventNextStageCost();

  const nextMs = EVENT_MILESTONES.find((m) => earned < m.tokens);
  const prevTokens = EVENT_MILESTONES.filter((m) => earned >= m.tokens).pop()?.tokens ?? 0;
  const msPct = nextMs ? Math.min(100, ((earned - prevTokens) / (nextMs.tokens - prevTokens)) * 100) : 100;

  return (
    <div className="event-overlay">
      <div className="event-head">
        <button className="event-back" onClick={() => engine.closeEventWorld()}>‹ {t('ev_back')}</button>
        <div className="event-countdown">⏳ {t('ev_ends', { t: formatDuration(engine.eventTimeLeftMs() / 1000) })}</div>
      </div>

      <div className="event-scroll">
        <div className="event-hero">
          <div className="event-tokens">🎟️ {formatNumber(tokens, notation)}</div>
          <div className="event-rate">
            {t('ev_rate', { n: formatNumber(rate, notation) })}
            {boostOn && <span className="event-frenzy-tag"> · 🔥 ×3</span>}
          </div>
        </div>

        {boostOn ? (
          <div className="event-frenzy active">🔥 {t('ev_frenzy_on', { t: formatDuration(engine.eventBoostLeftMs() / 1000) })}</div>
        ) : (
          <button className="event-frenzy" onClick={() => watchAd(() => engine.startEventBoost())}>
            📺 {t('ev_frenzy')}
          </button>
        )}

        {/* live payout preview */}
        <div className="event-payout">
          <div className="event-payout-top">
            <span>{t('ev_payout')}</span>
            <span className="event-payout-gems">💠 {gemsNow}{gemsNow >= EVENT_GEM_CAP ? ' (MAX)' : ''}</span>
          </div>
          <div className="event-ms-bar"><span style={{ width: `${msPct}%` }} /></div>
          <div className="event-ms-label">
            {nextMs ? t('ev_next_ms', { g: nextMs.gems, n: formatNumber(nextMs.tokens, notation) }) : t('ev_maxed')}
          </div>
          <p className="hint" style={{ margin: '8px 2px 0' }}>{t('ev_payout_hint')}</p>
        </div>

        {/* stage (chapter) selector — like the main game's era strip */}
        <div className="era-strip">
          {EVENT_STAGES.map((st, i) => {
            const unlocked = i <= frontier;
            return (
              <button
                key={st.id}
                className={`era-chip${i === sel ? ' active' : ''}${unlocked ? '' : ' locked'}`}
                onClick={() => unlocked && setViewed(i)}
              >
                <span className="era-chip-icon">{unlocked ? st.icon : '🔒'}</span>
                <span className="era-chip-name">{unlocked ? t(`ev_st_${st.id}`) : `${i + 1}`}</span>
              </button>
            );
          })}
        </div>

        <div className="amount-row">
          {AMOUNTS.map((a) => (
            <button key={a} className={a === amount ? 'active' : ''} onClick={() => setAmount(a)}>
              {a === 'max' ? 'MAX' : `×${a}`}
            </button>
          ))}
        </div>

        {eventStageGens(sel).map((g) => {
          const count = engine.eventGenCount(g.id);
          const { count: buyN, cost } = engine.eventBuyCost(g.id, amount);
          const afford = tokens >= cost;
          return (
            <div className="row-card event-stall" key={g.id}>
              <div className="icon-tile" style={{ fontSize: 30 }}>{g.icon}</div>
              <div className="info">
                <div className="title">
                  {t(`${g.id}_n`)} {count > 0 && <span className="event-count">×{count}</span>}
                </div>
                {count > 0 ? (
                  <>
                    <div className="desc">{t('ev_producing', { n: formatNumber(engine.eventGenIncome(g.id), notation) })}</div>
                    <div className="gen-milestone">
                      {t('next_bonus', { n: eventNextMilestone(count) })} · <b>×{formatNumber(eventMilestoneMult(count), notation)}</b>
                    </div>
                  </>
                ) : (
                  <div className="desc">{t('ev_stall_locked')}</div>
                )}
              </div>
              <button className="buy-btn event-buy" disabled={!afford} onClick={() => engine.buyEventGen(g.id, amount)}>
                {t('buy')} ×{buyN}
                <span className="sub">🎟️ {formatNumber(cost, notation)}</span>
              </button>
            </div>
          );
        })}

        {/* unlock next stage — shown at the frontier (like UnlockEraCard) */}
        {sel === frontier && nextStageCost !== null && (
          <div className="unlock-card">
            <div className="unlock-head">
              <span className="unlock-icon">{EVENT_STAGES[frontier + 1].icon}</span>
              <div>
                <div className="unlock-kicker">{t('ev_next_stage')}</div>
                <div className="unlock-name">{t(`ev_st_${EVENT_STAGES[frontier + 1].id}`)}</div>
              </div>
            </div>
            <p className="unlock-reward">✨ {t('ev_stage_reward', { n: formatNumber(EVENT_STAGES[frontier + 1].mult, notation) })}</p>
            <div className="progress unlock-progress">
              <div className="bar" style={{ width: `${Math.min((tokens / nextStageCost) * 100, 100)}%` }} />
            </div>
            <button className="rebirth-btn unlock-btn" disabled={tokens < nextStageCost} onClick={() => engine.unlockEventStage()}>
              🔓 {t('ev_unlock')} · 🎟️ {formatNumber(nextStageCost, notation)}
            </button>
          </div>
        )}

        <p className="hint" style={{ textAlign: 'center', margin: '14px 8px 4px' }}>{t('ev_footer')}</p>
      </div>
    </div>
  );
}
