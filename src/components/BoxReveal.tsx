import { useEffect, useState } from 'react';
import { RARITY_COLOR, RARITY_LABEL, cardRarity } from '../game/cards';
import { GEN_BY_ID } from '../game/data';
import { useGame, useT } from '../hooks';
import { GenIcon } from './icons';

export interface TierUp { id: string; kind: 'manager' | 'profit'; mult: number }

/** Full-screen box-opening experience: the box shakes & bursts, then cards flip in one at a
 *  time — tap to send the current card flying away and reveal the next. If collecting the box
 *  crossed a card threshold, a "merge" celebration plays at the end. */
export function BoxReveal(
  { cards, boxIcon, tierUps = [], onClose }:
  { cards: string[]; boxIcon: string; tierUps?: TierUp[]; onClose: () => void },
) {
  const engine = useGame();
  const t = useT();
  const [phase, setPhase] = useState<'box' | 'cards' | 'merge'>('box');
  const [idx, setIdx] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (phase !== 'box') return;
    const h = setTimeout(() => setPhase('cards'), 950); // shake + burst
    return () => clearTimeout(h);
  }, [phase]);

  const advance = () => {
    if (phase === 'merge') { onClose(); return; }
    if (phase !== 'cards' || exiting) return;
    if (idx >= cards.length - 1) {
      if (tierUps.length) { setPhase('merge'); return; }
      onClose();
      return;
    }
    setExiting(true);
    setTimeout(() => { setIdx((i) => i + 1); setExiting(false); }, 300);
  };

  if (phase === 'box') {
    return (
      <div className="reveal-overlay">
        <div className="reveal-box">{boxIcon}</div>
        <div className="reveal-sparks">
          {[...Array(8)].map((_, i) => <span key={i} style={{ ['--a' as string]: `${i * 45}deg` }} />)}
        </div>
      </div>
    );
  }

  if (phase === 'merge') {
    return (
      <div className="reveal-overlay" onClick={advance}>
        <div className="merge-title">✨ {t('merge_title')} ✨</div>
        <div className="merge-list">
          {tierUps.map((u, i) => (
            <div key={u.id} className="merge-item" style={{ animationDelay: `${i * 140}ms` }}>
              <div className="merge-icon"><GenIcon id={u.id} size={52} /></div>
              <div className="merge-info">
                <div className="merge-name">{t(`gen_${u.id}`)}</div>
                <div className="merge-bonus">
                  {u.kind === 'manager' ? `⚙️ ${t('merge_auto')}` : `📈 ${t('merge_profit', { n: u.mult.toFixed(1) })}`}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="reveal-hint">{t('reveal_tap')}</div>
      </div>
    );
  }

  const id = cards[idx];
  const rar = cardRarity(GEN_BY_ID[id].era);
  const [lo, hi] = RARITY_COLOR[rar];

  return (
    <div className="reveal-overlay" onClick={advance}>
      <div className="reveal-progress">{idx + 1} / {cards.length}</div>
      <div
        key={idx}
        className={`big-card rar-${rar}${exiting ? ' exiting' : ''}`}
        style={{ ['--lo' as string]: lo, ['--hi' as string]: hi }}
      >
        <div className="big-card-inner">
          <div className="big-card-face big-card-back">{boxIcon}</div>
          <div className="big-card-face big-card-front">
            <div className="bc-rarity">{RARITY_LABEL[rar]}</div>
            <div className="bc-icon"><GenIcon id={id} size={116} /></div>
            <div className="bc-name">{t(`gen_${id}`)}</div>
            <div className="bc-count">×{engine.cardCount(id)}</div>
          </div>
        </div>
      </div>
      <div className="reveal-hint">{t('reveal_tap')}</div>
    </div>
  );
}
