import { useState } from 'react';
import { ASCEND_MIN_REBIRTHS, ERA_IDS, INVESTORS, SKILLS, skillCost, type InvestorPerk } from '../game/data';
import { formatNumber } from '../game/format';
import { useGame, useT, type TFunc } from '../hooks';
import { ConfirmModal } from './Modals';
import { GemIcon, VortexIcon } from './icons';

function perkText(t: TFunc, perk: InvestorPerk): string {
  switch (perk.kind) {
    case 'era': return t('perk_era', { name: t(`era_${ERA_IDS[perk.era]}`), n: perk.mult });
    case 'global': return t('perk_global', { n: perk.mult });
    case 'offline': return t('perk_offline', { n: perk.mult });
    case 'speed': return t('perk_speed', { n: Math.round(perk.add * 100) });
    case 'anomaly': return t('perk_anomaly', { n: perk.mult });
    case 'cost': return t('perk_cost', { n: Math.round(perk.cut * 100) });
  }
}

export function RebirthTab() {
  const engine = useGame();
  const t = useT();
  const s = engine.state;
  const pending = engine.pendingCrystals();
  const [confirming, setConfirming] = useState(false);
  const [ascending, setAscending] = useState(false);
  const pendingEons = engine.pendingEons();
  const showAscend = s.eons > 0 || s.rebirths >= 1;

  return (
    <div>
      <div className="rebirth-hero">
        <div className="vortex-wrap"><VortexIcon size={64} spin /></div>
        <h2>{t('rebirth_title')}</h2>
        <p>{t('rebirth_desc')}</p>
        <div className="gain">
          {pending >= 1
            ? <>{t('rebirth_gain', { n: formatNumber(pending, s.notation) })}</>
            : t('rebirth_locked')}
        </div>
        <button className="rebirth-btn" disabled={pending < 1} onClick={() => setConfirming(true)}>
          {t('rebirth_btn')}
        </button>
        <p style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <GemIcon size={17} /> {t('crystals')}: <b style={{ color: '#c4b0ff' }}>{formatNumber(s.crystals, s.notation)}</b>
          <span style={{ opacity: 0.5 }}>·</span> {t('time_travels', { n: s.rebirths })}
        </p>
      </div>

      {/* second prestige: Ascension → Eon Crystals */}
      {showAscend && (
        <div className="rebirth-hero ascend-hero">
          <div className="vortex-wrap"><VortexIcon size={54} spin /></div>
          <h2>🌌 {t('ascend_title')}</h2>
          <p>{t('ascend_desc')}</p>
          {engine.canAscend() ? (
            <>
              <div className="gain">{t('ascend_gain', { n: formatNumber(pendingEons, s.notation) })}</div>
              <button className="rebirth-btn ascend-btn" onClick={() => setAscending(true)}>
                {t('ascend_btn')}
              </button>
            </>
          ) : (
            <>
              <div className="gain" style={{ opacity: 0.85 }}>{t('ascend_locked', { n: ASCEND_MIN_REBIRTHS })}</div>
              <div className="ascend-bar"><span style={{ width: `${Math.round(engine.ascendProgress() * 100)}%` }} /></div>
            </>
          )}
          {s.eons > 0 && (
            <p style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
              🌌 {t('eons')}: <b style={{ color: '#8fe0ff' }}>{formatNumber(s.eons, s.notation)}</b>
              <span style={{ opacity: 0.5 }}>·</span> {t('eon_bonus', { n: Math.round(engine.eonIncomeBonus() * 100) })}
              <span style={{ opacity: 0.5 }}>·</span> {t('ascensions', { n: s.ascensions })}
            </p>
          )}
        </div>
      )}

      <div className="section-title"><GemIcon size={19} /> {t('skills_title')}</div>
      {SKILLS.map((sk) => {
        const lvl = engine.skillLevel(sk.id);
        const maxed = lvl >= sk.maxLevel;
        const cost = skillCost(sk, lvl);
        return (
          <div className={`row-card${maxed ? ' done' : ''}`} key={sk.id}>
            <div className="icon-tile">{sk.icon}</div>
            <div className="info">
              <div className="title">
                {t(`skill_${sk.id}_n`)} · {t('level', { n: lvl })}
              </div>
              <div className="desc">{t(`skill_${sk.id}_d`)}</div>
            </div>
            {maxed ? (
              <span className="check">{t('max_lvl')}</span>
            ) : (
              <button
                className="action-btn purple"
                disabled={s.crystals < cost}
                onClick={() => engine.buySkill(sk.id)}
              >
                💎 {cost}
              </button>
            )}
          </div>
        );
      })}

      {/* legendary investors */}
      <div className="section-title">🃏 {t('investors_title')}</div>
      <p className="hint">{t('investors_hint')}</p>
      {INVESTORS.map((inv) => {
        const owned = engine.hasInvestor(inv.id);
        const eraUnlocked = s.erasUnlocked > inv.era;
        return (
          <div className={`row-card investor-card${owned ? ' done' : ''}`} key={inv.id}>
            <div className="investor-avatar">{inv.icon}</div>
            <div className="info">
              <div className="title">{inv.name}</div>
              <div className="desc">✨ {perkText(t, inv.perk)}</div>
            </div>
            {owned ? (
              <span className="check">✓ {t('recruited')}</span>
            ) : !eraUnlocked ? (
              <span className="investor-locked">🔒 {t('locked_era', { n: inv.era + 1 })}</span>
            ) : (
              <button
                className="action-btn purple"
                disabled={s.crystals < inv.cost}
                onClick={() => engine.buyInvestor(inv.id)}
              >
                💎 {inv.cost}
              </button>
            )}
          </div>
        );
      })}

      {confirming && (
        <ConfirmModal
          icon="🌀"
          title={t('rebirth_title')}
          text={t('rebirth_confirm', { n: formatNumber(pending, s.notation) })}
          confirmLabel={t('rebirth_btn')}
          onConfirm={() => {
            engine.rebirth();
            setConfirming(false);
          }}
          onCancel={() => setConfirming(false)}
        />
      )}

      {ascending && (
        <ConfirmModal
          icon="🌌"
          title={t('ascend_title')}
          text={t('ascend_confirm', { n: formatNumber(pendingEons, s.notation) })}
          confirmLabel={t('ascend_btn')}
          danger
          onConfirm={() => {
            engine.ascend();
            setAscending(false);
          }}
          onCancel={() => setAscending(false)}
        />
      )}
    </div>
  );
}
