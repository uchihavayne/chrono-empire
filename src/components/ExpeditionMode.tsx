import { useMemo, useState } from 'react';
import { ERAS } from '../game/data';
import { formatNumber } from '../game/format';
import {
  EXP_COLLAPSE_KEEP, newRun, resolveOffer, rollNode,
  type Offer, type Resolution, type RunState,
} from '../game/expedition';
import { useGame, useT } from '../hooks';
import { audio } from '../services/audio';

// Temporal Expeditions — DECISION-BASED push-your-luck run. At each node you pick 1 of a few
// event doors (safe drift / risky rift / greedy trade / relic echo / healing haven / paradox
// jackpot). Escape any time to bank 100%; if Stability hits 0 the timeline collapses (keep 50%).

type Phase = 'intro' | 'choosing' | 'result';

const OFFER_META: Record<string, { icon: string; tone: string }> = {
  safe:    { icon: '🕊️', tone: 'safe' },
  heal:    { icon: '✨', tone: 'heal' },
  greed:   { icon: '💎', tone: 'greed' },
  gamble:  { icon: '🎲', tone: 'gamble' },
  jackpot: { icon: '🌟', tone: 'jackpot' },
  relic:   { icon: '🔮', tone: 'relic' },
};

export function ExpeditionMode() {
  const engine = useGame();
  const t = useT();
  const s = engine.state;
  const sfx = s.sfxOn;

  const [phase, setPhase] = useState<Phase>('intro');
  const [run, setRun] = useState<RunState>(() => {
    const r = newRun();
    r.stability = engine.expeditionStartStability();
    return r;
  });
  const maxStability = useMemo(() => engine.expeditionStartStability(), [engine]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [era, setEra] = useState(() => ERAS[Math.floor(Math.random() * ERAS.length)]);
  const [outcome, setOutcome] = useState<{ res: Resolution; offer: Offer } | null>(null);
  const [ended, setEnded] = useState<{ collapsed: boolean; banked: number } | null>(null);

  const nextNode = (r: RunState) => {
    setOffers(rollNode(r.depth, Math.random));
    setEra(ERAS[Math.floor(Math.random() * ERAS.length)]);
    setOutcome(null);
    setPhase('choosing');
  };

  const dive = () => {
    if (sfx) audio.sfxAnomaly();
    nextNode(run);
  };

  const bankAndEnd = (r: RunState, collapsed: boolean) => {
    const kept = Math.round(r.shards * (collapsed ? EXP_COLLAPSE_KEEP : 1));
    const banked = engine.finishExpedition(kept, r.depth);
    if (collapsed && sfx) audio.sfxError();
    setEnded({ collapsed, banked });
    setPhase('result');
  };

  const choose = (offer: Offer) => {
    if (outcome) return; // already resolving this node
    const r: RunState = { ...run, buffs: { ...run.buffs } };
    const res = resolveOffer(offer, r, Math.random);
    r.shards = Math.max(0, r.shards + res.dShards);
    r.stability = Math.min(maxStability, r.stability + res.dStability);
    r.depth += 1;
    if (res.buff) r.buffs[res.buff] = (r.buffs[res.buff] ?? 0) + 1;
    if (r.buffs.regen) r.stability = Math.min(maxStability, r.stability + 6 * r.buffs.regen);
    setRun(r);
    setOutcome({ res, offer });

    if (res.success === true && sfx) audio.sfxReward();
    else if (res.success === false && sfx) audio.sfxError();
    else if (offer.kind === 'relic' && sfx) audio.sfxManager();
    else if (sfx) audio.sfxTap();

    if (r.stability <= 0) {
      window.setTimeout(() => bankAndEnd(r, true), 1200);
    }
  };

  const goDeeper = () => nextNode(run);

  const stabPct = Math.max(0, Math.min(100, (run.stability / maxStability) * 100));
  const stabColor = stabPct > 50 ? '#45e08a' : stabPct > 25 ? '#ffc63c' : '#ff5c74';

  const offerTitle = (o: Offer) => t(`exo_${o.kind}_t`);
  const offerDesc = (o: Offer) => {
    if (o.kind === 'safe') return t('exo_safe_d', { n: o.shards });
    if (o.kind === 'heal') return t('exo_heal_d', { n: o.stability, s: o.shards });
    if (o.kind === 'greed') return t('exo_greed_d', { n: o.shards, s: -o.stability });
    if (o.kind === 'gamble') return t('exo_gamble_d', { p: Math.round(o.odds * 100), n: o.shards, s: -o.stability });
    if (o.kind === 'jackpot') return t('exo_jackpot_d', { p: Math.round(o.odds * 100), n: o.shards });
    if (o.kind === 'relic') return t(`exb_${o.buff}_d`);
    return '';
  };

  const outcomeText = (res: Resolution, offer: Offer): string => {
    if (offer.kind === 'relic') return t(`exb_${offer.buff}_got`);
    if (res.wipedBank) return t('exo_wiped');
    if (res.success === false) return t('exo_fail', { s: Math.abs(res.dStability) });
    if (res.dStability > 0 && res.dShards > 0) return t('exo_heal_r', { n: res.dStability, s: res.dShards });
    if (res.dStability < 0) return t('exo_greed_r', { n: res.dShards, s: Math.abs(res.dStability) });
    return t('exo_win', { n: res.dShards });
  };

  return (
    <div className="exp-overlay">
      {phase !== 'intro' && phase !== 'result' && (
        <div className="exp-head">
          <span className="exp-depth">⏳ {t('exp_node', { n: run.depth })}</span>
          <div className="exp-stab">
            <div className="exp-stab-bar"><span style={{ width: `${stabPct}%`, background: stabColor }} /></div>
            <span className="exp-stab-num" style={{ color: stabColor }}>{Math.ceil(run.stability)}</span>
          </div>
          <span className="exp-shards">🔶 {formatNumber(run.shards, s.notation)}</span>
        </div>
      )}

      {/* active run-buffs */}
      {phase === 'choosing' && Object.keys(run.buffs).length > 0 && (
        <div className="exp-buffs">
          {Object.entries(run.buffs).filter(([, n]) => n > 0).map(([id, n]) => (
            <span key={id} className="exp-buff-chip">{t(`exb_${id}_i`)}{n > 1 ? ` ×${n}` : ''}</span>
          ))}
        </div>
      )}

      {phase === 'intro' && (
        <div className="exp-center">
          <div className="exp-big-icon">🌀</div>
          <h2 className="exp-title">{t('exp_title')}</h2>
          <p className="exp-desc">{t('exp_intro2')}</p>
          <button className="rebirth-btn exp-btn" onClick={dive}>{t('exp_dive')}</button>
        </div>
      )}

      {phase === 'choosing' && !outcome && (
        <div className="exp-run">
          <div className="exp-flavor">{era.icon} {t('exp_timeline', { name: t(`era_${era.id}`) })}</div>
          <p className="exp-prompt">{t('exp_choose')}</p>
          <div className="exp-doors">
            {offers.map((o, i) => (
              <button key={i} className={`exp-door ${OFFER_META[o.kind].tone}`} onClick={() => choose(o)}>
                <span className="exp-door-icon">{OFFER_META[o.kind].icon}</span>
                <span className="exp-door-title">{offerTitle(o)}</span>
                <span className="exp-door-desc">{offerDesc(o)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'choosing' && outcome && run.stability > 0 && (
        <div className="exp-center">
          <div className={`exp-outcome ${outcome.res.success === false || outcome.res.wipedBank ? 'bad' : 'good'}`}>
            <div className="exp-big-icon">
              {outcome.res.wipedBank ? '💥' : outcome.res.success === false ? '💔'
                : outcome.offer.kind === 'relic' ? OFFER_META.relic.icon : '🔶'}
            </div>
            <p className="exp-outcome-text">{outcomeText(outcome.res, outcome.offer)}</p>
          </div>
          <div className="exp-run-actions">
            <button className="rebirth-btn exp-btn" onClick={goDeeper}>{t('exp_deeper')}</button>
            <button className="exp-escape" onClick={() => bankAndEnd(run, false)}>
              🏳️ {t('exp_escape', { n: formatNumber(run.shards, s.notation) })}
            </button>
          </div>
        </div>
      )}

      {phase === 'result' && ended && (
        <div className="exp-center">
          <div className="exp-big-icon">{ended.collapsed ? '💥' : '🏆'}</div>
          <h2 className="exp-title">{ended.collapsed ? t('exp_collapse_t') : t('exp_escaped_t')}</h2>
          <p className="exp-desc">{ended.collapsed ? t('exp_collapse_d') : t('exp_escaped_d')}</p>
          <div className="exp-reward-big">🔶 +{formatNumber(ended.banked, s.notation)}</div>
          <p className="exp-sub">{t('exp_best', { n: s.expBestDepth })}</p>
          <button className="rebirth-btn" onClick={() => engine.closeExpedition()}>{t('exp_done')}</button>
        </div>
      )}
    </div>
  );
}
