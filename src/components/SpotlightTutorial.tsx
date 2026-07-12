import { useEffect, useRef, useState } from 'react';
import { useGame, useT } from '../hooks';

// A guided, player-friendly onboarding. Each step either just explains something (Next button) or
// REQUIRES an action — the "buy" step won't advance until the player actually buys a venture, and
// the dark mask blocks everything except the glowing target so they can't wander off first.
interface Step {
  key: string;
  sel?: string;                 // element to spotlight; absent = centered welcome bubble
  place?: 'above' | 'below';
  action?: 'buy';               // if set, advance only when the action is detected
  titleKey?: string;            // override translation key for title/text
  textKey?: string;
}

const STEPS: Step[] = [
  { key: 'welcome', titleKey: 'tut_welcome_t', textKey: 'tut_welcome_d' },
  { key: 'buy', sel: '.buy-btn', place: 'above', action: 'buy' },
  { key: 'cash', sel: '[data-tut="cash"]', place: 'below' },
  { key: 'cards', sel: '[data-tut="cards"]', place: 'above' },
  { key: 'rift', sel: '[data-tut="rebirth"]', place: 'above' },
];

interface Box { top: number; left: number; width: number; height: number }

const totalGenerators = (gens: Record<string, { count: number }>): number =>
  Object.values(gens).reduce((a, g) => a + (g?.count ?? 0), 0);

export function SpotlightTutorial() {
  const engine = useGame();
  const t = useT();
  const [step, setStep] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const baseline = useRef(0);

  const s = STEPS[step];

  // when we enter an action step, snapshot the current state so we can detect the action
  useEffect(() => {
    if (s.action === 'buy') baseline.current = totalGenerators(engine.state.generators);
  }, [step, s.action, engine]);

  useEffect(() => {
    const tick = () => {
      // 1) keep the spotlight glued to the (possibly moving) target
      if (s.sel) {
        const el = document.querySelector(s.sel);
        if (el) {
          const r = el.getBoundingClientRect();
          setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
        } else {
          setBox(null);
        }
      } else {
        setBox(null);
      }
      // 2) auto-advance action steps once the player has done the thing
      if (s.action === 'buy' && totalGenerators(engine.state.generators) > baseline.current) {
        setStep((n) => n + 1);
      }
    };
    tick();
    window.addEventListener('resize', tick);
    const iv = window.setInterval(tick, 200);
    return () => { window.removeEventListener('resize', tick); clearInterval(iv); };
  }, [step, s.sel, s.action, engine]);

  const finish = () => engine.dismissTutorial();
  const next = () => (step >= STEPS.length - 1 ? finish() : setStep(step + 1));

  const pad = 8;
  const hole = box && {
    top: box.top - pad, left: box.left - pad,
    width: box.width + pad * 2, height: box.height + pad * 2,
  };

  const bubble: React.CSSProperties = hole
    ? s.place === 'above'
      ? { bottom: window.innerHeight - hole.top + 14, left: 14, right: 14 }
      : { top: hole.top + hole.height + 14, left: 14, right: 14 }
    : { top: '50%', left: 14, right: 14, transform: 'translateY(-50%)' };

  const title = s.titleKey ? t(s.titleKey) : t(`spot_${s.key}_t`);
  const text = s.textKey ? t(s.textKey) : t(`spot_${s.key}_d`);

  return (
    <div className="spot-overlay">
      {hole ? (
        <>
          {/* four dark panels leave ONLY the target rect interactive */}
          <div className="spot-mask" style={{ top: 0, left: 0, right: 0, height: hole.top }} />
          <div className="spot-mask" style={{ top: hole.top + hole.height, left: 0, right: 0, bottom: 0 }} />
          <div className="spot-mask" style={{ top: hole.top, height: hole.height, left: 0, width: hole.left }} />
          <div className="spot-mask" style={{ top: hole.top, height: hole.height, left: hole.left + hole.width, right: 0 }} />
          <div className="spot-ring" style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }} />
        </>
      ) : (
        <div className="spot-mask" style={{ inset: 0 }} />
      )}

      <div className="spot-bubble" style={bubble}>
        <div className="spot-title">{title}</div>
        <div className="spot-text">{text}</div>
        <div className="spot-dots">
          {STEPS.map((_, i) => <span key={i} className={i === step ? 'on' : ''} />)}
        </div>
        {s.action === 'buy' ? (
          // no "next" — they must actually buy. A pulsing hint + a small escape hatch.
          <>
            <div className="spot-hint">{t('tut_tap')}</div>
            <button className="spot-skip" onClick={finish}>{t('tut_skip')}</button>
          </>
        ) : (
          <div className="spot-actions">
            <button className="action-btn purple" onClick={finish}>{t('tut_skip')}</button>
            <button className="action-btn" onClick={next}>
              {step >= STEPS.length - 1 ? t('tut_start') : t('tut_next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
