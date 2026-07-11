import { useState } from 'react';
import {
  BOXES, CARDS, MANAGER_CARD_REQ, RARITY_COLOR, RARITY_LABEL,
  cardProfitMult, cardRarity, nextCardTier, type Rarity,
} from '../game/cards';
import { formatNumber } from '../game/format';
import { GEN_BY_ID } from '../game/data';
import { useGame, useT, useWatchAd } from '../hooks';
import { GenIcon } from './icons';
import { BoxReveal } from './BoxReveal';

export function CardsTab({ onToast }: { onToast: (m: string) => void }) {
  const engine = useGame();
  const t = useT();
  const watchAd = useWatchAd();
  const s = engine.state;
  const [reveal, setReveal] = useState<string[] | null>(null);
  const [revealIcon, setRevealIcon] = useState('📦');
  const [busy, setBusy] = useState(false);

  const freeAvail = engine.freeBoxAvailable();
  const needsAd = engine.boxNeedsAd();
  const boxesLeft = engine.boxesLeftToday();

  const show = (d: string[] | null, icon: string) => { if (d) { setRevealIcon(icon); setReveal(d); } };
  const openDaily = () => {
    if (busy) return;
    if (freeAvail) {
      show(engine.openDailyBox(), '📦');
    } else if (needsAd) {
      setBusy(true);
      watchAd(() => { const d = engine.openDailyBox(); setBusy(false); show(d, '📦'); });
    }
  };
  const openGem = (id: string, cost: number, icon: string) => {
    if (s.gems < cost) { onToast(t('gems_short')); return; }
    show(engine.openGemBox(id), icon);
  };

  // ventures the player has any cards for, richest first
  const owned = CARDS.filter((c) => engine.cardCount(c.id) > 0)
    .sort((a, b) => engine.cardCount(b.id) - engine.cardCount(a.id));

  return (
    <div>
      {/* gems balance */}
      <div className="gems-bar">
        <span className="gems-amt">💠 {formatNumber(s.gems, s.notation)}</span>
        <span className="gems-label">{t('gems')}</span>
      </div>

      {/* boxes */}
      <div className="section-title">🎁 {t('boxes_title')}</div>
      {/* daily uncommon box */}
      <div className="row-card box-row" style={{ borderColor: RARITY_COLOR.uncommon[1] }}>
        <div className="icon-tile" style={{ fontSize: 26 }}>📦</div>
        <div className="info">
          <div className="title">{t('box_daily')}</div>
          <div className="desc">{t('box_daily_left', { n: boxesLeft })}</div>
        </div>
        <button
          className={`action-btn${freeAvail ? '' : ' purple'}`}
          disabled={busy || boxesLeft <= 0}
          onClick={openDaily}
        >
          {freeAvail ? t('box_open_free') : needsAd ? t('box_open_ad') : t('box_done')}
        </button>
      </div>
      {/* gem boxes */}
      {BOXES.filter((b) => b.gemCost > 0).map((b) => (
        <div key={b.id} className="row-card box-row" style={{ borderColor: RARITY_COLOR[b.rarity][1] }}>
          <div className="icon-tile" style={{ fontSize: 26 }}>{b.icon}</div>
          <div className="info">
            <div className="title" style={{ color: RARITY_COLOR[b.rarity][0] }}>{RARITY_LABEL[b.rarity]} {t('box_word')}</div>
            <div className="desc">{t('box_cards_n', { n: b.cards })}</div>
          </div>
          <button className="action-btn" disabled={s.gems < b.gemCost} onClick={() => openGem(b.id, b.gemCost, b.icon)}>
            💠 {b.gemCost}
          </button>
        </div>
      ))}

      {/* collection */}
      <div className="section-title">🃏 {t('collection_title')}</div>
      <p className="hint">{t('collection_hint')}</p>
      {owned.length === 0 ? (
        <p className="hint" style={{ textAlign: 'center', padding: 16 }}>{t('collection_empty')}</p>
      ) : (
        <div className="card-grid">
          {owned.map((c) => {
            const n = engine.cardCount(c.id);
            const next = nextCardTier(n);
            const mult = cardProfitMult(n);
            const [lo, hi] = RARITY_COLOR[c.rarity];
            const managed = n >= MANAGER_CARD_REQ;
            return (
              <div key={c.id} className="card-cell" style={{ borderColor: hi, background: `linear-gradient(160deg, ${lo}22, ${hi}11)` }}>
                <div className="card-icon"><GenIcon id={c.id} size={56} /></div>
                <div className="card-name">{t(`gen_${c.id}`)}</div>
                <div className="card-count" style={{ color: lo }}>×{n}</div>
                <div className="card-meta">
                  {managed ? <span className="card-auto">⚙️ ×{mult.toFixed(1)}</span> : <span className="card-lock">🔒 {n}/{MANAGER_CARD_REQ}</span>}
                </div>
                {next && <div className="card-next">{t('card_next', { n: next })}</div>}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ height: 20 }} />

      {/* animated box-opening reveal */}
      {reveal && <BoxReveal cards={reveal} boxIcon={revealIcon} onClose={() => setReveal(null)} />}
    </div>
  );
}
