import { EVENT_GEM_CAP, EVENT_GENS, EVENT_MILESTONES } from '../game/event';
import { formatDuration, formatNumber } from '../game/format';
import { useGame, useT } from '../hooks';

// Event World — a limited-time parallel idle. Earn Event Tokens 🎟️ by building festival stalls;
// at the end of the 10-day cycle your earnings convert to Gems on a capped curve. Fullscreen
// overlay opened from the festival banner; "Back to Empire" returns to the main game.

export function EventWorld() {
  const engine = useGame();
  const t = useT();
  const s = engine.state;
  const notation = s.notation;

  const tokens = s.eventTokens;
  const earned = s.eventTokensEarned;
  const rate = engine.eventIncomePerSec();
  const gemsNow = engine.eventGemsPreview();
  const timeLeft = engine.eventTimeLeftMs();

  // progress toward the next informational milestone
  const nextMs = EVENT_MILESTONES.find((m) => earned < m.tokens);
  const prevTokens = EVENT_MILESTONES.filter((m) => earned >= m.tokens).pop()?.tokens ?? 0;
  const msPct = nextMs ? Math.min(100, ((earned - prevTokens) / (nextMs.tokens - prevTokens)) * 100) : 100;

  return (
    <div className="event-overlay">
      <div className="event-head">
        <button className="event-back" onClick={() => engine.closeEventWorld()}>‹ {t('ev_back')}</button>
        <div className="event-countdown">⏳ {t('ev_ends', { t: formatDuration(timeLeft / 1000) })}</div>
      </div>

      <div className="event-scroll">
        <div className="event-hero">
          <div className="event-emblem">🎪</div>
          <h2 className="event-title">{t('ev_name')}</h2>
          <div className="event-tokens">🎟️ {formatNumber(tokens, notation)}</div>
          <div className="event-rate">{t('ev_rate', { n: formatNumber(rate, notation) })}</div>
        </div>

        {/* live payout preview */}
        <div className="event-payout">
          <div className="event-payout-top">
            <span>{t('ev_payout')}</span>
            <span className="event-payout-gems">💠 {gemsNow}{gemsNow >= EVENT_GEM_CAP ? ' (MAX)' : ''}</span>
          </div>
          <div className="event-ms-bar"><span style={{ width: `${msPct}%` }} /></div>
          <div className="event-ms-label">
            {nextMs
              ? t('ev_next_ms', { g: nextMs.gems, n: formatNumber(nextMs.tokens, notation) })
              : t('ev_maxed')}
          </div>
          <p className="hint" style={{ margin: '8px 2px 0' }}>{t('ev_payout_hint')}</p>
        </div>

        {/* event businesses */}
        <div className="section-title">🎟️ {t('ev_stalls')}</div>
        {EVENT_GENS.map((g) => {
          const count = engine.eventGenCount(g.id);
          const cost = engine.eventGenCostFor(g.id);
          const afford = tokens >= cost;
          return (
            <div className="row-card event-stall" key={g.id}>
              <div className="icon-tile" style={{ fontSize: 30 }}>{g.icon}</div>
              <div className="info">
                <div className="title">{t(`${g.id}_n`)} {count > 0 && <span className="event-count">×{count}</span>}</div>
                <div className="desc">
                  {count > 0
                    ? t('ev_producing', { n: formatNumber(g.baseRev * count / g.cycle, notation) })
                    : t('ev_stall_locked')}
                </div>
              </div>
              <button className="buy-btn event-buy" disabled={!afford} onClick={() => engine.buyEventGen(g.id)}>
                <span className="buy-x">{t('buy')}</span>
                <span className="buy-cost">🎟️ {formatNumber(cost, notation)}</span>
              </button>
            </div>
          );
        })}

        <p className="hint" style={{ textAlign: 'center', margin: '14px 8px 4px' }}>{t('ev_footer')}</p>
      </div>
    </div>
  );
}
