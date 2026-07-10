// Per-era atmospheric backdrop. Each era renders a distinct SVG scene behind the game
// content so switching eras transforms the whole screen, not just accent colours.
// Composed in the UPPER band (that's the area not covered by cards) and faded downward.

const svgProps = {
  viewBox: '0 0 100 100',
  preserveAspectRatio: 'xMidYMin slice',
  xmlns: 'http://www.w3.org/2000/svg',
  width: '100%',
  height: '100%',
} as const;

function Scene({ id }: { id: string }) {
  switch (id) {
    case 'paleo':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-paleo" cx="0.5" cy="0.15" r="0.9">
            <stop offset="0" stopColor="#ff8a3c" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ff8a3c" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-paleo)" />
          {/* cave arch framing the top */}
          <path d="M0 0 L0 34 Q26 58 50 42 Q74 58 100 34 L100 0 Z" fill="#000" opacity="0.5" />
          {/* rocky ridges */}
          <path d="M0 66 Q16 54 30 64 T60 62 T100 66 L100 100 L0 100 Z" fill="#000" opacity="0.35" />
        </svg>
      );
    case 'meso':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-meso" cx="0.5" cy="0.15" r="0.9">
            <stop offset="0" stopColor="#3aa8c0" stopOpacity="0.5" />
            <stop offset="1" stopColor="#3aa8c0" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-meso)" />
          <circle cx="78" cy="20" r="8" fill="#dff4fa" opacity="0.5" />
          {/* forested hills by a lake */}
          <path d="M0 58 Q18 44 34 56 T66 54 T100 60 L100 72 L0 72 Z" fill="#0d2a30" opacity="0.5" />
          {/* lake shimmer */}
          <rect x="0" y="72" width="100" height="28" fill="#1e6a7a" opacity="0.32" />
          <path d="M8 80 q10 -3 20 0 M54 84 q10 -3 20 0" stroke="#bfeefc" strokeWidth="0.8" opacity="0.4" fill="none" />
          {/* two figures fishing */}
          <path d="M26 70 l0 -6 M26 66 l4 3" stroke="#000" strokeWidth="1" opacity="0.45" />
        </svg>
      );
    case 'neo':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-neo" cx="0.5" cy="0.16" r="0.9">
            <stop offset="0" stopColor="#95b83a" stopOpacity="0.5" />
            <stop offset="1" stopColor="#95b83a" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-neo)" />
          <circle cx="24" cy="22" r="9" fill="#fff0b0" opacity="0.55" />
          {/* rolling farmland furrows */}
          <path d="M0 62 Q50 54 100 62 L100 100 L0 100 Z" fill="#3a4a12" opacity="0.5" />
          <path d="M0 72 Q50 66 100 72 M0 82 Q50 76 100 82 M0 92 Q50 86 100 92" stroke="#1e2808" strokeWidth="0.8" opacity="0.4" fill="none" />
          {/* wheat sheaves + a hut */}
          <path d="M40 70 a10 10 0 0 1 20 0 Z" fill="#000" opacity="0.4" />
          {[16, 80].map((x) => (
            <path key={x} d={`M${x} 66 l0 -8 M${x} 60 l-3 -4 M${x} 60 l3 -4`} stroke="#000" strokeWidth="1" opacity="0.4" />
          ))}
        </svg>
      );
    case 'copper':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-copper" cx="0.5" cy="0.15" r="0.9">
            <stop offset="0" stopColor="#e8763a" stopOpacity="0.5" />
            <stop offset="1" stopColor="#e8763a" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-copper)" />
          {/* smelting glow + smoke */}
          <circle cx="30" cy="40" r="10" fill="#ff9838" opacity="0.28" />
          <g opacity="0.2" fill="#d8c0b0">
            <circle cx="30" cy="24" r="6" /><circle cx="35" cy="16" r="4" />
          </g>
          {/* rocky ridge with ore vein */}
          <path d="M0 60 L20 40 L40 58 L60 34 L82 58 L100 46 L100 100 L0 100 Z" fill="#3a2010" opacity="0.5" />
          <path d="M56 42 q4 6 -1 12 M64 46 q4 5 0 10" stroke="#ff8a3c" strokeWidth="1" opacity="0.5" fill="none" />
          {/* clay furnace */}
          <path d="M24 70 q-3 -14 6 -14 q9 0 6 14 Z" fill="#000" opacity="0.5" />
        </svg>
      );
    case 'bronze':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-bronze" cx="0.5" cy="0.16" r="0.9">
            <stop offset="0" stopColor="#d09a3a" stopOpacity="0.5" />
            <stop offset="1" stopColor="#d09a3a" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-bronze)" />
          <circle cx="50" cy="22" r="10" fill="#ffdc7a" opacity="0.5" />
          {/* stepped ziggurat */}
          <path d="M20 74 L26 62 L74 62 L80 74 Z" fill="#000" opacity="0.48" />
          <path d="M30 62 L35 52 L65 52 L70 62 Z" fill="#000" opacity="0.44" />
          <path d="M38 52 L42 44 L58 44 L62 52 Z" fill="#000" opacity="0.4" />
          <rect x="47" y="38" width="6" height="6" fill="#000" opacity="0.4" />
          <path d="M0 76 Q50 70 100 76 L100 100 L0 100 Z" fill="#000" opacity="0.3" />
        </svg>
      );
    case 'iron':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-iron" cx="0.5" cy="0.16" r="0.9">
            <stop offset="0" stopColor="#7f8b9c" stopOpacity="0.45" />
            <stop offset="1" stopColor="#7f8b9c" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-iron)" />
          {/* forge glow */}
          <circle cx="26" cy="42" r="8" fill="#ff7a2c" opacity="0.24" />
          {/* hillfort on a mound with palisade */}
          <path d="M0 72 Q50 52 100 72 L100 100 L0 100 Z" fill="#20301c" opacity="0.5" />
          <path d="M30 64 L30 56 L70 56 L70 64" fill="none" stroke="#000" strokeWidth="2" opacity="0.5" />
          <path d="M30 56 l2 -3 l2 3 M38 56 l2 -3 l2 3 M46 56 l2 -3 l2 3 M54 56 l2 -3 l2 3 M62 56 l2 -3 l2 3" fill="#000" opacity="0.5" />
          {/* gate tower + banner */}
          <rect x="46" y="48" width="8" height="12" fill="#000" opacity="0.5" />
          <path d="M50 48 l0 -5 l6 2 l-6 2" fill="#c23a30" opacity="0.5" />
        </svg>
      );
    case 'turkic':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-turkic" cx="0.75" cy="0.15" r="0.9">
            <stop offset="0" stopColor="#9fd0ff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#9fd0ff" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-turkic)" />
          <circle cx="80" cy="20" r="9" fill="#dfeeff" opacity="0.55" />
          {/* mountain range */}
          <path d="M0 60 L16 38 L32 58 L50 32 L68 56 L84 40 L100 58 L100 100 L0 100 Z" fill="#0d2438" opacity="0.5" />
          {/* yurts on the steppe */}
          <path d="M22 72 a8 7 0 0 1 16 0 Z" fill="#000" opacity="0.45" />
          <path d="M60 74 a6 5 0 0 1 12 0 Z" fill="#000" opacity="0.45" />
        </svg>
      );
    case 'egypt':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-egypt" cx="0.5" cy="0.18" r="0.9">
            <stop offset="0" stopColor="#ffcf5a" stopOpacity="0.6" />
            <stop offset="1" stopColor="#ffcf5a" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-egypt)" />
          <circle cx="50" cy="24" r="12" fill="#ffe08a" opacity="0.6" />
          {/* pyramids */}
          <path d="M4 72 L30 34 L56 72 Z" fill="#000" opacity="0.5" />
          <path d="M44 72 L68 40 L92 72 Z" fill="#000" opacity="0.4" />
          <path d="M0 70 Q50 62 100 70 L100 100 L0 100 Z" fill="#000" opacity="0.3" />
        </svg>
      );
    case 'rome':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-rome" cx="0.5" cy="0.15" r="0.9">
            <stop offset="0" stopColor="#ff9a8a" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ff9a8a" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-rome)" />
          {/* colosseum arches */}
          <rect x="8" y="34" width="84" height="34" rx="3" fill="#000" opacity="0.4" />
          {[14, 28, 42, 56, 70, 82].map((x) => (
            <rect key={x} x={x} y="40" width="8" height="22" rx="4" fill="#ff9a8a" opacity="0.16" />
          ))}
          {/* foreground columns */}
          {[10, 24, 76, 90].map((x) => (
            <rect key={x} x={x} y="60" width="7" height="40" fill="#000" opacity="0.5" />
          ))}
          <rect x="4" y="56" width="26" height="5" fill="#000" opacity="0.5" />
          <rect x="70" y="56" width="26" height="5" fill="#000" opacity="0.5" />
        </svg>
      );
    case 'medieval':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-med" cx="0.28" cy="0.15" r="0.9">
            <stop offset="0" stopColor="#9fc0ff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#9fc0ff" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-med)" />
          <circle cx="24" cy="22" r="8" fill="#d8e6ff" opacity="0.5" />
          {/* castle with crenellations */}
          <path d="M18 78 L18 44 L24 44 L24 36 L30 36 L30 44 L42 44 L42 30 L48 30 L48 44 L60 44 L60 36 L66 36 L66 44 L72 44 L72 78 Z" fill="#000" opacity="0.5" />
          <path d="M42 78 L42 52 Q48 44 54 52 L54 78 Z" fill="#0a1a2e" opacity="0.6" />
          <path d="M0 76 Q50 70 100 76 L100 100 L0 100 Z" fill="#000" opacity="0.32" />
        </svg>
      );
    case 'ottoman':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-otto" cx="0.5" cy="0.18" r="0.9">
            <stop offset="0" stopColor="#7ce8c8" stopOpacity="0.45" />
            <stop offset="1" stopColor="#7ce8c8" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-otto)" />
          {/* crescent */}
          <path d="M82 20 a9 9 0 1 0 0.1 17 a7 7 0 1 1 -0.1 -17 Z" fill="#eafff7" opacity="0.55" />
          {/* mosque: dome + minarets */}
          <path d="M34 70 a16 16 0 0 1 32 0 Z" fill="#000" opacity="0.5" />
          <rect x="34" y="68" width="32" height="12" fill="#000" opacity="0.5" />
          <circle cx="50" cy="50" r="1.8" fill="#7ce8c8" opacity="0.7" />
          {[24, 76].map((x) => (
            <g key={x}>
              <rect x={x} y="42" width="4" height="38" fill="#000" opacity="0.5" />
              <path d={`M${x - 1} 42 a3 3 0 0 1 6 0 Z`} fill="#000" opacity="0.55" />
            </g>
          ))}
          <path d="M0 78 Q50 72 100 78 L100 100 L0 100 Z" fill="#000" opacity="0.32" />
        </svg>
      );
    case 'renaissance':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-ren" cx="0.5" cy="0.15" r="0.9">
            <stop offset="0" stopColor="#e0b0ff" stopOpacity="0.45" />
            <stop offset="1" stopColor="#e0b0ff" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-ren)" />
          {/* Florence-style dome + towers */}
          <path d="M40 60 a12 11 0 0 1 24 0 Z" fill="#000" opacity="0.45" />
          <rect x="40" y="58" width="24" height="20" fill="#000" opacity="0.45" />
          <rect x="50" y="44" width="4" height="16" fill="#000" opacity="0.45" />
          <rect x="16" y="48" width="10" height="30" fill="#000" opacity="0.5" />
          <rect x="74" y="54" width="10" height="24" fill="#000" opacity="0.5" />
          <path d="M0 78 L100 78 L100 100 L0 100 Z" fill="#000" opacity="0.32" />
        </svg>
      );
    case 'industrial':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-ind" cx="0.5" cy="0.2" r="0.9">
            <stop offset="0" stopColor="#e8b078" stopOpacity="0.4" />
            <stop offset="1" stopColor="#e8b078" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-ind)" />
          {/* smoke */}
          {[24, 60].map((x, i) => (
            <g key={x} opacity="0.22" fill="#c8c8d0">
              <circle cx={x} cy={26 - i * 4} r="7" />
              <circle cx={x + 6} cy={18 - i * 4} r="5" />
            </g>
          ))}
          {/* big faint gear top-right */}
          <g transform="translate(84,26)" opacity="0.16" fill="#e8b078">
            <circle r="14" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <rect key={a} x="-3" y="-18" width="6" height="7" transform={`rotate(${a})`} />
            ))}
          </g>
          {/* factory + chimneys */}
          <rect x="8" y="56" width="84" height="24" fill="#000" opacity="0.5" />
          <rect x="20" y="36" width="9" height="22" fill="#000" opacity="0.55" />
          <rect x="56" y="30" width="9" height="28" fill="#000" opacity="0.55" />
          <path d="M0 78 L100 78 L100 100 L0 100 Z" fill="#000" opacity="0.32" />
        </svg>
      );
    case 'modern':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-mod" cx="0.5" cy="0.12" r="0.9">
            <stop offset="0" stopColor="#8fe8ff" stopOpacity="0.45" />
            <stop offset="1" stopColor="#8fe8ff" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-mod)" />
          {[[6, 52], [16, 36], [26, 60], [38, 28], [50, 48], [60, 38], [72, 58], [82, 32], [92, 50]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="9" height={100 - y} fill="#000" opacity="0.5" />
          ))}
          {[[40, 36], [52, 54], [84, 40], [18, 44]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="2" height="3" fill="#8fe8ff" opacity="0.6" />
          ))}
        </svg>
      );
    case 'space':
      return (
        <svg {...svgProps}>
          <circle cx="74" cy="26" r="15" fill="#3a6fd9" opacity="0.4" />
          <circle cx="68" cy="21" r="15" fill="#0a1440" opacity="0.35" />
          <ellipse cx="74" cy="26" rx="26" ry="6" fill="none" stroke="#a8b8ff" strokeWidth="1.4" opacity="0.3" transform="rotate(-18 74 26)" />
          {[[12, 20], [30, 44], [48, 16], [58, 62], [88, 60], [20, 72], [40, 84], [92, 30], [66, 78]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.3 : 0.8} fill="#fff" opacity="0.6" />
          ))}
        </svg>
      );
    case 'future':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-fut" cx="0.5" cy="0.35" r="0.9">
            <stop offset="0" stopColor="#9a4fff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#9a4fff" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-fut)" />
          <g stroke="#c0a0ff" strokeWidth="0.4" opacity="0.22" fill="none">
            {[0, 1, 2, 3].map((r) =>
              [0, 1, 2, 3, 4, 5].map((c) => (
                <path key={`${r}-${c}`}
                  d="M0 -5 L4.3 -2.5 L4.3 2.5 L0 5 L-4.3 2.5 L-4.3 -2.5 Z"
                  transform={`translate(${8 + c * 17 + (r % 2) * 8.5}, ${16 + r * 14})`} />
              )),
            )}
          </g>
          {[[20, 54], [46, 40], [72, 58]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="8" height={100 - y} fill="#2a0d45" opacity="0.5" />
          ))}
          {[[24, 60], [50, 46], [76, 64]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="1.5" height="26" fill="#c0a0ff" opacity="0.5" />
          ))}
        </svg>
      );
    case 'galactic':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-gal" cx="0.5" cy="0.35" r="0.9">
            <stop offset="0" stopColor="#6a7cff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#0a0c3a" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-gal)" />
          <circle cx="66" cy="34" r="13" fill="#3f4ad8" opacity="0.4" />
          <ellipse cx="66" cy="34" rx="25" ry="6" fill="none" stroke="#b0c0ff" strokeWidth="1.4" opacity="0.35" transform="rotate(-18 66 34)" />
          {[[10, 18], [24, 40], [40, 14], [54, 56], [88, 26], [18, 74], [80, 82], [36, 90], [12, 96], [92, 60]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.4 : 0.8} fill="#fff" opacity="0.55" />
          ))}
        </svg>
      );
    case 'cosmic':
      return (
        <svg {...svgProps}>
          <radialGradient id="bd-cos" cx="0.5" cy="0.32" r="0.7">
            <stop offset="0" stopColor="#ffb43c" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="#9a4fff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#2a0d40" stopOpacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="100" height="100" fill="url(#bd-cos)" />
          <g transform="translate(50,40)" opacity="0.32" stroke="#ffe0a0" fill="none" strokeWidth="1.2">
            <path d="M0 0 Q18 -6 22 12 Q26 30 4 30 Q-18 30 -18 8" />
            <path d="M0 0 Q-18 6 -22 -12 Q-26 -30 -4 -30 Q18 -30 18 -8" />
          </g>
          <circle cx="50" cy="40" r="4" fill="#fff2c0" opacity="0.6" />
          {[[16, 22], [84, 30], [30, 78], [74, 84], [50, 92]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1" fill="#fff" opacity="0.5" />
          ))}
        </svg>
      );
    default:
      return null;
  }
}

export function EraBackdrop({ era }: { era: string }) {
  return (
    <div className="era-backdrop" key={era}>
      <Scene id={era} />
    </div>
  );
}
