// First-run onboarding. A short, skippable 4-step welcome that teaches the core loop
// (tap → grow → automate → time-travel) before dropping the player into the game.

import { useState } from 'react';
import { useGame, useT } from '../hooks';
import { Modal } from './Modals';

const STEPS = [
  { icon: '🔥', key: 'welcome' },
  { icon: '💰', key: 'buy' },
  { icon: '🎩', key: 'auto' },
  { icon: '🌀', key: 'prestige' },
] as const;

export function Tutorial() {
  const engine = useGame();
  const t = useT();
  const [step, setStep] = useState(0);
  const last = step >= STEPS.length - 1;
  const s = STEPS[step];

  const finish = () => engine.dismissTutorial();

  return (
    <Modal>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, lineHeight: 1, margin: '4px 0 10px' }}>{s.icon}</div>
        <h3 style={{ margin: '0 0 8px' }}>{t(`tut_${s.key}_t`)}</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 13.5, lineHeight: 1.5, fontWeight: 600 }}>
          {t(`tut_${s.key}_d`)}
        </p>

        {/* progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '14px 0 12px' }}>
          {STEPS.map((_, i) => (
            <span key={i} style={{
              width: i === step ? 20 : 8, height: 8, borderRadius: 4,
              background: i === step ? 'var(--acc, #7c5cff)' : 'rgba(255,255,255,0.22)',
              transition: 'width 0.2s',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {!last && (
            <button className="action-btn purple" style={{ flex: 1, padding: 12 }} onClick={finish}>
              {t('tut_skip')}
            </button>
          )}
          <button
            className="action-btn"
            style={{ flex: 2, padding: 12 }}
            onClick={() => (last ? finish() : setStep(step + 1))}
          >
            {last ? t('tut_start') : t('tut_next')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
