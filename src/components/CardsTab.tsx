import { useState } from 'react';
import {
  BOXES, CARDS, MANAGER_CARD_REQ, RARITY_COLOR, RARITY_LABEL,
  cardProfitMult, cardTierIndex, nextCardTier,
} from '../game/cards';
import type { TierUp } from './BoxReveal';
import { formatNumber, formatDuration } from '../game/format';
import { AD_GEM_REWARD } from '../game/data';
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
  const [tierUps, setTierUps] = useState<TierUp[]>([]);
  const [busy, setBusy] = useState(false);

  const freeAvail = engine.freeBoxAvailable();
  const needsAd = engine.boxNeedsAd();
  const boxesLeft = engine.boxesLeftToday();

  // open a box, then detect any ventures that crossed a card threshold (manager unlock or a new
  // profit tier) so the reveal can celebrate them.
  const openWith = (fn: () => string[] | null, icon: string) => {
    const before = { ...s.cards };
    const drawn = fn();
    if (!drawn) return;
    const ups: TierUp[] = [];
    for (const id of [...new Set(drawn)]) {
      const b = before[id] ?? 0;
      const a = engine.cardCount(id);
      if (b < MANAGER_CARD_REQ && a >= MANAGER_CARD_REQ) ups.push({ id, kind: 'manager', mult: cardProfitMult(a) });
      else if (cardTierIndex(a) > cardTierIndex(b)) ups.push({ id, kind: 'profit', mult: cardProfitMult(a) });
    }
    setTierUps(ups);
    setRevealIcon(icon);
    setReveal(drawn);
  };
  const openDaily = () => {
    if (busy) return;
    if (freeAvail) openWith(() => engine.openDailyBox(), '📦');
    else if (needsAd) { setBusy(true); watchAd(() => { setBusy(false); openWith(() => engine.openDailyBox(), '📦'); }); }
  };
  const openGem = (id: string, cost: number, icon: string) => {
    if (s.gems < cost) { onToast(t('gems_short')); return; }
    openWith(() => engine.openGemBox(id), icon);
  };

  // ventures the player has any cards for, richest first
  const owned = CARDS.filter((c) => engine.cardCount(c.id) > 0)
    .sort((a, b) => engine.cardCount(b.id) - engine.cardCount(a.id));

  return (
    <div>
      {/* gems balance + free gems */}
      <div className="gems-bar">
        <span className="gems-amt">💠 {formatNumber(s.gems, s.notation)}</span>
        <span className="gems-label">{t('gems')}</span>
      </div>
      <button
        className="action-btn gold"
        style={{ width: '100%', padding: 11, marginTop: 2 }}
        disabled={!engine.gemAdReady()}
        onClick={() => watchAd(() => engine.grantGemAd())}
      >
        {engine.gemAdReady()
          ? `📺 ${t('gems_ad', { n: AD_GEM_REWARD })}`
          : t('gems_ad_wait', { t: formatDuration(engine.gemAdReadyIn() / 1000) })}
      </button>
      <p className="hint" style={{ textAlign: 'center', marginTop: 4 }}>{t('gems_shop_hint')}</p>

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
      {reveal && <BoxReveal cards={reveal} boxIcon={revealIcon} tierUps={tierUps} onClose={() => setReveal(null)} />}
    </div>
  );
}
