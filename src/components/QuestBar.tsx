import { GEN_BY_ID, type QuestDef } from '../game/data';
import { formatNumber } from '../game/format';
import { useGame, useT, type TFunc } from '../hooks';
import { GemIcon } from './icons';

function questLabel(t: TFunc, q: QuestDef, notation: 'suffix' | 'scientific'): string {
  switch (q.kind) {
    case 'own': return t('quest_own', { n: q.n, name: t(`gen_${q.target}`) });
    case 'era': return t('quest_era', { n: q.n });
    case 'managers': return t('quest_managers', { n: q.n });
    case 'ads': return t('quest_ads', { n: q.n });
    case 'anomaly': return t('quest_anomaly', { n: q.n });
    case 'rebirth': return t('quest_rebirth', { n: q.n });
    case 'earn': return t('quest_earn', { v: formatNumber(q.n, notation) });
  }
}

export function QuestBar({ onReward }: { onReward: (msg: string) => void }) {
  const engine = useGame();
  const t = useT();
  const q = engine.currentQuest();
  const notation = engine.state.notation;

  if (!q) {
    return (
      <div className="quest-bar done">
        <span className="quest-flag">🏁</span>
        <span className="quest-text">{t('quest_done')}</span>
      </div>
    );
  }

  const { cur, goal, done } = engine.questProgress();
  const pct = Math.min((cur / goal) * 100, 100);
  const icon = q.kind === 'own' ? GEN_BY_ID[q.target!].era : null;

  const rewardChip = q.crystals ? (
    <span className="quest-reward"><GemIcon size={13} /> {q.crystals}</span>
  ) : (
    <span className="quest-reward">💰</span>
  );

  const claim = () => {
    const r = engine.claimQuest();
    if (!r) return;
    if (r.crystals) onReward(`+${r.crystals} 💎  +${r.gems ?? 0} 💠`);
    else if (r.cash) onReward(`+${formatNumber(r.cash, notation)} 💰  +${r.gems ?? 0} 💠`);
    else if (r.gems) onReward(`+${r.gems} 💠`);
  };

  return (
    <div className={`quest-bar${done ? ' ready' : ''}`}>
      <span className="quest-flag">{q.kind === 'own' && icon !== null ? '🎯' : '🎯'}</span>
      <div className="quest-mid">
        <div className="quest-top">
          <span className="quest-text">{questLabel(t, q, notation)}</span>
          {rewardChip}
        </div>
        <div className="quest-prog">
          <div className="quest-prog-bar" style={{ width: `${pct}%` }} />
        </div>
        <div className="quest-count">{formatNumber(cur, notation)} / {formatNumber(goal, notation)}</div>
      </div>
      {done && (
        <button className="action-btn quest-claim" onClick={claim}>{t('quest_claim')}</button>
      )}
    </div>
  );
}
