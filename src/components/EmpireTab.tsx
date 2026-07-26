import { useEffect, useRef, useState } from 'react';
import { ERAS, GENERATORS, milestoneMult, nextMilestone, type GeneratorDef } from '../game/data';
import { formatNumber, formatDuration } from '../game/format';
import { useGame, useT } from '../hooks';
import type { BuyAmount } from '../game/engine';
import { GenIcon } from './icons';
import { QuestBar } from './QuestBar';

const AMOUNTS: BuyAmount[] = [1, 10, 100, 'max'];

interface FloatNum { id: number; text: string }

function GeneratorCard({ g, amount }: { g: GeneratorDef; amount: BuyAmount }) {
  const engine = useGame();
  const t = useT();
  const gs = engine.state.generators[g.id];
  const notation = engine.state.notation;
  const { count: buyN, cost } = engine.buyCost(g.id, amount);
  const affordable = engine.state.cash >= cost;
  const cardRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);
  const [burst, setBurst] = useState(0);

  // satisfying buy feedback: a squash-pop on the card, a bump on the count badge, and a
  // short coin spray from the icon. Web Animations API replays cleanly on every tap.
  const handleBuy = () => {
    if (!affordable) return;
    engine.buyGenerator(g.id, amount);
    setBurst((b) => b + 1);
    cardRef.current?.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }, { transform: 'scale(1)' }],
      { duration: 240, easing: 'ease-out' },
    );
    badgeRef.current?.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }],
      { duration: 300, easing: 'cubic-bezier(.2,1.4,.4,1)' },
    );
  };
  const effCycle = engine.effectiveCycle(g);
  const continuous = gs.hasManager && effCycle <= 0.35;
  // live countdown: seconds remaining in the CURRENT cycle, falling with the fill.
  // idle (owned but not running) shows the full cycle time; managed/running counts down.
  const running = gs.running || gs.hasManager;
  const remaining = running ? effCycle * (1 - Math.min(gs.progress, 1)) : effCycle;
  const fmtTime = (sec: number) =>
    sec >= 60
      ? `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
      : `${sec.toFixed(1)}s`;
  const cycleLabel = continuous ? '⚡' : fmtTime(Math.max(remaining, 0));
  const [floats, setFloats] = useState<FloatNum[]>([]);
  const floatId = useRef(0);

  const revText = continuous || gs.hasManager
    ? `${formatNumber(engine.revPerSec(g), notation)}${t('per_sec')}`
    : formatNumber(engine.cycleRevenue(g), notation);

  const pushFloat = (amountEarned: number) => {
    const id = ++floatId.current;
    setFloats((f) => [...f, { id, text: `+${formatNumber(amountEarned, notation)}` }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1100);
  };

  const onRun = () => {
    if (gs.count === 0 || gs.hasManager || gs.running) return;
    const revenue = engine.cycleRevenue(g);
    engine.runGenerator(g.id);
    iconRef.current?.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(0.88)' }, { transform: 'scale(1)' }],
      { duration: 200, easing: 'ease-out' },
    );
    if (effCycle <= 0.35) {
      pushFloat(revenue);
    } else {
      setTimeout(() => pushFloat(revenue), effCycle * 1000);
    }
  };

  return (
    <div className="gen-card" ref={cardRef}>
      {floats.map((f) => (
        <span key={f.id} className="float-num">{f.text}</span>
      ))}
      {burst > 0 && (
        <div className="coin-burst" key={burst}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} style={{ ['--a' as string]: `${-90 + (i - 2.5) * 20}deg` }}>🪙</span>
          ))}
        </div>
      )}
      <button className="gen-icon" ref={iconRef} onClick={onRun} aria-label={t(`gen_${g.id}`)}>
        <GenIcon id={g.id} size={60} />
        <span className="count-badge" ref={badgeRef}>{gs.count}</span>
      </button>
      <div className="gen-mid">
        <div className="gen-name">{t(`gen_${g.id}`)}</div>
        <div className="gen-rev">{gs.count > 0 ? revText : '—'}</div>
        {gs.count > 0 && (
          <div className="gen-milestone">
            {t('next_bonus', { n: nextMilestone(gs.count) })} · <b>×{formatNumber(milestoneMult(gs.count), notation)}</b>
          </div>
        )}
        {gs.count > 0 && (() => {
          const mLvl = engine.masteryLevel(g.id);
          const mNext = engine.masteryNext(g.id);
          return (
            <div className="gen-mastery">
              🏅 {t('mastery_lv', { n: mLvl })}
              {mLvl > 0 && <> · <b>+{Math.round(engine.masteryMult(g.id) * 100 - 100)}%</b></>}
              {mNext !== null && <span className="gm-prog"> · {engine.masteryBought(g.id)}/{mNext}</span>}
            </div>
          );
        })()}
        <div className="progress">
          <div
            className={`bar${continuous ? ' continuous' : ''}`}
            style={{ width: `${continuous ? 100 : Math.min(gs.progress * 100, 100)}%` }}
          />
          {gs.count > 0 && <span className="bar-time">⏱ {cycleLabel}</span>}
        </div>
      </div>
      <button className="buy-btn" disabled={!affordable} onClick={handleBuy}>
        {t('buy')} ×{buyN}
        <span className="sub">{formatNumber(cost, notation)}</span>
      </button>
    </div>
  );
}

function UnlockEraCard() {
  const engine = useGame();
  const t = useT();
  const s = engine.state;
  const cost = engine.nextEraCost();
  if (cost === null) return null;
  const nextEra = ERAS[s.erasUnlocked];
  const nextCount = GENERATORS.filter((g) => g.era === s.erasUnlocked).length;
  const progress = Math.min(s.cash / cost, 1);

  return (
    <div className="unlock-card">
      <div className="unlock-head">
        <span className="unlock-icon">{nextEra.icon}</span>
        <div>
          <div className="unlock-kicker">{t('next_era')}</div>
          <div className="unlock-name">{t(`era_${nextEra.id}`)}</div>
        </div>
      </div>
      <p className="unlock-reward">✨ {t('era_reward', { n: nextCount })}</p>
      <div className="progress unlock-progress">
        <div className="bar" style={{ width: `${progress * 100}%` }} />
      </div>
      <button
        className="rebirth-btn unlock-btn"
        disabled={s.cash < cost}
        onClick={() => engine.unlockEra()}
      >
        🔓 {t('unlock_era')} · {formatNumber(cost, s.notation)}
      </button>
    </div>
  );
}

export function EmpireTab({
  onToast, viewedEra, setViewedEra,
}: {
  onToast: (msg: string) => void;
  viewedEra: number;
  setViewedEra: (updater: number | ((cur: number) => number)) => void;
}) {
  const engine = useGame();
  const t = useT();
  const s = engine.state;
  const [amount, setAmount] = useState<BuyAmount>(1);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const activeChip = useRef<HTMLButtonElement>(null);

  const setSelEra = setViewedEra;
  const sel = Math.min(viewedEra, s.erasUnlocked - 1);
  const gens = GENERATORS.filter((g) => g.era === sel);
  const setComplete = engine.eraSetComplete(sel);
  const rushIdx = engine.eraRushIndex();

  // keep the selected era chip scrolled into view
  useEffect(() => {
    activeChip.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [sel]);

  const goEra = (delta: number) => {
    setViewedEra((cur: number) => Math.max(0, Math.min(s.erasUnlocked - 1, Math.min(cur, s.erasUnlocked - 1) + delta)));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const tp = e.touches[0];
    touch.current = { x: tp.clientX, y: tp.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const tp = e.changedTouches[0];
    const dx = tp.clientX - touch.current.x;
    const dy = tp.clientY - touch.current.y;
    touch.current = null;
    // horizontal-dominant swipe past threshold → change era (RTL-agnostic: left = next)
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      goEra(dx < 0 ? 1 : -1);
    }
  };

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* quest chain */}
      <QuestBar onReward={onToast} />

      {/* era (chapter) selector — tap a chip or swipe the venture list left/right */}
      <div className="era-strip">
        {ERAS.map((e, i) => {
          const unlocked = i < s.erasUnlocked;
          return (
            <button
              key={e.id}
              ref={i === sel ? activeChip : undefined}
              className={`era-chip${i === sel ? ' active' : ''}${unlocked ? '' : ' locked'}${unlocked && i === rushIdx ? ' rushing' : ''}`}
              onClick={() => unlocked && setSelEra(i)}
            >
              {unlocked && i === rushIdx && <span className="era-chip-fire">🔥</span>}
              <span className="era-chip-icon">{unlocked ? e.icon : '🔒'}</span>
              <span className="era-chip-name">{unlocked ? t(`era_${e.id}`) : `${i + 1}`}</span>
            </button>
          );
        })}
      </div>

      {/* Era Rush — a rotating ×N boost on one era; tap to jump there */}
      <button className="era-rush-banner" onClick={() => setSelEra(rushIdx)}>
        <span className="err-flame">🔥</span>
        <span className="err-text">
          <b>{t('era_rush')}</b> · {ERAS[rushIdx].icon} {t(`era_${ERAS[rushIdx].id}`)} ×{engine.eraRushMult()}
        </span>
        <span className="err-time">⏱ {formatDuration(engine.eraRushTimeLeftMs() / 1000)}</span>
      </button>

      {/* era set-collection bonus banner */}
      <div className={`set-banner${setComplete ? ' active' : ''}`}>
        <span className="set-badge">{setComplete ? '⭐' : '☆'}</span>
        <span className="set-text">
          <b>{setComplete ? t('set_done') : t('set_bonus')}</b> · {t('set_bonus_desc')}
        </span>
      </div>

      <div className="amount-row">
        {AMOUNTS.map((a) => (
          <button key={a} className={a === amount ? 'active' : ''} onClick={() => setAmount(a)}>
            {a === 'max' ? 'MAX' : `×${a}`}
          </button>
        ))}
      </div>

      {/* QoL: bulk actions */}
      <div className="qol-row">
        <button className="qol-btn" onClick={() => engine.buyMaxAll(sel)}>⚡ {t('buy_max_all')}</button>
        {engine.idleGeneratorCount() > 0 && (
          <button className="qol-btn collect" onClick={() => { const n = engine.collectAllIdle(); if (n) onToast(t('collected_all', { n })); }}>
            👆 {t('collect_all')}
          </button>
        )}
      </div>

      {gens.map((g) => (
        <GeneratorCard key={g.id} g={g} amount={amount} />
      ))}

      {/* unlock next era, shown at the frontier chapter */}
      {sel === s.erasUnlocked - 1 && <UnlockEraCard />}
    </div>
  );
}
