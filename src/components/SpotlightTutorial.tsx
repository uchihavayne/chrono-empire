import { useEffect, useState } from 'react';
import { useGame, useT } from '../hooks';

// Each step spotlights a real on-screen element and explains it. Targets live on the Empire
// tab + the tab bar, so no tab-switching is needed.
const STEPS = [
  { sel: '.buy-btn', key: 'buy', place: 'above' as const },
  { sel: '[data-tut="cash"]', key: 'cash', place: 'below' as const },
  { sel: '[data-tut="cards"]', key: 'cards', place: 'above' as const },
  { sel: '[data-tut="rebirth"]', key: 'rift', place: 'above' as const },
];

interface Box { top: number; left: number; width: number; height: number }

export function SpotlightTutorial() {
  const engine = useGame();
  const t = useT();
  const [step, setStep] = useState(0);
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector(STEPS[step].sel);
      if (el) {
        const r = el.getBoundingClientRect();
        setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setBox(null);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    const iv = window.setInterval(measure, 300); // track any layout shifts
    return () => { window.removeEventListener('resize', measure); clearInterval(iv); };
  }, [step]);

  const finish = () => engine.dismissTutorial();
  const next = () => (step >= STEPS.length - 1 ? finish() : setStep(step + 1));

  const s = STEPS[step];
  const pad = 8;
  const hole = box && {
    top: box.top - pad, left: box.left - pad,
    width: box.width + pad * 2, height: box.height + pad * 2,
  };
  const bubble: React.CSSProperties = box
    ? s.place === 'above'
      ? { bottom: window.innerHeight - box.top + 18, left: 14, right: 14 }
      : { top: box.top + box.height + 18, left: 14, right: 14 }
    : { top: '40%', left: 14, right: 14 };

  return (
    <div className="spot-overlay">
      {hole && <div className="spot-hole" style={hole} />}
      <div className="spot-bubble" style={bubble}>
        <div className="spot-title">{t(`spot_${s.key}_t`)}</div>
        <div className="spot-text">{t(`spot_${s.key}_d`)}</div>
        <div className="spot-dots">
          {STEPS.map((_, i) => <span key={i} className={i === step ? 'on' : ''} />)}
        </div>
        <div className="spot-actions">
          <button className="action-btn purple" onClick={finish}>{t('tut_skip')}</button>
          <button className="action-btn" onClick={next}>
            {step >= STEPS.length - 1 ? t('tut_start') : t('tut_next')}
          </button>
        </div>
      </div>
    </div>
  );
}
