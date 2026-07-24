import { useState } from 'react';
import { WHEEL_PRIZES } from '../game/wheel';
import { formatNumber } from '../game/format';
import { useGame, useT, useWatchAd } from '../hooks';

// Daily Wheel — a spinning wheel of 8 prize segments. One free spin/day + ad spins. The wheel
// rotates to the winning segment, then the prize is revealed.

const SEG = 360 / WHEEL_PRIZES.length; // 45°
const R = 96;
const CX = 100;
const CY = 100;

function wedgePath(i: number): string {
  const a0 = (i * SEG - 90) * (Math.PI / 180);
  const a1 = ((i + 1) * SEG - 90) * (Math.PI / 180);
  const x0 = CX + R * Math.cos(a0), y0 = CY + R * Math.sin(a0);
  const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
  return `M${CX},${CY} L${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
}
function iconPos(i: number): { x: number; y: number } {
  const a = ((i + 0.5) * SEG - 90) * (Math.PI / 180);
  return { x: CX + 64 * Math.cos(a), y: CY + 64 * Math.sin(a) };
}

export function WheelModal({ onClose }: { onClose: () => void }) {
  const engine = useGame();
  const t = useT();
  const watchAd = useWatchAd();
  const s = engine.state;
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ prizeId: string; kind: string; amount: number } | null>(null);

  const left = engine.wheelSpinsLeft();
  const free = engine.wheelFreeAvailable();
  const needsAd = engine.wheelNeedsAd();

  const doSpin = () => {
    if (spinning || left <= 0) return;
    setSpinning(true);
    setResult(null);
    const res = engine.spinWheel();
    if (!res) { setSpinning(false); return; }
    // rotate so the winning segment's center lands under the top pointer
    const center = res.index * SEG + SEG / 2;
    setRotation((r) => Math.ceil(r / 360) * 360 + 5 * 360 + (360 - center));
    window.setTimeout(() => {
      setResult(res);
      setSpinning(false);
    }, 4100); // match the CSS spin duration
  };

  const spin = () => {
    if (needsAd) watchAd(doSpin);
    else doSpin();
  };

  const rewardText = (r: { kind: string; amount: number }): string => {
    if (r.kind === 'cash') return `💰 ${formatNumber(r.amount, s.notation)}`;
    if (r.kind === 'gems' || r.kind === 'jackpot') return `💠 ${r.amount}`;
    if (r.kind === 'boost') return `⚡ ${t('wheel_boost', { n: r.amount })}`;
    if (r.kind === 'card') return `🃏 ${t('wheel_cards', { n: r.amount })}`;
    return '';
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal wheel-modal" onClick={(e) => e.stopPropagation()}>
        <h3>🎡 {t('wheel_title')}</h3>

        <div className="wheel-wrap">
          <div className="wheel-pointer">▼</div>
          <svg
            className="wheel-svg" viewBox="0 0 200 200"
            style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 4s cubic-bezier(0.16,1,0.3,1)' : 'none' }}
          >
            {WHEEL_PRIZES.map((p, i) => (
              <path key={p.id} d={wedgePath(i)} fill={p.color} stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
            ))}
            {WHEEL_PRIZES.map((p, i) => {
              const { x, y } = iconPos(i);
              return (
                <text key={p.id} x={x} y={y} fontSize="17" textAnchor="middle" dominantBaseline="central"
                  transform={`rotate(${i * SEG + SEG / 2} ${x} ${y})`}>{p.icon}</text>
              );
            })}
            <circle cx={CX} cy={CY} r="14" fill="#1a1f38" stroke="#ffd66a" strokeWidth="2" />
          </svg>
        </div>

        {result ? (
          <div className="wheel-result">
            <div className="wheel-result-label">{t('wheel_won')}</div>
            <div className="wheel-result-prize">{rewardText(result)}</div>
          </div>
        ) : (
          <p className="hint" style={{ textAlign: 'center' }}>{t('wheel_hint')}</p>
        )}

        <button className="rebirth-btn wheel-spin" disabled={spinning || left <= 0} onClick={spin}>
          {left <= 0 ? t('wheel_done')
            : spinning ? t('wheel_spinning')
            : free ? t('wheel_free')
            : needsAd ? `📺 ${t('wheel_ad')}`
            : t('wheel_spin')}
        </button>
        <div className="wheel-left">{t('wheel_left', { n: left })}</div>

        <button className="wheel-close" onClick={onClose}>{t('close')}</button>
      </div>
    </div>
  );
}
