// Venture icons delegate to the clean cartoon-vector set (iconsCartoon).
// UI icons (coin, gem, hat, vortex, tab bar, tv) live here.

import { CartoonIcon } from './iconsCartoon';

export function GenIcon({ id, size = 44 }: { id: string; size?: number }) {
  return <CartoonIcon id={id} size={size} />;
}

// ─── UI icons ───

const OUT = '#2c2118';
const OUTC = '#3a2a5a';

export function CoinIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="27" fill="#ffcf3c" stroke={OUT} strokeWidth="3.2" />
      <circle cx="32" cy="32" r="19" fill="none" stroke="#e0a021" strokeWidth="3" />
      <path d="M32 20 L35.5 28 L44 28.5 L37.5 34 L40 42 L32 37 L24 42 L26.5 34 L20 28.5 L28.5 28 Z" fill="#e0a021" stroke={OUT} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function GemIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <path d="M16 10 L48 10 L59 25 L32 57 L5 25 Z" fill="#8d6bff" stroke={OUTC} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M16 10 L32 25 L48 10 Z" fill="#c8b3ff" stroke={OUTC} strokeWidth="2" strokeLinejoin="round" />
      <path d="M5 25 L32 25 L32 57 Z" fill="#7a5cf0" />
      <path d="M32 25 L59 25 L32 57 Z" fill="#5f3ee0" />
    </svg>
  );
}

export function HatIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <ellipse cx="32" cy="48" rx="26" ry="7" fill="#2c3245" stroke={OUT} strokeWidth="3.2" />
      <rect x="17" y="13" width="30" height="34" rx="5" fill="#3c4258" stroke={OUT} strokeWidth="3.2" />
      <rect x="17" y="35" width="30" height="7" fill="#e24438" />
    </svg>
  );
}

export function VortexIcon({ size = 30, spin = false }: { size?: number; spin?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={spin ? 'spin-slow' : undefined}>
      <path d="M32 6 A26 26 0 1 1 6 32" fill="none" stroke="#8d6bff" strokeWidth="7.5" strokeLinecap="round" />
      <path d="M32 18 A14 14 0 1 1 18 32" fill="none" stroke="#c8b3ff" strokeWidth="6.5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="5" fill="#e6dcff" />
    </svg>
  );
}

export function CastleIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="currentColor">
      <path d="M10 26 L10 12 L18 12 L18 17 L24 17 L24 12 L32 12 L32 17 L40 17 L40 12 L46 12 L46 17 L54 17 L54 12 L54 26 L48 30 L48 54 L38 54 L38 42 A6 6 0 0 0 26 42 L26 54 L16 54 L16 30 Z" />
    </svg>
  );
}

export function UpIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="currentColor">
      <path d="M32 6 L54 28 L42 28 L42 40 L22 40 L22 28 L10 28 Z" />
      <rect x="22" y="46" width="20" height="6" rx="3" />
      <rect x="22" y="55" width="20" height="5" rx="2.5" />
    </svg>
  );
}

export function MenuIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="currentColor">
      <rect x="8" y="8" width="21" height="21" rx="6" />
      <rect x="35" y="8" width="21" height="21" rx="6" />
      <rect x="8" y="35" width="21" height="21" rx="6" />
      <rect x="35" y="35" width="21" height="21" rx="6" />
    </svg>
  );
}

export function TvIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <rect x="7" y="15" width="50" height="37" rx="9" fill="#2a3145" stroke="#fff" strokeWidth="3.2" />
      <path d="M27 25 L43 33 L27 41 Z" fill="#ffcf3c" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <line x1="22" y1="7" x2="30" y2="15" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="42" y1="7" x2="34" y2="15" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export function CometIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <path d="M52 12 C40 16 24 30 16 46 C22 44 28 44 33 47 C30 40 34 30 44 24 C50 20 52 16 52 12 Z" fill="#ffe08a" stroke="#b57d00" strokeWidth="2.4" strokeLinejoin="round" opacity="0.85" />
      <circle cx="44" cy="20" r="12" fill="#ffcf3c" stroke="#b57d00" strokeWidth="3" />
      <path d="M44 12 L46.5 18 L53 18.5 L48 22.5 L50 29 L44 25 L38 29 L40 22.5 L35 18.5 L41.5 18 Z" fill="#fff2c0" />
    </svg>
  );
}
