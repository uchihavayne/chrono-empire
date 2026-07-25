import { bossReward } from '../game/boss';
import { formatDuration, formatNumber } from '../game/format';
import { useGame, useT } from '../hooks';

// Time Keeper boss fight — earn a target amount of cash within the timer to win. The modal reads
// the live fight state from the engine (which the tick resolves), so the timer + progress update.

export function BossModal({ onClose }: { onClose: () => void }) {
  const engine = useGame();
  const t = useT();
  const s = engine.state;
  const active = engine.bossActive();
  const th = active ? s.bossThreshold : (engine.availableBoss() ?? 0);
  const reward = bossReward(th);
  const earned = engine.bossEarned();
  const target = s.bossTarget;
  const pct = active ? Math.min(100, (earned / target) * 100) : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal boss-modal" onClick={(e) => e.stopPropagation()}>
        <div className="boss-icon">⏳</div>
        <h3>{t('boss_title')} · {t('boss_era', { n: th })}</h3>

        {active ? (
          <>
            <p className="boss-timer">⏱ {formatDuration(engine.bossTimeLeftMs() / 1000)}</p>
            <div className="boss-bar"><span style={{ width: `${pct}%` }} /></div>
            <p className="boss-prog">💰 {formatNumber(earned, s.notation)} / {formatNumber(target, s.notation)}</p>
            <p className="hint" style={{ textAlign: 'center' }}>{t('boss_fighting')}</p>
          </>
        ) : (
          <>
            <p className="boss-desc">{t('boss_desc', { s: 180 })}</p>
            <div className="boss-reward">🎁 💠{reward.gems} + {reward.cards} 🏆</div>
            <button className="rebirth-btn" onClick={() => engine.startBoss()}>⚔️ {t('boss_start')}</button>
          </>
        )}

        <button className="wheel-close" onClick={onClose}>{t('close')}</button>
      </div>
    </div>
  );
}
