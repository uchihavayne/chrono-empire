import { GEN_BY_ID, UPGRADES, type UpgradeDef } from '../game/data';
import { formatNumber } from '../game/format';
import { useGame, useT } from '../hooks';
import { GenIcon, UpIcon } from './icons';

function UpgradeIconTile({ u }: { u: UpgradeDef }) {
  return (
    <div className="icon-tile">
      {u.target === 'all' ? <span style={{ fontSize: 24 }}>🌟</span> : <GenIcon id={u.target} size={46} />}
    </div>
  );
}

export function UpgradesTab() {
  const engine = useGame();
  const t = useT();
  const s = engine.state;
  const notation = s.notation;

  const describe = (u: UpgradeDef) =>
    u.target === 'all' ? t('up_all', { n: u.mult }) : t('up_gen', { name: t(`gen_${u.target}`), n: u.mult });

  const available = UPGRADES.filter((u) => {
    if (s.upgrades.includes(u.id)) return false;
    if (u.target !== 'all') {
      if (GEN_BY_ID[u.target].era >= s.erasUnlocked) return false;
      if (s.generators[u.target].count === 0) return false;
    }
    return true;
  }).sort((a, b) => a.cost - b.cost);

  const purchased = UPGRADES.filter((u) => s.upgrades.includes(u.id));

  return (
    <div>
      <div className="section-title"><UpIcon size={20} /> {t('upgrades_title')}</div>
      {available.map((u) => (
        <div className="row-card" key={u.id}>
          <UpgradeIconTile u={u} />
          <div className="info">
            <div className="title">{describe(u)}</div>
          </div>
          <button
            className="action-btn gold"
            disabled={s.cash < u.cost}
            onClick={() => engine.buyUpgrade(u.id)}
          >
            {formatNumber(u.cost, notation)}
          </button>
        </div>
      ))}
      {purchased.length > 0 && (
        <>
          <div className="section-title">{t('purchased')} ({purchased.length})</div>
          {purchased.map((u) => (
            <div className="row-card done" key={u.id}>
              <UpgradeIconTile u={u} />
              <div className="info">
                <div className="title">{describe(u)}</div>
              </div>
              <span className="check">✓</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
