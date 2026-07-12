import { useEffect, useState } from 'react';
import { VortexIcon } from './icons';

// Branded opening screen shown for a beat on launch so the app doesn't just "pop" into the game.
// Auto-dismisses after a short delay; tapping skips it. Fades out smoothly into the game.
export function IntroScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  const dismiss = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(onDone, 600); // match the CSS fade-out duration
  };

  useEffect(() => {
    const h = window.setTimeout(dismiss, 2400);
    return () => window.clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`intro${leaving ? ' intro-out' : ''}`} onClick={dismiss}>
      <div className="intro-glow" />
      <div className="intro-emblem">
        <VortexIcon size={96} spin />
      </div>
      <div className="intro-title">CHRONO EMPIRE</div>
      <div className="intro-tag">Build an empire across time</div>
      <div className="intro-loader"><span /></div>
    </div>
  );
}
