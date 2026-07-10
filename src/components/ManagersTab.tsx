import { GENERATORS } from '../game/data';
import { formatNumber } from '../game/format';
import { useGame, useT } from '../hooks';
import { GenIcon, HatIcon } from './icons';

export function ManagersTab() {
  const engine = useGame();
  const t = useT();
  const s = engine.state;

  return (
    <div>
      <div className="section-title"><HatIcon size={22} /> {t('managers_title')}</div>
      <p className="hint">{t('managers_hint')}</p>
      {GENERATORS.map((g) => {
        if (g.era >= s.erasUnlocked) return null; // era not unlocked yet
        const gs = s.generators[g.id];
        const owned = gs.count > 0;
        return (
          <div className={`row-card${gs.hasManager ? ' done' : ''}`} key={g.id}>
            <div className="icon-tile"><GenIcon id={g.id} size={46} /></div>
            <div className="info">
              <div className="title">{t(`gen_${g.id}`)}</div>
              <div className="desc">{t('runs', { name: t(`gen_${g.id}`) })}</div>
            </div>
            {gs.hasManager ? (
              <span className="check">✓ {t('hired')}</span>
            ) : (
              <button
                className="action-btn"
                disabled={s.cash < g.managerCost || !owned}
                onClick={() => engine.buyManager(g.id)}
              >
                {t('hire')}
                <br />
                {formatNumber(g.managerCost, s.notation)}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
