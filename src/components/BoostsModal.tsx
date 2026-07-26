import { TIMEWARP_HOURS } from '../game/data';
import { formatDuration, formatNumber } from '../game/format';
import { useGame, useT, useWatchAd } from '../hooks';
import { Modal } from './Modals';

export function BoostsModal({ onClose, onToast }: { onClose: () => void; onToast: (m: string) => void }) {
  const engine = useGame();
  const t = useT();
  const watchAd = useWatchAd();
  const s = engine.state;
  const now = Date.now();

  const useTicket = () => {
    const gained = engine.useWarpTicket();
    if (gained != null) onToast(`⏩ +${formatNumber(gained, s.notation)} 💰`);
  };

  const offers: {
    id: string; icon: string; title: string; desc: string;
    ready: boolean; readyAt: number; apply: () => void;
  }[] = [
    {
      id: 'boost', icon: '🚀', title: t('ad_boost_t'),
      desc: t('ad_boost_d', { h: engine.adBoostHours() }),
      ready: true, readyAt: 0,
      apply: () => engine.applyAdBoost(),
    },
    {
      id: 'warp', icon: '⏩', title: t('ad_warp_t'),
      desc: t('ad_warp_d', { h: TIMEWARP_HOURS }),
      ready: engine.timewarpReady(), readyAt: s.timewarpReadyAt,
      apply: () => engine.applyTimewarp(),
    },
    {
      id: 'crystal', icon: '💎', title: t('ad_crystal_t'),
      desc: t('ad_crystal_d', { n: engine.crystalAdAmount() }),
      ready: engine.crystalAdReady(), readyAt: s.crystalAdReadyAt,
      apply: () => engine.applyCrystalAd(),
    },
  ];

  return (
    <Modal>
      <div className="m-icon">📺</div>
      <h3>{t('ads_title')}</h3>
      {/* Time Warp Tickets — a stockpile-able consumable (from Season Pass / shop) */}
      <div className="row-card" style={{ textAlign: 'start', borderColor: '#8d6bff' }}>
        <div className="icon-tile">⏩</div>
        <div className="info">
          <div className="title">{t('warp_ticket_t')} · {s.warpTickets}</div>
          <div className="desc">{s.warpTickets > 0 ? t('warp_ticket_d', { h: engine.warpHours() }) : t('warp_ticket_empty')}</div>
        </div>
        <button className="action-btn" disabled={s.warpTickets <= 0} onClick={useTicket}>
          {t('warp_ticket_use')}
        </button>
      </div>
      {offers.map((o) => (
        <div className="row-card" key={o.id} style={{ textAlign: 'start' }}>
          <div className="icon-tile">{o.icon}</div>
          <div className="info">
            <div className="title">{o.title}</div>
            <div className="desc">{o.desc}</div>
          </div>
          <button
            className="action-btn gold"
            disabled={!o.ready}
            onClick={() => watchAd(o.apply)}
          >
            {o.ready ? t('watch_ad') : t('ready_in', { t: formatDuration((o.readyAt - now) / 1000) })}
          </button>
        </div>
      ))}
      <div className="m-actions">
        <button className="m-secondary" onClick={onClose}>{t('close')}</button>
      </div>
    </Modal>
  );
}
