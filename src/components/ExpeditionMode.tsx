import { useCallback, useEffect, useRef, useState } from 'react';
import { ERAS } from '../game/data';
import {
  EXP_HEARTS, EXP_STAGES, rollDraft, shardsForStage, stageForDepth,
  type DraftDef, type StageDef,
} from '../game/expedition';
import { useGame, useT } from '../hooks';
import { audio } from '../services/audio';

// Temporal Expeditions — the active roguelite run. Fullscreen overlay: 10 quick timed
// mini-stages, 3 hearts, a 1-of-3 relic draft between stages, Relic Shards banked per depth.
// All run state lives HERE (transient); only the final result is reported to the engine.

type Phase = 'intro' | 'ready' | 'play' | 'failed' | 'draft' | 'result';

interface Bubble { id: number; x: number; y: number }

export function ExpeditionMode() {
  const engine = useGame();
  const t = useT();
  const sfx = engine.state.sfxOn;

  const [phase, setPhase] = useState<Phase>('intro');
  const [depth, setDepth] = useState(1);
  const [hearts, setHearts] = useState(EXP_HEARTS);
  const [buffs, setBuffs] = useState<Record<string, number>>({});
  const [stage, setStage] = useState<StageDef>(() => stageForDepth(1));
  const [eraFlavor, setEraFlavor] = useState(() => ERAS[Math.floor(Math.random() * ERAS.length)]);
  const [draftOptions, setDraftOptions] = useState<DraftDef[]>([]);
  const [result, setResult] = useState<{ cleared: boolean; shards: number } | null>(null);

  // ── buff-adjusted stage parameters ──
  const timeSec = stage.timeSec * (1 + engine.expeditionTimeBonus()) + 2 * (buffs.time_plus ?? 0);
  const target = Math.max(1, Math.round(stage.target * Math.pow(0.88, buffs.ease ?? 0)));
  const zoneWidth = Math.min(0.5, stage.zoneWidth * (1 + 0.4 * (buffs.zone_wide ?? 0)));
  const bubbleLife = stage.bubbleLife + 0.4 * (buffs.bubble_slow ?? 0);

  // ── shared countdown ──
  const [timeLeft, setTimeLeft] = useState(timeSec);
  const endAt = useRef(0);

  // ── per-kind progress ──
  const [taps, setTaps] = useState(0);
  const [hits, setHits] = useState(0);
  const [pops, setPops] = useState(0);
  const [zonePos, setZonePos] = useState(0.5);
  const [zoneCenter, setZoneCenter] = useState(0.5);
  const [zoneFlash, setZoneFlash] = useState<'hit' | 'miss' | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const bubbleId = useRef(0);
  const progress = stage.kind === 'tap' ? taps : stage.kind === 'zone' ? hits : pops;
  const progressRef = useRef(0);
  progressRef.current = progress;

  const shardMult = 1 + 0.2 * (buffs.shard_boost ?? 0);
  const bankedFor = (d: number) => { let s = 0; for (let i = 1; i <= d; i++) s += shardsForStage(i); return s; };

  const newZoneCenter = useCallback((w: number) => {
    setZoneCenter(w / 2 + Math.random() * (1 - w));
  }, []);

  const beginStage = useCallback((d: number) => {
    const st = stageForDepth(d);
    setStage(st);
    setEraFlavor(ERAS[Math.floor(Math.random() * ERAS.length)]);
    setTaps(0); setHits(0); setPops(0); setBubbles([]);
    setPhase('ready');
  }, []);

  const startPlay = useCallback(() => {
    endAt.current = Date.now() + timeSec * 1000;
    setTimeLeft(timeSec);
    if (stage.kind === 'zone') newZoneCenter(zoneWidth);
    setPhase('play');
  }, [timeSec, stage.kind, zoneWidth, newZoneCenter]);

  const finish = useCallback((clearedDepth: number) => {
    const shards = engine.finishExpedition(clearedDepth, shardMult);
    setResult({ cleared: clearedDepth >= EXP_STAGES, shards });
    setPhase('result');
  }, [engine, shardMult]);

  const stageCleared = useCallback(() => {
    if (sfx) audio.sfxUnlock();
    if (depth >= EXP_STAGES) { finish(EXP_STAGES); return; }
    setDraftOptions(rollDraft());
    setPhase('draft');
  }, [depth, finish, sfx]);

  const stageFailed = useCallback(() => {
    if (sfx) audio.sfxError();
    if (hearts <= 1) { setHearts(0); finish(depth - 1); return; }
    setHearts((h) => h - 1);
    setPhase('failed');
  }, [hearts, depth, finish, sfx]);

  // countdown + zone marker animation. A 33ms interval, NOT requestAnimationFrame — rAF is
  // fully paused in backgrounded/occluded webviews, which would freeze the timer & marker.
  useEffect(() => {
    if (phase !== 'play') return;
    const t0 = Date.now();
    const iv = window.setInterval(() => {
      const left = (endAt.current - Date.now()) / 1000;
      setTimeLeft(Math.max(0, left));
      if (stage.kind === 'zone') {
        const tt = (Date.now() - t0) / 1000;
        setZonePos(0.5 + 0.5 * Math.sin(tt * stage.zoneSpeed * Math.PI * 2));
      }
      if (left <= 0) {
        clearInterval(iv);
        // time's up — did we make it?
        if (progressRef.current >= target) stageCleared(); else stageFailed();
      }
    }, 33);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stage, target]);

  // hunt: bubble spawner + expiry
  useEffect(() => {
    if (phase !== 'play' || stage.kind !== 'hunt') return;
    const spawn = window.setInterval(() => {
      const id = ++bubbleId.current;
      setBubbles((bs) => [...bs.slice(-6), { id, x: 8 + Math.random() * 76, y: 14 + Math.random() * 58 }]);
      window.setTimeout(() => setBubbles((bs) => bs.filter((b) => b.id !== id)), bubbleLife * 1000);
    }, 620);
    return () => clearInterval(spawn);
  }, [phase, stage.kind, bubbleLife]);

  // clear the stage the moment the target is reached (no need to wait out the clock)
  useEffect(() => {
    if (phase === 'play' && progress >= target) stageCleared();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, target, phase]);

  const pickDraft = (d: DraftDef) => {
    if (sfx) audio.sfxManager();
    if (d.id === 'heart_up') setHearts((h) => h + 1);
    else setBuffs((b) => ({ ...b, [d.id]: (b[d.id] ?? 0) + 1 }));
    const next = depth + 1;
    setDepth(next);
    beginStage(next);
  };

  const zoneTap = () => {
    if (Math.abs(zonePos - zoneCenter) <= zoneWidth / 2) {
      if (sfx) audio.sfxTap();
      setHits((h) => h + 1);
      setZoneFlash('hit');
      newZoneCenter(zoneWidth);
    } else {
      if (sfx) audio.sfxError();
      setZoneFlash('miss');
    }
    window.setTimeout(() => setZoneFlash(null), 220);
  };

  const popBubble = (id: number) => {
    if (sfx) audio.sfxTap();
    setBubbles((bs) => bs.filter((b) => b.id !== id));
    setPops((p) => p + 1);
  };

  const instruction =
    stage.kind === 'tap' ? t('exp_tap_i', { n: target })
    : stage.kind === 'zone' ? t('exp_zone_i', { n: target })
    : t('exp_hunt_i', { n: target });

  const timePct = Math.max(0, Math.min(100, (timeLeft / timeSec) * 100));

  return (
    <div className="exp-overlay">
      {/* header: depth · hearts · banked shards · give up */}
      {phase !== 'intro' && phase !== 'result' && (
        <div className="exp-head">
          <span className="exp-depth">⏳ {depth}/{EXP_STAGES}</span>
          <span className="exp-hearts">{'❤️'.repeat(hearts)}{'🖤'.repeat(Math.max(0, EXP_HEARTS - hearts))}</span>
          <span className="exp-shards">🔶 {Math.round(bankedFor(depth - 1) * shardMult)}</span>
          <button className="exp-quit" onClick={() => finish(depth - 1)}>✕</button>
        </div>
      )}

      {phase === 'intro' && (
        <div className="exp-center">
          <div className="exp-big-icon">🌀</div>
          <h2 className="exp-title">{t('exp_title')}</h2>
          <p className="exp-desc">{t('exp_intro', { n: EXP_STAGES, h: EXP_HEARTS })}</p>
          <button className="rebirth-btn" onClick={() => beginStage(1)}>{t('exp_dive')}</button>
        </div>
      )}

      {phase === 'ready' && (
        <div className="exp-center">
          <div className="exp-flavor">{eraFlavor.icon} {t('exp_timeline', { name: t(`era_${eraFlavor.id}`) })}</div>
          <div className="exp-big-icon">{stage.kind === 'tap' ? '👆' : stage.kind === 'zone' ? '🎯' : '🫧'}</div>
          <h2 className="exp-title">{t('exp_stage', { n: depth })}</h2>
          <p className="exp-desc">{instruction}</p>
          <p className="exp-sub">⏱️ {Math.round(timeSec)}s</p>
          <button className="rebirth-btn" onClick={startPlay}>{t('exp_go')}</button>
        </div>
      )}

      {phase === 'play' && (
        <div className="exp-arena">
          <div className="exp-timerbar"><span style={{ width: `${timePct}%` }} /></div>
          <div className="exp-goal">{instruction}</div>
          <div className="exp-count">{progress} / {target}</div>

          {stage.kind === 'tap' && (
            <button
              className="exp-tap-btn"
              onPointerDown={() => { if (sfx) audio.sfxTap(); setTaps((n) => n + 1); }}
            >
              ⚡
            </button>
          )}

          {stage.kind === 'zone' && (
            <div className="exp-zone-wrap">
              <div className="exp-zone-bar">
                <span
                  className="exp-zone-gold"
                  style={{ left: `${(zoneCenter - zoneWidth / 2) * 100}%`, width: `${zoneWidth * 100}%` }}
                />
                <span className={`exp-zone-marker${zoneFlash ? ` ${zoneFlash}` : ''}`} style={{ left: `${zonePos * 100}%` }} />
              </div>
              <button className="exp-tap-btn zone" onPointerDown={zoneTap}>🎯</button>
            </div>
          )}

          {stage.kind === 'hunt' && (
            <div className="exp-hunt-field">
              {bubbles.map((b) => (
                <button
                  key={b.id}
                  className="exp-bubble"
                  style={{ left: `${b.x}%`, top: `${b.y}%`, animationDuration: `${bubbleLife}s` }}
                  onPointerDown={() => popBubble(b.id)}
                >
                  🌀
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {phase === 'failed' && (
        <div className="exp-center">
          <div className="exp-big-icon">💔</div>
          <h2 className="exp-title">{t('exp_failed')}</h2>
          <p className="exp-desc">{t('exp_failed_d', { n: hearts })}</p>
          <button className="rebirth-btn" onClick={() => beginStage(depth)}>{t('exp_retry')}</button>
          <button className="exp-giveup" onClick={() => finish(depth - 1)}>{t('exp_bank')}</button>
        </div>
      )}

      {phase === 'draft' && (
        <div className="exp-center">
          <h2 className="exp-title">{t('exp_draft_t')}</h2>
          <p className="exp-desc">{t('exp_draft_d')}</p>
          <div className="exp-draft-row">
            {draftOptions.map((d) => (
              <button key={d.id} className="exp-draft-card" onClick={() => pickDraft(d)}>
                <span className="exp-draft-icon">{d.icon}</span>
                <span className="exp-draft-name">{t(`exp_b_${d.id}_n`)}</span>
                <span className="exp-draft-desc">{t(`exp_b_${d.id}_d`)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && result && (
        <div className="exp-center">
          <div className="exp-big-icon">{result.cleared ? '🏆' : '🌀'}</div>
          <h2 className="exp-title">{result.cleared ? t('exp_clear_t') : t('exp_over_t')}</h2>
          <p className="exp-desc">{t('exp_reward', { n: result.shards })}</p>
          <p className="exp-sub">{t('exp_best', { n: engine.state.expBestDepth })}</p>
          <button className="rebirth-btn" onClick={() => engine.closeExpedition()}>{t('exp_done')}</button>
        </div>
      )}
    </div>
  );
}
