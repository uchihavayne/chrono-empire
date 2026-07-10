// Venture art — "clean cartoon vector" style for all 36 ventures.
// Thick dark outlines, bold flat 2-3 tone fills, rounded joints, playful shapes,
// each on a themed rounded badge. Consistent stroke weights for a tidy look.

interface P { size?: number }

const OUT = '#2c2118';    // warm dark outline (organic / historic subjects)
const OUT2 = '#1c2436';   // cool dark outline (metal / sci-fi subjects)

const BADGE: Record<string, [string, string]> = {
  firepit: ['#ffb347', '#e8791f'], huntcamp: ['#83c65f', '#3f7a2b'], mammoth: ['#c79a6a', '#6e4626'], carver: ['#c4bcac', '#79705f'],
  // Mesolithic
  harpoon: ['#7fc7d8', '#2f7a90'], fishtrap: ['#9ad0a8', '#3a8a6a'], dugout: ['#c79a6a', '#7a4a28'], dogpack: ['#d8b483', '#8a5a34'],
  // Neolithic
  wheatfield: ['#f2d06a', '#c99a2a'], pottery: ['#e0975c', '#a8542a'], mudbrick: ['#d0a878', '#8a6238'], gobekli: ['#c4beb0', '#7e766a'],
  // Copper (Chalcolithic)
  coppersmelt: ['#ff9a5c', '#c2521f'], coppertools: ['#e8894a', '#a8541f'], cylseal: ['#d8a86a', '#9a6a2a'], coppermine: ['#e0865a', '#8a4020'],
  // Bronze
  bronzeforge: ['#e0a04a', '#9a5a1a'], ziggurat: ['#d8b06a', '#9a6a2a'], scribe: ['#cbb58a', '#8a744a'], tradeship: ['#7fb4d8', '#2f6a9a'],
  // Iron
  ironbloom: ['#c88a6a', '#8a3a2c'], ironsmith: ['#9aa0ac', '#4a5058'], chariot: ['#b89a6a', '#7a5a2a'], hillfort: ['#a0b088', '#5a6a44'],
  papyrus: ['#ffe08a', '#c99a3e'], nilefarm: ['#7ed99a', '#2f96c9'], pyramid: ['#ffd670', '#e0a021'], pharaoh: ['#ffd884', '#bf8a2a'],
  bazaar: ['#f0b878', '#c47a3a'], legion: ['#ff8574', '#c23a30'], arena: ['#e8c88a', '#b8863c'], baths: ['#7fd4e8', '#3a9fc4'],
  forge: ['#8b93a8', '#4a5266'], mill: ['#aadd6f', '#5a9a3a'], tourney: ['#ff9a8a', '#c24a5a'], alchemy: ['#8ae0a8', '#3a9a6a'],
  atelier: ['#c8a0ff', '#7c5cd6'], press: ['#d8b98a', '#8a6238'], bank: ['#7fd4e8', '#3a7fc4'], opera: ['#ffcf6a', '#c98f2a'],
  steamworks: ['#b08258', '#6e4626'], railway: ['#93a0b8', '#4a5266'], coalmine: ['#9aa0ac', '#565b68'], steel: ['#c08880', '#8a3a2c'],
  technocorp: ['#5bc8ff', '#1a5fd0'], social: ['#4ad2f7', '#1a9fd0'], gamedev: ['#b088ff', '#6a3df5'], satnet: ['#7fb4ff', '#3a6fd9'],
  mooncolony: ['#cfd8e8', '#8a92a8'], marsmine: ['#ff8a5c', '#b3341c'], asteroid: ['#93a0b8', '#4a5266'], shipyard: ['#7fa0e8', '#3a5fc4'],
  aicore: ['#4ad2f7', '#1a5fd0'], quantum: ['#b088ff', '#6a3df5'], dyson: ['#ffd670', '#e0a021'], timeengine: ['#c8b6ff', '#7c5cff'],
  // Turkic (İlk Türkler)
  yurt: ['#e8c887', '#a9702f'], horsefarm: ['#c99a6a', '#7a4a28'], orkhon: ['#b8b0a0', '#6e6456'], khagan: ['#7fb0e0', '#2f5aa0'],
  kimiz: ['#e8e0d0', '#a89a80'], archer: ['#d89a5a', '#8a4a24'], caravan: ['#e8c06a', '#a87428'], kurgan: ['#a0b0c0', '#5a6674'],
  // Ottoman
  grandbazaar: ['#e8b84a', '#a86a1a'], janissary: ['#c85a5a', '#8a2a2a'], mosque: ['#5ac8b0', '#1a7a68'], topkapi: ['#d8a84a', '#9a6420'],
  // Galactic
  starport: ['#8fb4ff', '#2f4fc0'], galfleet: ['#9fa8c0', '#3a4560'], ringworld: ['#7fd0d8', '#2a7a90'], nebula: ['#d88aff', '#7a2fb0'],
  // Cosmic
  wormhole: ['#b088ff', '#4a1f9a'], multiverse: ['#7fd4ff', '#2f6fd0'], singularity: ['#c0a0ff', '#3a1f6a'], godcore: ['#ffe08a', '#d99a20'],
};

/** rich glossy badge + lighting defs, namespaced per id to avoid SVG id collisions */
function IconDefs({ id }: { id: string }) {
  const [c1, c2] = BADGE[id] ?? ['#8b93a8', '#4a5266'];
  const P = `ic-${id}`;
  return (
    <defs>
      {/* diagonal radial base: lighter top-left → richer bottom-right for volume */}
      <radialGradient id={`${P}-bg`} cx="0.34" cy="0.26" r="0.95">
        <stop offset="0" stopColor={c1} />
        <stop offset="0.55" stopColor={c1} />
        <stop offset="1" stopColor={c2} />
      </radialGradient>
      {/* strong glossy top sheen — the upper half catches light like a polished sticker */}
      <linearGradient id={`${P}-gloss`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.6" />
        <stop offset="0.32" stopColor="#ffffff" stopOpacity="0.14" />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="1" stopColor="#000000" stopOpacity="0.14" />
      </linearGradient>
      {/* edge vignette for depth */}
      <radialGradient id={`${P}-vig`} cx="0.5" cy="0.44" r="0.72">
        <stop offset="0.48" stopColor="#000000" stopOpacity="0" />
        <stop offset="1" stopColor="#000000" stopOpacity="0.34" />
      </radialGradient>
      {/* bright specular highlight */}
      <radialGradient id={`${P}-shine`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <clipPath id={`${P}-clip`}>
        <rect x="3" y="3" width="90" height="90" rx="25" />
      </clipPath>
    </defs>
  );
}

export function CartoonIcon({ id, size = 64 }: P & { id: string }) {
  const props = { width: size, height: size, viewBox: '0 0 96 96', xmlns: 'http://www.w3.org/2000/svg' };
  const w = { stroke: OUT, strokeWidth: 3.2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const c = { stroke: OUT2, strokeWidth: 3.2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

  const scene = (() => {
    switch (id) {
      // ─── Era 0: Stone Age (RICH redraw — approve this style to roll out to all 56) ───
      case 'firepit':
        return (<>
          <defs>
            <radialGradient id="fp-glow" cx="0.5" cy="0.6" r="0.55">
              <stop offset="0" stopColor="#ffd36a" stopOpacity="0.9" /><stop offset="1" stopColor="#ff7a1c" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="fp-out" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffb13c" /><stop offset="0.5" stopColor="#ff6a1c" /><stop offset="1" stopColor="#e03a10" />
            </linearGradient>
            <linearGradient id="fp-mid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff0a0" /><stop offset="1" stopColor="#ffb02c" />
            </linearGradient>
            <linearGradient id="fp-log" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9c6a3c" /><stop offset="1" stopColor="#5e3a1e" />
            </linearGradient>
          </defs>
          {/* pit shadow */}
          <ellipse cx="48" cy="78" rx="30" ry="8" fill="#000" opacity="0.28" />
          {/* stone ring */}
          {[[22, 76], [36, 82], [52, 83], [66, 80], [74, 73]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="7" ry="5" fill="#8a8f9c" stroke={OUT} strokeWidth="2.4" />
          ))}
          {/* crossed logs */}
          <g transform="rotate(-18 48 72)">
            <rect x="20" y="68" width="56" height="11" rx="5.5" fill="url(#fp-log)" stroke={OUT} strokeWidth="2.6" />
            <circle cx="24" cy="73.5" r="4" fill="#b98a58" stroke={OUT} strokeWidth="2" /><circle cx="24" cy="73.5" r="1.6" fill="#7c5230" />
          </g>
          <g transform="rotate(20 48 74)">
            <rect x="22" y="72" width="52" height="10" rx="5" fill="url(#fp-log)" stroke={OUT} strokeWidth="2.6" />
            <circle cx="72" cy="77" r="3.6" fill="#b98a58" stroke={OUT} strokeWidth="2" /><circle cx="72" cy="77" r="1.5" fill="#7c5230" />
          </g>
          {/* glow */}
          <ellipse cx="48" cy="50" rx="28" ry="30" fill="url(#fp-glow)" />
          {/* flames */}
          <path d="M48 16 C58 30 72 44 70 60 C68 74 56 80 48 78 C40 80 28 74 26 60 C24 44 38 30 48 16 Z" fill="url(#fp-out)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M48 34 C55 44 63 52 61 62 C59 71 53 74 48 72 C43 74 37 71 35 62 C33 52 41 44 48 34 Z" fill="url(#fp-mid)" />
          <path d="M48 48 C52 55 56 59 55 65 A7 7 0 0 1 41 65 C40 59 44 55 48 48 Z" fill="#fff6d0" />
          {/* embers */}
          <circle cx="30" cy="30" r="1.8" fill="#ffd36a" /><circle cx="66" cy="26" r="1.5" fill="#ff9838" /><circle cx="60" cy="18" r="1.3" fill="#ffd36a" opacity="0.8" />
        </>);
      case 'huntcamp':
        return (<>
          <defs>
            <linearGradient id="hc-hideL" x1="0" y1="0" x2="1" y2="0.4">
              <stop offset="0" stopColor="#d8a670" /><stop offset="1" stopColor="#a9763f" />
            </linearGradient>
            <linearGradient id="hc-hideR" x1="0" y1="0" x2="1" y2="0.4">
              <stop offset="0" stopColor="#b0824c" /><stop offset="1" stopColor="#7c5730" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="79" rx="30" ry="7" fill="#000" opacity="0.26" />
          {/* poles poking out top */}
          <line x1="48" y1="20" x2="38" y2="10" stroke="#6e4626" strokeWidth="3.4" strokeLinecap="round" />
          <line x1="48" y1="20" x2="58" y2="10" stroke="#6e4626" strokeWidth="3.4" strokeLinecap="round" />
          <line x1="48" y1="20" x2="48" y2="8" stroke="#5e3a1e" strokeWidth="3" strokeLinecap="round" />
          {/* teepee hide, two shaded halves */}
          <path d="M48 22 L70 76 L48 76 Z" fill="url(#hc-hideR)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M48 22 L26 76 L48 76 Z" fill="url(#hc-hideL)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* stitching */}
          <path d="M42 40 L54 40 M38 54 L58 54 M34 68 L62 68" stroke="#5e3a1e" strokeWidth="1.8" strokeDasharray="3 3" opacity="0.6" />
          {/* dark door flap */}
          <path d="M48 76 L54 58 Q48 52 42 58 Z" fill="#2e1d10" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" />
          {/* leaning spear */}
          <line x1="74" y1="20" x2="60" y2="78" stroke="#7c5230" strokeWidth="3" strokeLinecap="round" />
          <path d="M74 20 L69 14 L79 15 Z" fill="#c9cdd6" stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
        </>);
      case 'mammoth':
        return (<>
          <defs>
            <linearGradient id="mm-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a06b42" /><stop offset="1" stopColor="#6e4626" />
            </linearGradient>
            <linearGradient id="mm-tusk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fbf3dc" /><stop offset="1" stopColor="#d8c59a" />
            </linearGradient>
          </defs>
          <ellipse cx="46" cy="80" rx="32" ry="6" fill="#000" opacity="0.24" />
          {/* legs */}
          <rect x="26" y="58" width="11" height="20" rx="5" fill="#5e3a1e" stroke={OUT} strokeWidth="2.6" />
          <rect x="50" y="58" width="11" height="20" rx="5" fill="#6e4626" stroke={OUT} strokeWidth="2.6" />
          {/* body (shaggy) */}
          <path d="M18 52 Q16 34 38 32 Q52 30 60 40 Q74 40 76 54 Q78 66 66 66 L26 66 Q16 64 18 52 Z" fill="url(#mm-body)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* fur strokes */}
          <path d="M24 64 L22 70 M32 65 L30 71 M40 65 L38 71 M48 65 L46 71 M56 64 L54 70" stroke="#4c2f18" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
          {/* head + trunk */}
          <circle cx="70" cy="46" r="13" fill="#a06b42" stroke={OUT} strokeWidth="3" />
          <path d="M74 54 C82 60 80 72 70 72" fill="none" stroke="#8a5a34" strokeWidth="6" strokeLinecap="round" />
          <path d="M74 54 C82 60 80 72 70 72" fill="none" stroke={OUT} strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
          {/* tusks */}
          <path d="M64 56 C54 66 40 66 32 58" fill="none" stroke="url(#mm-tusk)" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M64 56 C54 66 40 66 32 58" fill="none" stroke={OUT} strokeWidth="2.4" strokeLinecap="round" opacity="0.4" />
          {/* ear + eye + highlight */}
          <ellipse cx="62" cy="42" rx="5" ry="7" fill="#8a5a34" stroke={OUT} strokeWidth="2.4" />
          <circle cx="73" cy="43" r="2.6" fill={OUT} /><circle cx="74" cy="42" r="0.9" fill="#fff" />
          <path d="M26 40 Q40 34 54 38" stroke="#c69b6a" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" fill="none" />
        </>);
      case 'carver':
        return (<>
          <defs>
            <linearGradient id="cv-stone" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#c2bcae" /><stop offset="1" stopColor="#847c6c" />
            </linearGradient>
          </defs>
          <ellipse cx="42" cy="80" rx="28" ry="6" fill="#000" opacity="0.24" />
          {/* monolith */}
          <path d="M20 76 L22 24 Q24 16 34 16 L50 16 Q58 18 58 28 L58 76 Z" fill="url(#cv-stone)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* carved petroglyphs */}
          <circle cx="34" cy="30" r="4.5" fill="none" stroke="#5c5346" strokeWidth="2.4" />
          <path d="M28 42 L46 42 M28 50 L46 50 M28 58 L40 58" stroke="#5c5346" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M30 66 L36 62 L42 66" fill="none" stroke="#5c5346" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          {/* highlight edge */}
          <path d="M24 26 Q26 20 33 19" stroke="#e6e0d2" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.7" />
          {/* chisel + mallet */}
          <rect x="58" y="30" width="18" height="7" rx="3" fill="#c9a15e" stroke={OUT} strokeWidth="2.4" transform="rotate(42 67 33)" />
          <rect x="60" y="44" width="8" height="20" rx="3" fill="#8a8f9c" stroke={OUT} strokeWidth="2.4" transform="rotate(42 64 54)" />
          {/* chips */}
          <path d="M52 24 l3 -3 l1 3 z" fill="#d8d2c4" stroke={OUT} strokeWidth="1.4" />
          <circle cx="60" cy="20" r="1.6" fill="#cfc9bb" />
          <circle cx="70" cy="24" r="4" fill="#8a6a45" {...w} />
        </>);

      // ─── Mesolithic ───
      case 'harpoon':
        return (<>
          <defs>
            <linearGradient id="ms-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7fd0e8" /><stop offset="1" stopColor="#3a8ab0" />
            </linearGradient>
          </defs>
          {/* water pool */}
          <path d="M10 62 Q28 56 48 60 Q68 64 86 58 L86 84 L10 84 Z" fill="url(#ms-water)" stroke={OUT2} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M18 68 q8 -3 16 0 M52 70 q8 -3 16 0" stroke="#cfeefc" strokeWidth="2" strokeLinecap="round" opacity="0.6" fill="none" />
          {/* harpoon shaft */}
          <line x1="30" y1="14" x2="62" y2="70" stroke="#8a5a34" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="30" y1="14" x2="62" y2="70" stroke="#3e2814" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
          {/* barbed bone tip */}
          <path d="M30 14 L22 8 L34 10 Z" fill="#f0e8d0" stroke={OUT} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M32 20 L24 18 M35 25 L28 24" stroke="#e0d6bc" strokeWidth="2.6" strokeLinecap="round" />
          {/* speared fish */}
          <path d="M52 60 Q62 52 74 58 Q64 64 52 60 Z" fill="#8fd0d8" stroke={OUT2} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M74 58 L82 54 L82 62 Z" fill="#8fd0d8" stroke={OUT2} strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="58" cy="58" r="1.8" fill={OUT2} />
        </>);
      case 'fishtrap':
        return (<>
          <defs>
            <linearGradient id="ms-basket" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d8b877" /><stop offset="1" stopColor="#9a7838" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="28" ry="6" fill="#000" opacity="0.22" />
          {/* woven conical trap */}
          <path d="M22 30 L74 44 L60 74 L34 70 Z" fill="url(#ms-basket)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* weave lines */}
          <g stroke="#7a5a2a" strokeWidth="1.8" opacity="0.7">
            <path d="M26 40 L70 51 M28 50 L66 60 M32 60 L62 68" />
            <path d="M34 32 L44 70 M48 36 L54 72 M60 40 L60 73" />
          </g>
          {/* open mouth */}
          <ellipse cx="24" cy="34" rx="6" ry="9" fill="#3e2c14" stroke={OUT} strokeWidth="2.6" transform="rotate(14 24 34)" />
          {/* trapped fish */}
          <path d="M44 52 Q52 46 62 51 Q54 57 44 52 Z" fill="#8fd0d8" stroke={OUT2} strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="49" cy="51" r="1.4" fill={OUT2} />
        </>);
      case 'dugout':
        return (<>
          <defs>
            <linearGradient id="ms-canoe" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a06b42" /><stop offset="1" stopColor="#6e4626" />
            </linearGradient>
            <linearGradient id="ms-cwater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7fd0e8" /><stop offset="1" stopColor="#3a8ab0" />
            </linearGradient>
          </defs>
          {/* water */}
          <path d="M8 58 Q28 52 48 56 Q68 60 88 54 L88 84 L8 84 Z" fill="url(#ms-cwater)" stroke={OUT2} strokeWidth="2.4" strokeLinejoin="round" />
          {/* paddle */}
          <line x1="66" y1="18" x2="44" y2="58" stroke="#8a5a34" strokeWidth="4" strokeLinecap="round" />
          <path d="M66 18 Q74 22 70 32 Q64 30 62 22 Z" fill="#9c6a3c" stroke={OUT} strokeWidth="2.2" strokeLinejoin="round" />
          {/* hollowed log canoe */}
          <path d="M14 56 Q48 74 82 56 Q80 66 48 70 Q16 66 14 56 Z" fill="url(#ms-canoe)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M22 58 Q48 70 74 58" fill="none" stroke="#3e2814" strokeWidth="2.4" opacity="0.6" />
          {/* wood grain */}
          <path d="M30 60 q18 6 36 0" stroke="#c69b6a" strokeWidth="1.8" opacity="0.5" fill="none" />
        </>);
      case 'dogpack':
        return (<>
          <defs>
            <linearGradient id="ms-dog" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#c79a6a" /><stop offset="1" stopColor="#8a5a34" />
            </linearGradient>
          </defs>
          <ellipse cx="46" cy="80" rx="30" ry="6" fill="#000" opacity="0.22" />
          {/* legs */}
          <path d="M30 62 L28 78 M42 64 L42 80 M56 64 L58 80 M66 60 L70 76" stroke="#5e3a1e" strokeWidth="4.5" strokeLinecap="round" />
          {/* body */}
          <path d="M24 58 Q22 46 36 46 L58 46 Q68 46 68 56 Q68 64 58 64 L32 64 Q24 64 24 58 Z" fill="url(#ms-dog)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* head */}
          <path d="M62 50 Q74 44 82 50 Q84 58 76 60 L64 58 Z" fill="url(#ms-dog)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* ear + snout + eye */}
          <path d="M66 48 L64 38 L72 44 Z" fill="#6e4626" stroke={OUT} strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="80" cy="55" r="2.2" fill={OUT} />
          <circle cx="72" cy="52" r="2" fill={OUT} /><circle cx="72.6" cy="51.4" r="0.7" fill="#fff" />
          {/* tail up */}
          <path d="M24 54 C14 50 12 40 18 36" fill="none" stroke="#6e4626" strokeWidth="4.5" strokeLinecap="round" />
          {/* small pup behind */}
          <path d="M40 60 Q38 52 46 52 Q54 52 54 58 Q54 64 46 64 Q40 64 40 60 Z" fill="#b0824c" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" opacity="0.9" />
        </>);

      // ─── Neolithic ───
      case 'wheatfield':
        return (<>
          <defs>
            <linearGradient id="ne-field" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a8d86a" /><stop offset="1" stopColor="#6a9a3a" />
            </linearGradient>
            <linearGradient id="ne-stalk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffd86a" /><stop offset="1" stopColor="#c99a2a" />
            </linearGradient>
          </defs>
          {/* sun */}
          <circle cx="74" cy="22" r="9" fill="#ffdc5c" stroke="#e0a83c" strokeWidth="2" />
          {/* soil rows */}
          <path d="M10 66 Q48 60 86 66 L86 84 L10 84 Z" fill="url(#ne-field)" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          {/* wheat stalks */}
          {[24, 40, 56, 72].map((x, i) => (
            <g key={i} transform={`translate(${x} 0)`}>
              <line x1="0" y1="66" x2="0" y2="36" stroke="#b8862a" strokeWidth="3" strokeLinecap="round" />
              <path d="M0 36 q-6 -3 -8 4 q6 1 8 -4 M0 42 q-6 -3 -8 4 q6 1 8 -4 M0 36 q6 -3 8 4 q-6 1 -8 -4 M0 42 q6 -3 8 4 q-6 1 -8 -4" fill="url(#ne-stalk)" stroke={OUT} strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M0 30 q-4 -6 0 -12 q4 6 0 12 Z" fill="url(#ne-stalk)" stroke={OUT} strokeWidth="1.8" strokeLinejoin="round" />
            </g>
          ))}
        </>);
      case 'pottery':
        return (<>
          <defs>
            <linearGradient id="ne-pot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e0975c" /><stop offset="1" stopColor="#a8542a" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="26" ry="6" fill="#000" opacity="0.24" />
          {/* clay pot body */}
          <path d="M28 40 Q22 60 30 74 Q48 82 66 74 Q74 60 68 40 Q58 34 48 34 Q38 34 28 40 Z" fill="url(#ne-pot)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* rim */}
          <path d="M34 34 Q48 28 62 34 Q56 42 48 42 Q40 42 34 34 Z" fill="#c47a3a" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          {/* painted bands */}
          <path d="M27 48 Q48 54 69 48" stroke="#5c3418" strokeWidth="3" fill="none" opacity="0.7" />
          <path d="M29 58 L67 58" stroke="#5c3418" strokeWidth="2.2" strokeDasharray="4 4" opacity="0.6" />
          <path d="M31 66 q6 -4 12 0 q6 4 12 0 q4 -3 8 0" stroke="#5c3418" strokeWidth="2" fill="none" opacity="0.6" />
          {/* highlight */}
          <path d="M34 44 Q32 58 38 70" stroke="#ffcfa0" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
        </>);
      case 'mudbrick':
        return (<>
          <defs>
            <linearGradient id="ne-brick" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d8b087" /><stop offset="1" stopColor="#9a6f42" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="30" ry="6" fill="#000" opacity="0.22" />
          {/* mudbrick house */}
          <path d="M22 74 L22 44 L48 26 L74 44 L74 74 Z" fill="url(#ne-brick)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* flat roof line */}
          <path d="M22 44 L48 26 L74 44" fill="none" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* brick courses */}
          <g stroke="#6e4a26" strokeWidth="1.8" opacity="0.55">
            <path d="M22 54 H74 M22 64 H74" />
            <path d="M34 44 V54 M46 44 V54 M58 44 V54 M28 54 V64 M40 54 V64 M52 54 V64 M64 54 V64 M34 64 V74 M46 64 V74 M58 64 V74" />
          </g>
          {/* door */}
          <path d="M42 74 L42 58 Q48 54 54 58 L54 74 Z" fill="#5c3a1e" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" />
          {/* roof beams poking */}
          <path d="M26 44 L24 40 M36 38 L34 34 M60 38 L62 34 M70 44 L72 40" stroke="#6e4626" strokeWidth="2.6" strokeLinecap="round" />
        </>);
      case 'gobekli':
        return (<>
          <defs>
            <linearGradient id="ne-pillar" x1="0" y1="0" x2="1" y2="0.2">
              <stop offset="0" stopColor="#cfc8b8" /><stop offset="1" stopColor="#948b78" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="34" ry="5" fill="#000" opacity="0.22" />
          {/* back pillars */}
          <path d="M20 78 L21 40 L30 36 L31 78 Z" fill="#b7b0a0" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" opacity="0.85" />
          <path d="M66 78 L67 40 L76 36 L75 78 Z" fill="#b7b0a0" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" opacity="0.85" />
          {/* central T-pillar */}
          <path d="M38 78 L39 30 L57 30 L58 78 Z" fill="url(#ne-pillar)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M32 22 L64 22 L62 32 L34 32 Z" fill="url(#ne-pillar)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* carved animal relief */}
          <path d="M44 42 Q52 40 54 48 Q54 56 46 56 Q42 52 44 42 Z" fill="none" stroke="#5c5346" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M46 46 L44 62 M52 48 L54 62" stroke="#5c5346" strokeWidth="2.2" strokeLinecap="round" />
          {/* highlight edge */}
          <path d="M40 30 L41 24" stroke="#e6e0d2" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </>);

      // ─── Copper (Chalcolithic) ───
      case 'coppersmelt':
        return (<>
          <defs>
            <radialGradient id="cu-glow" cx="0.5" cy="0.7" r="0.6">
              <stop offset="0" stopColor="#ffd36a" stopOpacity="0.9" /><stop offset="1" stopColor="#ff7a1c" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="cu-furn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#b07a4a" /><stop offset="1" stopColor="#6e4626" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="28" ry="6" fill="#000" opacity="0.24" />
          {/* clay furnace */}
          <path d="M26 76 Q22 46 34 34 Q48 26 62 34 Q74 46 70 76 Z" fill="url(#cu-furn)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* glow */}
          <ellipse cx="48" cy="60" rx="20" ry="18" fill="url(#cu-glow)" />
          {/* molten opening */}
          <path d="M36 62 Q48 54 60 62 Q56 74 48 74 Q40 74 36 62 Z" fill="#ff9838" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M40 64 Q48 60 56 64 Q52 70 48 70 Q44 70 40 64 Z" fill="#ffe04a" />
          {/* copper pour */}
          <path d="M48 74 Q50 80 46 84" stroke="#ff8a3c" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* chimney flame */}
          <path d="M48 34 C54 26 56 20 48 12 C42 20 44 26 48 34 Z" fill="#ff7a1c" stroke={OUT} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M48 30 C51 25 52 22 48 17 C45 22 46 25 48 30 Z" fill="#ffd24a" />
        </>);
      case 'coppertools':
        return (<>
          <defs>
            <linearGradient id="cu-metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff9a5c" /><stop offset="1" stopColor="#c2521f" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="26" ry="5" fill="#000" opacity="0.2" />
          {/* copper axe head */}
          <path d="M42 20 L64 26 Q72 30 66 40 Q56 44 46 40 L40 32 Z" fill="url(#cu-metal)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M46 24 L62 29" stroke="#ffd0a8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          {/* haft */}
          <line x1="40" y1="30" x2="30" y2="74" stroke="#8a5a34" strokeWidth="5" strokeLinecap="round" />
          <line x1="40" y1="30" x2="30" y2="74" stroke="#3e2814" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
          {/* lashing */}
          <path d="M38 34 l4 4 M37 40 l5 4 M36 46 l5 4" stroke="#c9a15e" strokeWidth="2.4" strokeLinecap="round" />
          {/* copper chisel */}
          <rect x="58" y="52" width="7" height="26" rx="3" fill="url(#cu-metal)" stroke={OUT} strokeWidth="2.6" transform="rotate(-16 61 65)" />
          <path d="M54 74 l5 6 l4 -5 z" fill="#e8894a" stroke={OUT} strokeWidth="2" transform="rotate(-16 58 76)" />
        </>);
      case 'cylseal':
        return (<>
          <defs>
            <linearGradient id="cu-seal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e0b47a" /><stop offset="1" stopColor="#9a6a2a" />
            </linearGradient>
            <linearGradient id="cu-clay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d8b087" /><stop offset="1" stopColor="#a8804a" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="28" ry="5" fill="#000" opacity="0.2" />
          {/* clay tablet */}
          <rect x="16" y="56" width="64" height="22" rx="5" fill="url(#cu-clay)" stroke={OUT} strokeWidth="3" />
          {/* rolled impression marks */}
          <g stroke="#7a5a2a" strokeWidth="2" strokeLinecap="round" opacity="0.7">
            <path d="M22 62 l4 4 l-4 4 M30 62 l4 4 l-4 4 M40 62 v10 M48 62 l4 5 l-4 5 M58 62 v10 M66 62 l4 4 l-4 4" />
          </g>
          {/* cylinder seal */}
          <rect x="34" y="24" width="28" height="16" rx="8" fill="url(#cu-seal)" stroke={OUT} strokeWidth="3" />
          <line x1="48" y1="24" x2="48" y2="40" stroke="#6e4a1a" strokeWidth="2" opacity="0.5" />
          {/* carved figures on seal */}
          <path d="M40 30 l0 5 M44 29 l0 6 M52 29 l0 6 M56 30 l0 5" stroke="#6e4a1a" strokeWidth="1.8" strokeLinecap="round" />
          {/* string hole highlight */}
          <circle cx="41" cy="32" r="2" fill="#f0d8a8" stroke={OUT} strokeWidth="1.4" />
        </>);
      case 'coppermine':
        return (<>
          <defs>
            <linearGradient id="cu-rock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8a7a68" /><stop offset="1" stopColor="#4e4438" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="30" ry="5" fill="#000" opacity="0.22" />
          {/* mountain / rock face */}
          <path d="M12 78 L28 40 L44 60 L58 30 L84 78 Z" fill="url(#cu-rock)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* copper ore veins */}
          <path d="M30 56 q6 4 4 10 M52 46 q-4 6 2 10 M64 58 q4 4 2 8" stroke="#ff8a3c" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="34" cy="66" r="2.4" fill="#ffb060" stroke={OUT} strokeWidth="1.4" />
          <circle cx="60" cy="60" r="2.2" fill="#ff9a4c" stroke={OUT} strokeWidth="1.4" />
          {/* mine tunnel */}
          <path d="M40 78 L40 64 Q48 58 56 64 L56 78 Z" fill="#241a10" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          {/* support beams */}
          <path d="M40 64 L40 78 M56 64 L56 78 M40 64 L56 64" stroke="#8a5a34" strokeWidth="2.6" />
          {/* pickaxe */}
          <line x1="66" y1="40" x2="74" y2="58" stroke="#8a5a34" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M60 40 Q66 34 74 38" fill="none" stroke="#c0c4cc" strokeWidth="4" strokeLinecap="round" />
        </>);

      // ─── Bronze ───
      case 'bronzeforge':
        return (<>
          <defs>
            <radialGradient id="bz-glow" cx="0.5" cy="0.6" r="0.6">
              <stop offset="0" stopColor="#ffd36a" stopOpacity="0.85" /><stop offset="1" stopColor="#ff7a1c" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bz-anvil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9aa0ac" /><stop offset="1" stopColor="#4e5560" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="30" ry="6" fill="#000" opacity="0.24" />
          {/* glow */}
          <ellipse cx="40" cy="40" rx="20" ry="16" fill="url(#bz-glow)" />
          {/* anvil */}
          <path d="M22 62 L64 62 L58 70 L28 70 Z" fill="url(#bz-anvil)" stroke={OUT2} strokeWidth="3" strokeLinejoin="round" />
          <rect x="34" y="70" width="16" height="10" rx="2" fill="#4e5560" stroke={OUT2} strokeWidth="2.6" />
          <path d="M64 62 L74 58 L72 66 Z" fill="#8a90a0" stroke={OUT2} strokeWidth="2.4" strokeLinejoin="round" />
          {/* glowing bronze bar on anvil */}
          <rect x="30" y="56" width="22" height="6" rx="3" fill="#ff9838" stroke={OUT} strokeWidth="2.2" />
          <rect x="34" y="57" width="12" height="2.4" rx="1.2" fill="#ffe04a" />
          {/* hammer mid-swing */}
          <line x1="62" y1="24" x2="46" y2="52" stroke="#8a5a34" strokeWidth="4" strokeLinecap="round" />
          <rect x="56" y="16" width="18" height="12" rx="3" fill="#c8a04a" stroke={OUT} strokeWidth="2.6" transform="rotate(28 65 22)" />
          {/* sparks */}
          <circle cx="40" cy="52" r="1.8" fill="#ffd36a" /><circle cx="34" cy="48" r="1.4" fill="#ff9838" /><circle cx="46" cy="46" r="1.3" fill="#ffe04a" />
        </>);
      case 'ziggurat':
        return (<>
          <defs>
            <linearGradient id="bz-zig" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e0c088" /><stop offset="1" stopColor="#a87a3a" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="34" ry="5" fill="#000" opacity="0.22" />
          {/* stepped tiers */}
          <path d="M14 78 L18 66 L78 66 L82 78 Z" fill="url(#bz-zig)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M24 66 L28 54 L68 54 L72 66 Z" fill="#d8b478" stroke={OUT} strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M32 54 L36 42 L60 42 L64 54 Z" fill="#e0c088" stroke={OUT} strokeWidth="2.8" strokeLinejoin="round" />
          {/* shrine top */}
          <rect x="42" y="30" width="12" height="12" rx="1.5" fill="#c99a4a" stroke={OUT} strokeWidth="2.6" />
          {/* central grand stairway */}
          <path d="M46 78 L46 30 L50 30 L50 78 Z" fill="#a87a3a" stroke={OUT} strokeWidth="2.2" opacity="0.9" />
          <g stroke="#7a5424" strokeWidth="1.6" opacity="0.6"><path d="M46 40 H50 M46 48 H50 M46 56 H50 M46 64 H50 M46 72 H50" /></g>
          {/* sun disc */}
          <circle cx="48" cy="22" r="6" fill="#ffdc5c" stroke="#e0a83c" strokeWidth="2" />
        </>);
      case 'scribe':
        return (<>
          <defs>
            <linearGradient id="bz-tab" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#dcc79a" /><stop offset="1" stopColor="#a8905e" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="26" ry="5" fill="#000" opacity="0.2" />
          {/* clay tablet */}
          <path d="M24 26 Q24 20 32 20 L64 20 Q72 20 72 28 L72 74 Q72 80 64 80 L32 80 Q24 80 24 72 Z" fill="url(#bz-tab)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* cuneiform wedges */}
          <g stroke="#5c4a2a" strokeWidth="2" strokeLinecap="round" opacity="0.75">
            <path d="M32 32 l5 3 l-5 3 M42 32 v6 M50 32 l5 3 l-5 3 M60 32 v6" />
            <path d="M32 46 v6 M40 46 l5 3 l-5 3 M52 46 v6 M60 46 l5 3 l-5 3" />
            <path d="M32 60 l5 3 l-5 3 M44 60 v6 M52 60 l5 3 l-5 3 M62 60 v6" />
          </g>
          {/* reed stylus */}
          <line x1="60" y1="70" x2="82" y2="46" stroke="#c9a15e" strokeWidth="4" strokeLinecap="round" />
          <path d="M60 70 l-5 8 l8 -3 z" fill="#8a5a34" stroke={OUT} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M82 46 l3 -4 l1 4 z" fill="#e0d0a0" stroke={OUT} strokeWidth="1.4" />
        </>);
      case 'tradeship':
        return (<>
          <defs>
            <linearGradient id="bz-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7fc7e0" /><stop offset="1" stopColor="#3a7fb0" />
            </linearGradient>
            <linearGradient id="bz-hull" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a06b42" /><stop offset="1" stopColor="#6e4626" />
            </linearGradient>
          </defs>
          {/* water */}
          <path d="M8 64 Q28 58 48 62 Q68 66 88 60 L88 84 L8 84 Z" fill="url(#bz-water)" stroke={OUT2} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M16 72 q8 -3 16 0 M54 74 q8 -3 16 0" stroke="#cfeefc" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" fill="none" />
          {/* mast + sail */}
          <line x1="48" y1="16" x2="48" y2="60" stroke="#6e4626" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M48 20 Q72 26 70 48 L48 44 Z" fill="#e8ddc4" stroke={OUT} strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M48 20 Q26 26 28 48 L48 44 Z" fill="#d8caa8" stroke={OUT} strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M40 30 H56 M38 38 H58" stroke="#b8a074" strokeWidth="1.8" opacity="0.6" />
          {/* hull */}
          <path d="M18 60 L78 60 Q72 76 48 76 Q24 76 18 60 Z" fill="url(#bz-hull)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M24 63 H72" stroke="#3e2814" strokeWidth="2" opacity="0.5" />
          {/* amphora cargo */}
          <path d="M34 54 q-2 6 2 6 q4 0 2 -6 Z" fill="#c47a3a" stroke={OUT} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M58 54 q-2 6 2 6 q4 0 2 -6 Z" fill="#c47a3a" stroke={OUT} strokeWidth="1.8" strokeLinejoin="round" />
        </>);

      // ─── Iron ───
      case 'ironbloom':
        return (<>
          <defs>
            <radialGradient id="ir-glow" cx="0.5" cy="0.55" r="0.6">
              <stop offset="0" stopColor="#ffd36a" stopOpacity="0.85" /><stop offset="1" stopColor="#ff5a1c" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ir-furn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8a6a4a" /><stop offset="1" stopColor="#4e3626" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="28" ry="6" fill="#000" opacity="0.26" />
          {/* tall bloomery furnace */}
          <path d="M32 78 L30 40 Q30 24 48 24 Q66 24 66 40 L64 78 Z" fill="url(#ir-furn)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* clay banding */}
          <path d="M31 52 H65 M31 64 H65" stroke="#6e4a2e" strokeWidth="2" opacity="0.55" />
          {/* glow at base tap */}
          <ellipse cx="48" cy="66" rx="14" ry="12" fill="url(#ir-glow)" />
          <path d="M40 66 Q48 58 56 66 Q52 76 48 76 Q44 76 40 66 Z" fill="#ff7a2c" stroke={OUT} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M43 67 Q48 63 53 67 Q50 72 48 72 Q46 72 43 67 Z" fill="#ffd24a" />
          {/* iron bloom lump beside */}
          <path d="M18 68 q-4 8 4 10 q8 0 6 -8 q-4 -6 -10 -2 Z" fill="#6a5040" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="22" cy="72" r="1.6" fill="#ff9a4c" /><circle cx="26" cy="74" r="1.2" fill="#ffb060" />
          {/* top flame */}
          <path d="M48 24 C53 17 54 12 48 6 C42 12 43 17 48 24 Z" fill="#ff6a1c" stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
        </>);
      case 'ironsmith':
        return (<>
          <defs>
            <linearGradient id="ir-blade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e8ecf5" /><stop offset="1" stopColor="#9aa0ac" />
            </linearGradient>
            <linearGradient id="ir-anv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8a90a0" /><stop offset="1" stopColor="#454b56" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="28" ry="5" fill="#000" opacity="0.24" />
          {/* anvil */}
          <path d="M22 66 L60 66 L54 72 L28 72 Z" fill="url(#ir-anv)" stroke={OUT2} strokeWidth="3" strokeLinejoin="round" />
          <rect x="32" y="72" width="14" height="10" rx="2" fill="#454b56" stroke={OUT2} strokeWidth="2.4" />
          <path d="M60 66 L70 63 L68 70 Z" fill="#7a8090" stroke={OUT2} strokeWidth="2.2" strokeLinejoin="round" />
          {/* forged iron sword */}
          <path d="M40 62 L46 14 L52 62 Z" fill="url(#ir-blade)" stroke={OUT2} strokeWidth="2.8" strokeLinejoin="round" />
          <line x1="46" y1="20" x2="46" y2="58" stroke="#b8c0cc" strokeWidth="1.6" opacity="0.7" />
          <rect x="38" y="60" width="16" height="5" rx="2" fill="#c8a04a" stroke={OUT} strokeWidth="2.2" />
          <rect x="44" y="63" width="4" height="10" rx="2" fill="#8a5a34" stroke={OUT} strokeWidth="2" />
          {/* spark */}
          <circle cx="34" cy="60" r="1.8" fill="#ffd36a" /><circle cx="58" cy="58" r="1.4" fill="#ff9838" />
        </>);
      case 'chariot':
        return (<>
          <defs>
            <linearGradient id="ir-car" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#c8a04a" /><stop offset="1" stopColor="#8a5a1a" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="34" ry="5" fill="#000" opacity="0.2" />
          {/* wheel */}
          <circle cx="34" cy="62" r="16" fill="none" stroke="#5e3a1e" strokeWidth="5" />
          <circle cx="34" cy="62" r="16" fill="none" stroke="#8a5a34" strokeWidth="2" />
          <circle cx="34" cy="62" r="3.5" fill="#8a5a34" stroke={OUT} strokeWidth="2" />
          {[0, 45, 90, 135].map((a) => (
            <line key={a} x1="34" y1="48" x2="34" y2="76" stroke="#6e4626" strokeWidth="2.6" transform={`rotate(${a} 34 62)`} />
          ))}
          {/* chariot car */}
          <path d="M30 48 L64 48 Q70 48 70 56 L70 62 L34 62 Z" fill="url(#ir-car)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M40 52 H66 M40 57 H68" stroke="#6e4a1a" strokeWidth="1.8" opacity="0.5" />
          {/* draft pole */}
          <line x1="66" y1="58" x2="90" y2="50" stroke="#6e4626" strokeWidth="3.4" strokeLinecap="round" />
          {/* horse silhouette hint */}
          <path d="M76 50 Q82 38 90 40 Q86 46 84 52 Z" fill="#8a5a34" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" />
        </>);
      case 'hillfort':
        return (<>
          <defs>
            <linearGradient id="ir-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9aa07e" /><stop offset="1" stopColor="#5a6044" />
            </linearGradient>
            <linearGradient id="ir-hill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8aa860" /><stop offset="1" stopColor="#5a7a38" />
            </linearGradient>
          </defs>
          {/* hill mound */}
          <path d="M8 82 Q48 58 88 82 Z" fill="url(#ir-hill)" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          {/* timber palisade wall */}
          <path d="M22 70 L22 50 L74 50 L74 70" fill="url(#ir-wall)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* pointed log tops */}
          <path d="M22 50 l4 -6 l4 6 M34 50 l4 -6 l4 6 M46 50 l4 -6 l4 6 M58 50 l4 -6 l4 6 M70 50 l4 -6 l4 6" fill="#6e5a34" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" />
          {/* gate tower */}
          <rect x="40" y="38" width="16" height="32" rx="1.5" fill="#7a6a44" stroke={OUT} strokeWidth="3" />
          <path d="M40 38 l8 -8 l8 8 Z" fill="#6e5a34" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          {/* gate */}
          <path d="M44 70 L44 58 Q48 54 52 58 L52 70 Z" fill="#3e2c14" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" />
          {/* banner */}
          <line x1="48" y1="30" x2="48" y2="20" stroke="#5e3a1e" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M48 21 L60 24 L48 28 Z" fill="#c23a30" stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
        </>);

      // ─── Era 1: Egypt — RICH redraw ───
      case 'papyrus':
        return (<>
          <defs>
            <linearGradient id="eg-scroll" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#f6e6b4" /><stop offset="1" stopColor="#e2cd90" />
            </linearGradient>
          </defs>
          <ellipse cx="42" cy="82" rx="26" ry="4" fill="#000" opacity="0.2" />
          {/* rolled ends */}
          <rect x="16" y="20" width="52" height="9" rx="4.5" fill="#c39a52" stroke={OUT} strokeWidth="2.6" />
          <rect x="16" y="70" width="52" height="9" rx="4.5" fill="#c39a52" stroke={OUT} strokeWidth="2.6" />
          {/* sheet */}
          <rect x="22" y="28" width="40" height="43" fill="url(#eg-scroll)" stroke={OUT} strokeWidth="2.8" />
          {/* hieroglyph rows */}
          <g stroke="#7c5a2a" strokeWidth="2.2" strokeLinecap="round">
            <path d="M28 36 h6 M38 36 v5 M44 34 a2 2 0 0 1 0 4 M50 36 l3 3 M56 35 v5" />
            <path d="M28 46 a2.5 2 0 0 1 5 0 M38 44 v5 M42 49 h6 M52 44 l3 4" />
            <path d="M28 56 h5 M36 54 v5 M42 56 a2 2 0 0 1 0 3 M48 54 l4 4 M56 56 v3" />
          </g>
          {/* eye of horus hint */}
          <path d="M27 64 q4 -3 8 0 q-4 3 -8 0 Z" fill="#c85a3a" opacity="0.7" />
          <circle cx="70" cy="24" r="6" fill="#ffe08a" opacity="0.85" />
        </>);
      case 'nilefarm':
        return (<>
          <defs>
            <linearGradient id="eg-nile" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5cc0e8" /><stop offset="1" stopColor="#2f7fbf" />
            </linearGradient>
          </defs>
          <circle cx="76" cy="20" r="7" fill="#ffe08a" opacity="0.85" />
          {/* soil bank */}
          <path d="M12 58 Q48 52 84 58 L84 66 L12 66 Z" fill="#8a5a34" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" />
          {/* wheat stalks */}
          {[24, 38, 52, 66].map((x, i) => (<g key={x}>
            <path d={`M${x} 58 Q${x - 2} 40 ${x} 26`} fill="none" stroke="#5a9a2a" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx={x} cy="22" rx="5" ry="10" fill="#e8c93c" stroke={OUT} strokeWidth="2.4" />
            <path d={`M${x} 18 v-4`} stroke="#c9a52a" strokeWidth="2" strokeLinecap="round" />
            {void i}
          </g>))}
          {/* Nile water with ripples */}
          <path d="M12 66 L84 66 L84 82 L12 82 Z" fill="url(#eg-nile)" stroke={OUT} strokeWidth="2.4" />
          <path d="M18 72 q6 -3 12 0 t12 0 t12 0 t12 0" fill="none" stroke="#bfeaf8" strokeWidth="1.8" opacity="0.7" />
        </>);
      case 'pyramid':
        return (<>
          <defs>
            <linearGradient id="eg-pyL" x1="0" y1="0" x2="1" y2="0.6">
              <stop offset="0" stopColor="#f7d98c" /><stop offset="1" stopColor="#e0b45a" />
            </linearGradient>
            <linearGradient id="eg-pyR" x1="0" y1="0" x2="1" y2="0.6">
              <stop offset="0" stopColor="#c8944a" /><stop offset="1" stopColor="#a06e2e" />
            </linearGradient>
            <radialGradient id="eg-sun" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff6cc" /><stop offset="1" stopColor="#ffd75e" />
            </radialGradient>
          </defs>
          <circle cx="72" cy="24" r="11" fill="url(#eg-sun)" />
          <ellipse cx="48" cy="80" rx="38" ry="6" fill="#000" opacity="0.2" />
          {/* dunes */}
          <path d="M10 78 Q30 70 50 76 Q68 80 86 74 L86 82 L10 82 Z" fill="#d9a860" stroke={OUT} strokeWidth="2.2" strokeLinejoin="round" opacity="0.9" />
          {/* small back pyramid */}
          <path d="M58 78 L76 46 L92 78 Z" fill="#b07e3a" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" opacity="0.85" />
          {/* main pyramid */}
          <path d="M46 16 L82 78 L46 78 Z" fill="url(#eg-pyR)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M46 16 L10 78 L46 78 Z" fill="url(#eg-pyL)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* block seams */}
          <path d="M28 58 L64 58 M22 68 L70 68" stroke="#a07830" strokeWidth="1.6" opacity="0.55" />
          {/* golden capstone */}
          <path d="M46 16 L54 30 L38 30 Z" fill="#ffe89a" stroke={OUT} strokeWidth="2.2" strokeLinejoin="round" />
        </>);
      case 'pharaoh':
        return (<>
          <defs>
            <linearGradient id="eg-mask" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4cf52" /><stop offset="1" stopColor="#c8941f" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="24" ry="4" fill="#000" opacity="0.2" />
          {/* nemes headdress back */}
          <path d="M24 26 Q48 12 72 26 L74 50 L22 50 Z" fill="url(#eg-mask)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* blue stripes */}
          <path d="M28 30 L26 50 M36 27 L35 50 M60 27 L61 50 M68 30 L70 50" stroke="#2f66c8" strokeWidth="3" strokeLinecap="round" />
          {/* face */}
          <path d="M32 44 L64 44 L62 66 Q48 78 34 66 Z" fill="#e0a94a" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* eyes with kohl */}
          <path d="M37 52 h7 M40 52 l4 0" stroke={OUT} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M52 52 h7 M52 52 l4 0" stroke={OUT} strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="40" cy="53" r="1.8" fill={OUT} /><circle cx="56" cy="53" r="1.8" fill={OUT} />
          {/* mouth + beard */}
          <path d="M43 62 q5 3 10 0" fill="none" stroke={OUT} strokeWidth="2.4" strokeLinecap="round" />
          <rect x="45" y="66" width="6" height="12" rx="2" fill="#2f66c8" stroke={OUT} strokeWidth="2.2" />
          {/* uraeus cobra + sun */}
          <circle cx="48" cy="24" r="4.5" fill="#4a8ae0" stroke={OUT} strokeWidth="2.2" />
          <path d="M48 20 q-3 -4 0 -7" fill="none" stroke="#d94040" strokeWidth="2.4" strokeLinecap="round" />
        </>);

      // ─── Era 2: Rome — RICH redraw ───
      case 'bazaar':
        return (<>
          <defs>
            <linearGradient id="rm-stall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e8d6b0" /><stop offset="1" stopColor="#c2a878" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="32" ry="5" fill="#000" opacity="0.2" />
          {/* stall body */}
          <rect x="20" y="40" width="56" height="38" rx="3" fill="url(#rm-stall)" stroke={OUT} strokeWidth="2.8" />
          {/* awning roof */}
          <path d="M14 40 L82 40 L74 24 L22 24 Z" fill="#d94a3a" stroke={OUT} strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M14 40 Q21 48 28 40 Q35 48 42 40 Q49 48 56 40 Q63 48 70 40 Q76 46 82 40" fill="#f2ead6" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" />
          {/* awning stripes */}
          <path d="M32 24 L28 40 M46 24 L46 40 M60 24 L64 40" stroke="#f2c9b0" strokeWidth="2" opacity="0.6" />
          {/* goods: amphora + fruit + coins */}
          <path d="M30 74 L30 58 Q34 52 38 58 L38 74 Z" fill="#8a5a34" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="52" cy="62" r="5" fill="#c23a30" stroke={OUT} strokeWidth="2.2" />
          <circle cx="62" cy="64" r="5" fill="#5a9a2a" stroke={OUT} strokeWidth="2.2" />
          <circle cx="57" cy="70" r="4" fill="#ffcf3c" stroke={OUT} strokeWidth="2" />
        </>);
      case 'legion':
        return (<>
          <defs>
            <linearGradient id="rm-helm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d8dde8" /><stop offset="1" stopColor="#8a92a6" />
            </linearGradient>
            <linearGradient id="rm-shield" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e2483c" /><stop offset="1" stopColor="#a8281e" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="26" ry="5" fill="#000" opacity="0.2" />
          {/* shield behind */}
          <rect x="30" y="34" width="36" height="44" rx="8" fill="url(#rm-shield)" stroke={OUT} strokeWidth="3" />
          <path d="M48 42 L48 70 M38 56 L58 56" stroke="#ffd24a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="48" cy="56" r="4" fill="#ffd24a" stroke={OUT} strokeWidth="1.8" />
          {/* galea helmet */}
          <path d="M30 30 A18 16 0 0 1 66 30 L66 40 L60 40 L60 34 L36 34 L36 40 L30 40 Z" fill="url(#rm-helm)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* red crest */}
          <path d="M40 14 Q48 8 56 14 L54 30 L42 30 Z" fill="#e24438" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M44 14 L44 30 M48 12 L48 30 M52 14 L52 30" stroke="#a8281e" strokeWidth="1.6" opacity="0.6" />
          {/* cheek guards */}
          <path d="M36 40 L38 48 M60 40 L58 48" stroke={OUT} strokeWidth="2.6" strokeLinecap="round" />
        </>);
      case 'arena':
        return (<>
          <defs>
            <linearGradient id="rm-arena" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ecd7a2" /><stop offset="1" stopColor="#bfa068" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="34" ry="5" fill="#000" opacity="0.2" />
          {/* colosseum oval body */}
          <path d="M12 54 C12 36 28 26 48 26 C68 26 84 36 84 54 L84 74 Q48 82 12 74 Z" fill="url(#rm-arena)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* two arch rows */}
          {[20, 32, 44, 56, 68].map((x) => (<rect key={`a${x}`} x={x - 3} y="40" width="7" height="12" rx="3.5" fill="#6e5a35" />))}
          {[18, 30, 42, 54, 66, 74].map((x) => (<rect key={`b${x}`} x={x - 2.5} y="56" width="6" height="11" rx="3" fill="#5a4a2e" />))}
          <path d="M12 54 H84 M14 70 H82" stroke="#8a7248" strokeWidth="2" opacity="0.6" />
          {/* broken top-right edge */}
          <path d="M84 40 L80 30 L74 34" fill="none" stroke={OUT} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 30 Q30 24 42 27" stroke="#f4e6c2" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.6" />
        </>);
      case 'baths':
        return (<>
          <defs>
            <radialGradient id="rm-water" cx="0.5" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#8fe0f2" /><stop offset="1" stopColor="#37a8cc" />
            </radialGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="30" ry="4" fill="#000" opacity="0.18" />
          {/* pillars behind */}
          {[22, 74].map((x) => (<g key={x}>
            <rect x={x - 4} y="26" width="9" height="40" rx="2" fill="#e6ddc8" stroke={OUT} strokeWidth="2.4" />
            <rect x={x - 6} y="22" width="13" height="5" rx="2" fill="#d0c6ad" stroke={OUT} strokeWidth="2" />
          </g>))}
          {/* pool basin */}
          <path d="M14 46 L82 46 L76 74 Q48 82 20 74 Z" fill="#e6ddc8" stroke={OUT} strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M20 50 L76 50 C76 64 64 72 48 72 C32 72 20 64 20 50 Z" fill="url(#rm-water)" stroke={OUT} strokeWidth="2.4" />
          {/* steam wisps */}
          <path d="M34 40 Q30 34 34 28 M48 42 Q44 36 48 30 M62 40 Q58 34 62 28" fill="none" stroke="#dff2f8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          {/* ripples */}
          <path d="M30 58 q9 -3 18 0 t18 0" fill="none" stroke="#dff6fb" strokeWidth="1.8" opacity="0.8" />
          <path d="M34 64 q7 -2 14 0 t14 0" fill="none" stroke="#dff6fb" strokeWidth="1.6" opacity="0.6" />
        </>);

      // ─── Era 3: Medieval — RICH redraw ───
      case 'forge':
        return (<>
          <defs>
            <linearGradient id="md-anvil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6a7284" /><stop offset="1" stopColor="#3a4050" />
            </linearGradient>
            <radialGradient id="md-heat" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff2a0" /><stop offset="1" stopColor="#ff7a1c" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="28" ry="4" fill="#000" opacity="0.2" />
          {/* heat glow */}
          <circle cx="48" cy="46" r="16" fill="url(#md-heat)" />
          {/* anvil */}
          <path d="M20 54 L76 54 L76 62 C62 64 56 70 56 76 L64 84 L32 84 L40 76 C40 69 30 64 20 62 Z" fill="url(#md-anvil)" stroke={OUT2} strokeWidth="3" strokeLinejoin="round" />
          <rect x="34" y="82" width="28" height="6" rx="2" fill="#5e3a1e" stroke={OUT} strokeWidth="2.2" />
          {/* glowing hot blade on anvil */}
          <path d="M40 50 L58 50 L54 56 L44 56 Z" fill="#ff7a1c" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M44 44 L54 44 L52 50 L46 50 Z" fill="#ffe04a" />
          {/* hammer striking */}
          <g transform="rotate(-32 66 26)">
            <rect x="54" y="10" width="22" height="14" rx="4" fill="#8a92a6" stroke={OUT2} strokeWidth="2.8" />
            <rect x="54" y="10" width="22" height="5" rx="2.5" fill="#c2c9d8" />
            <rect x="62" y="22" width="7" height="24" rx="3.5" fill="#8a5a34" stroke={OUT} strokeWidth="2.4" />
          </g>
          {/* sparks */}
          <circle cx="30" cy="38" r="2.4" fill="#ffd24a" /><circle cx="66" cy="46" r="2" fill="#ff9838" /><circle cx="24" cy="48" r="1.6" fill="#ffd24a" />
        </>);
      case 'mill':
        return (<>
          <defs>
            <linearGradient id="md-mill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#c89a62" /><stop offset="1" stopColor="#8a5f34" />
            </linearGradient>
          </defs>
          <ellipse cx="46" cy="82" rx="26" ry="4" fill="#000" opacity="0.2" />
          {/* mill tower */}
          <path d="M32 44 L48 44 L52 80 L28 80 Z" fill="url(#md-mill)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M31 56 H50 M30 68 H51" stroke="#6e4626" strokeWidth="1.8" opacity="0.6" />
          <rect x="35" y="62" width="9" height="16" rx="2" fill="#5e3a1e" stroke={OUT} strokeWidth="2.4" />
          {/* roof cap */}
          <path d="M30 44 L40 34 L50 44 Z" fill="#8a5a34" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          {/* sail blades (4, with cloth) */}
          <g stroke="#6e4626" strokeWidth="3.4" strokeLinecap="round">
            <line x1="40" y1="34" x2="62" y2="12" /><line x1="40" y1="34" x2="62" y2="56" />
            <line x1="40" y1="34" x2="18" y2="12" /><line x1="40" y1="34" x2="18" y2="56" />
          </g>
          <path d="M40 34 L58 16 L62 20 Z" fill="#f2ead6" stroke={OUT} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M40 34 L58 52 L62 48 Z" fill="#e8dcc0" stroke={OUT} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M40 34 L22 16 L18 20 Z" fill="#f2ead6" stroke={OUT} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M40 34 L22 52 L18 48 Z" fill="#e8dcc0" stroke={OUT} strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="40" cy="34" r="4.5" fill="#5e3a1e" stroke={OUT} strokeWidth="2.4" />
        </>);
      case 'tourney':
        return (<>
          <defs>
            <linearGradient id="md-shield" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f0d79a" /><stop offset="1" stopColor="#c9a862" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="28" ry="4" fill="#000" opacity="0.18" />
          {/* two banner poles with pennants */}
          <line x1="22" y1="14" x2="24" y2="80" stroke="#7c5230" strokeWidth="4" strokeLinecap="round" />
          <path d="M24 16 L44 22 L26 30 Z" fill="#d94a3a" stroke={OUT} strokeWidth="2.2" strokeLinejoin="round" />
          <line x1="74" y1="14" x2="72" y2="80" stroke="#7c5230" strokeWidth="4" strokeLinecap="round" />
          <path d="M72 16 L52 22 L70 30 Z" fill="#3a6fd9" stroke={OUT} strokeWidth="2.2" strokeLinejoin="round" />
          {/* heraldic shield center */}
          <path d="M34 40 L48 34 L62 40 L62 58 C62 68 55 76 48 78 C41 76 34 68 34 58 Z" fill="url(#md-shield)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* crossed swords emblem */}
          <line x1="41" y1="46" x2="55" y2="66" stroke="#8a92a6" strokeWidth="3" strokeLinecap="round" />
          <line x1="55" y1="46" x2="41" y2="66" stroke="#8a92a6" strokeWidth="3" strokeLinecap="round" />
          <circle cx="48" cy="56" r="3" fill="#c23a30" stroke={OUT} strokeWidth="1.6" />
        </>);
      case 'alchemy':
        return (<>
          <defs>
            <linearGradient id="md-potion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7cf0a8" /><stop offset="1" stopColor="#2f9a5e" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="24" ry="4" fill="#000" opacity="0.18" />
          {/* bubbles rising */}
          <circle cx="44" cy="16" r="2.4" fill="#8affc0" opacity="0.7" /><circle cx="52" cy="12" r="1.8" fill="#8affc0" opacity="0.6" />
          {/* flask glass */}
          <path d="M40 20 L56 20 L56 38 L70 64 C73 72 66 78 58 78 L38 78 C30 78 23 72 26 64 L40 38 Z" fill="rgba(200,240,255,0.25)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* liquid */}
          <path d="M31 56 L65 56 L70 64 C73 72 66 78 58 78 L38 78 C30 78 23 72 26 64 Z" fill="url(#md-potion)" stroke={OUT} strokeWidth="2.4" />
          {/* liquid bubbles + surface */}
          <path d="M31 56 Q48 60 65 56" fill="none" stroke="#b8ffd4" strokeWidth="2" opacity="0.7" />
          <circle cx="42" cy="66" r="3" fill="#c8ffe0" /><circle cx="54" cy="70" r="2.4" fill="#c8ffe0" /><circle cx="48" cy="72" r="2" fill="#c8ffe0" />
          {/* cork stopper */}
          <rect x="41" y="12" width="14" height="9" rx="3" fill="#b5763f" stroke={OUT} strokeWidth="2.4" />
          {/* glass highlight */}
          <path d="M36 40 L30 60" stroke="#eafbff" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
        </>);

      // ─── Era 4: Renaissance — RICH redraw ───
      case 'atelier':
        return (<>
          <defs>
            <linearGradient id="rn-pal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f0d6ac" /><stop offset="1" stopColor="#c99a62" />
            </linearGradient>
          </defs>
          <ellipse cx="46" cy="82" rx="26" ry="4" fill="#000" opacity="0.18" />
          {/* wooden palette */}
          <path d="M46 16 C70 16 82 30 82 48 C82 60 74 64 66 62 C60 60 60 68 54 68 L46 68 C50 76 40 82 30 78 C18 72 14 58 16 44 C20 26 32 16 46 16 Z" fill="url(#rn-pal)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* thumb hole */}
          <ellipse cx="52" cy="60" rx="5" ry="4" fill="#8a5f34" stroke={OUT} strokeWidth="2.2" />
          {/* paint blobs with shine */}
          <circle cx="30" cy="34" r="6" fill="#e2483c" stroke={OUT} strokeWidth="2.4" /><circle cx="28" cy="32" r="1.6" fill="#ffb0a8" />
          <circle cx="46" cy="27" r="6" fill="#3a8ae0" stroke={OUT} strokeWidth="2.4" /><circle cx="44" cy="25" r="1.6" fill="#a8d0ff" />
          <circle cx="62" cy="33" r="6" fill="#3fc47a" stroke={OUT} strokeWidth="2.4" /><circle cx="60" cy="31" r="1.6" fill="#a8f0c8" />
          <circle cx="28" cy="52" r="5.5" fill="#ffcf3c" stroke={OUT} strokeWidth="2.4" /><circle cx="26" cy="50" r="1.5" fill="#fff0b0" />
          {/* brush */}
          <rect x="52" y="42" width="30" height="5.5" rx="2.5" fill="#8a5a2b" stroke={OUT} strokeWidth="2.4" transform="rotate(-32 66 45)" />
          <path d="M79 30 l4 -3 l1 5 z" fill="#c85a3a" transform="rotate(-32 79 30)" />
        </>);
      case 'press':
        return (<>
          <defs>
            <linearGradient id="rn-press" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a8764a" /><stop offset="1" stopColor="#6e4626" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="28" ry="4" fill="#000" opacity="0.18" />
          {/* frame posts */}
          <rect x="18" y="16" width="8" height="62" rx="2" fill="url(#rn-press)" stroke={OUT} strokeWidth="2.6" />
          <rect x="70" y="16" width="8" height="62" rx="2" fill="url(#rn-press)" stroke={OUT} strokeWidth="2.6" />
          {/* top beam + screw */}
          <rect x="16" y="14" width="64" height="9" rx="3" fill="#7a5230" stroke={OUT} strokeWidth="2.6" />
          <rect x="43" y="22" width="10" height="14" rx="2" fill="#8a92a6" stroke={OUT2} strokeWidth="2.4" />
          <circle cx="48" cy="20" r="5" fill="#6e4626" stroke={OUT} strokeWidth="2.4" />
          {/* platen */}
          <rect x="24" y="36" width="48" height="10" rx="2" fill="#a06c42" stroke={OUT} strokeWidth="2.6" />
          {/* printed page */}
          <rect x="28" y="48" width="40" height="26" rx="2" fill="#f6efdc" stroke={OUT} strokeWidth="2.6" />
          <path d="M34 56 H62 M34 62 H62 M34 68 H54" stroke="#8a6a45" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M34 56 h5" stroke="#c23a30" strokeWidth="2.6" strokeLinecap="round" />
        </>);
      case 'bank':
        return (<>
          <defs>
            <linearGradient id="rn-bank" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4f8ff" /><stop offset="1" stopColor="#cdd8ea" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="84" rx="34" ry="4" fill="#000" opacity="0.16" />
          {/* base steps */}
          <rect x="12" y="74" width="72" height="8" rx="2" fill="#dbe3f0" stroke={OUT2} strokeWidth="2.6" />
          <rect x="16" y="68" width="64" height="7" rx="2" fill="#e8eef7" stroke={OUT2} strokeWidth="2.4" />
          {/* pediment */}
          <path d="M48 16 L84 40 L12 40 Z" fill="url(#rn-bank)" stroke={OUT2} strokeWidth="3" strokeLinejoin="round" />
          <rect x="12" y="40" width="72" height="5" rx="1" fill="#dbe3f0" stroke={OUT2} strokeWidth="2.4" />
          {/* fluted columns */}
          {[22, 36, 50, 64].map((x) => (<g key={x}>
            <rect x={x - 4} y="45" width="11" height="24" rx="2" fill="#eef3fb" stroke={OUT2} strokeWidth="2.4" />
            <path d={`M${x - 1} 47 v20 M${x + 3} 47 v20`} stroke="#c4cfe0" strokeWidth="1.4" />
          </g>))}
          {/* gold coin on pediment */}
          <circle cx="48" cy="30" r="7" fill="#ffcf3c" stroke={OUT} strokeWidth="2.4" />
          <text x="48" y="34" textAnchor="middle" fontSize="9" fontWeight="900" fill="#a8791a">$</text>
        </>);
      case 'opera':
        return (<>
          <defs>
            <linearGradient id="rn-mkG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe08a" /><stop offset="1" stopColor="#e0a92a" />
            </linearGradient>
            <linearGradient id="rn-mkP" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#c0a8ff" /><stop offset="1" stopColor="#7c5cd6" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="28" ry="4" fill="#000" opacity="0.18" />
          {/* comedy mask (gold) */}
          <path d="M16 20 C27 27 37 27 45 20 L45 46 C45 60 37 70 30 70 C23 70 16 60 16 46 Z" fill="url(#rn-mkG)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M22 34 Q26 30 31 34 M35 34 Q39 31 42 34" fill="none" stroke={OUT} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M22 48 Q30 58 40 48" fill="none" stroke={OUT} strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="42" r="2.2" fill="#e8a0a0" opacity="0.7" />
          {/* tragedy mask (purple) */}
          <path d="M51 24 C62 31 72 31 80 24 L80 50 C80 64 72 74 65 74 C58 74 51 64 51 50 Z" fill="url(#rn-mkP)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M57 40 Q61 44 65 40 M69 40 Q72 43 76 40" fill="none" stroke={OUT} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M57 60 Q65 52 74 60" fill="none" stroke={OUT} strokeWidth="3" strokeLinecap="round" />
          <circle cx="59" cy="50" r="1.6" fill="#dff" opacity="0.6" />
        </>);

      // ─── Era 5: Industrial — RICH redraw ───
      case 'steamworks':
        return (<>
          <defs>
            <linearGradient id="in-fac" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a5744a" /><stop offset="1" stopColor="#6e4626" />
            </linearGradient>
          </defs>
          {/* smoke */}
          <circle cx="30" cy="18" r="7" fill="#dfe4ec" opacity="0.7" /><circle cx="38" cy="11" r="5" fill="#dfe4ec" opacity="0.5" /><circle cx="46" cy="16" r="4" fill="#dfe4ec" opacity="0.4" />
          <ellipse cx="48" cy="84" rx="34" ry="4" fill="#000" opacity="0.18" />
          {/* factory body + sawtooth roof */}
          <rect x="16" y="46" width="64" height="34" rx="4" fill="url(#in-fac)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M16 46 L28 36 L28 46 L44 36 L44 46 L60 36 L60 46 Z" fill="#5a3a24" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" />
          {/* chimney */}
          <rect x="24" y="18" width="12" height="26" rx="2" fill="#6e4626" stroke={OUT} strokeWidth="2.6" />
          <rect x="23" y="16" width="14" height="5" rx="2" fill="#8a5f3a" stroke={OUT} strokeWidth="2.2" />
          {/* glowing windows */}
          <rect x="24" y="56" width="13" height="14" rx="2" fill="#ffd24a" stroke={OUT} strokeWidth="2.4" />
          <rect x="43" y="56" width="13" height="14" rx="2" fill="#ffd24a" stroke={OUT} strokeWidth="2.4" />
          <path d="M30 56 v14 M49 56 v14" stroke="#c89a2a" strokeWidth="1.6" />
          {/* gear */}
          <g transform="translate(66,48)">
            <circle r="9" fill="#c2c9d8" stroke={OUT2} strokeWidth="2.8" /><circle r="3.5" fill="#5a6272" />
            {[0, 60, 120, 180, 240, 300].map((a) => (<rect key={a} x="-2" y="-12" width="4" height="5" rx="1.5" fill="#c2c9d8" stroke={OUT2} strokeWidth="2.2" transform={`rotate(${a})`} />))}
          </g>
        </>);
      case 'railway':
        return (<>
          <defs>
            <linearGradient id="in-loco" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5a6578" /><stop offset="1" stopColor="#333c4c" />
            </linearGradient>
          </defs>
          {/* steam puffs */}
          <circle cx="34" cy="14" r="4.5" fill="#dfe4ec" opacity="0.6" /><circle cx="40" cy="9" r="3.5" fill="#dfe4ec" opacity="0.45" />
          {/* rails */}
          <path d="M8 78 L88 78" stroke="#5a6272" strokeWidth="3" strokeLinecap="round" />
          <path d="M14 74 h6 M28 74 h6 M42 74 h6 M56 74 h6 M70 74 h6" stroke="#7c5230" strokeWidth="3" strokeLinecap="round" />
          {/* loco body */}
          <rect x="14" y="34" width="48" height="30" rx="8" fill="url(#in-loco)" stroke={OUT2} strokeWidth="3" />
          <rect x="20" y="40" width="24" height="12" rx="4" fill="#8fd6ff" stroke={OUT2} strokeWidth="2.4" />
          {/* smokestack + cab */}
          <rect x="30" y="18" width="10" height="16" rx="2" fill="#2a303c" stroke={OUT2} strokeWidth="2.4" />
          <path d="M29 18 a6 4 0 0 1 12 0 Z" fill="#333c4c" stroke={OUT2} strokeWidth="2.2" />
          {/* cowcatcher */}
          <path d="M62 40 L80 34 L80 64 L62 58 Z" fill="#e24438" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M64 44 L76 40 M64 54 L76 58" stroke="#a8281e" strokeWidth="1.8" />
          {/* wheels */}
          <circle cx="24" cy="66" r="8" fill="#2a303c" stroke={OUT2} strokeWidth="2.8" /><circle cx="24" cy="66" r="3" fill="#5a6272" />
          <circle cx="48" cy="66" r="8" fill="#2a303c" stroke={OUT2} strokeWidth="2.8" /><circle cx="48" cy="66" r="3" fill="#5a6272" />
          <circle cx="34" cy="50" r="3" fill="#ffd24a" stroke={OUT} strokeWidth="1.6" />
        </>);
      case 'coalmine':
        return (<>
          <defs>
            <linearGradient id="in-cart" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6a7284" /><stop offset="1" stopColor="#3a424f" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="84" rx="32" ry="4" fill="#000" opacity="0.18" />
          {/* mine cart */}
          <path d="M16 46 L80 46 L72 72 L24 72 Z" fill="url(#in-cart)" stroke={OUT2} strokeWidth="3" strokeLinejoin="round" />
          <path d="M16 46 L80 46" stroke="#8a92a6" strokeWidth="2.2" />
          {/* coal lumps heaped */}
          <circle cx="32" cy="40" r="8" fill="#2c2c34" stroke={OUT2} strokeWidth="2.6" />
          <circle cx="48" cy="35" r="9" fill="#3a3a44" stroke={OUT2} strokeWidth="2.6" />
          <circle cx="63" cy="41" r="7.5" fill="#22222a" stroke={OUT2} strokeWidth="2.6" />
          <circle cx="30" cy="37" r="1.6" fill="#6a6a76" /><circle cx="50" cy="32" r="1.8" fill="#6a6a76" />
          {/* rails + wheels */}
          <path d="M12 80 L84 80" stroke="#5a6272" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="76" r="7" fill="#2a303c" stroke={OUT2} strokeWidth="2.8" /><circle cx="32" cy="76" r="2.6" fill="#5a6272" />
          <circle cx="62" cy="76" r="7" fill="#2a303c" stroke={OUT2} strokeWidth="2.8" /><circle cx="62" cy="76" r="2.6" fill="#5a6272" />
        </>);
      case 'steel':
        return (<>
          <defs>
            <linearGradient id="in-ladle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6a7284" /><stop offset="1" stopColor="#3a424f" />
            </linearGradient>
            <linearGradient id="in-molten" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff2a0" /><stop offset="1" stopColor="#ff5a10" />
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="84" rx="30" ry="4" fill="#000" opacity="0.18" />
          {/* ladle */}
          <path d="M20 40 L56 40 L50 64 C50 72 44 76 38 76 C32 76 26 72 26 64 Z" fill="url(#in-ladle)" stroke={OUT2} strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="38" cy="40" rx="18" ry="4" fill="#8a92a6" stroke={OUT2} strokeWidth="2.4" />
          {/* pivot ring */}
          <circle cx="20" cy="46" r="4" fill="none" stroke={OUT2} strokeWidth="3" /><circle cx="56" cy="46" r="4" fill="none" stroke={OUT2} strokeWidth="3" />
          {/* molten pour */}
          <path d="M54 44 C64 48 68 40 66 30 C64 40 60 42 56 40 Z" fill="url(#in-molten)" stroke={OUT} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M30 42 Q38 38 48 42" fill="none" stroke="#ffd24a" strokeWidth="2.2" opacity="0.7" />
          {/* sparks */}
          <circle cx="66" cy="24" r="2.4" fill="#ffd24a" /><circle cx="72" cy="34" r="2" fill="#ff9838" /><circle cx="62" cy="50" r="1.8" fill="#ffd24a" />
        </>);

      // ─── Era 6: Modern — RICH redraw ───
      case 'technocorp':
        return (<>
          <defs>
            <linearGradient id="mo-tower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5bb0f0" /><stop offset="1" stopColor="#1f5fc0" />
            </linearGradient>
            <linearGradient id="mo-tower2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4a9ae0" /><stop offset="1" stopColor="#2a6fc0" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="84" rx="32" ry="4" fill="#000" opacity="0.18" />
          {/* shorter tower */}
          <rect x="56" y="34" width="20" height="46" rx="3" fill="url(#mo-tower2)" stroke={OUT2} strokeWidth="2.8" />
          {/* main skyscraper */}
          <rect x="22" y="14" width="30" height="66" rx="3" fill="url(#mo-tower)" stroke={OUT2} strokeWidth="3" />
          <path d="M22 14 L37 8 L52 14 Z" fill="#5bb0f0" stroke={OUT2} strokeWidth="2.6" strokeLinejoin="round" />
          <line x1="37" y1="8" x2="37" y2="3" stroke={OUT2} strokeWidth="2.4" /><circle cx="37" cy="3" r="2" fill="#ff5c74" />
          {/* windows lit */}
          {[24, 33, 42, 51, 60, 69].map((y) => [27, 34, 41].map((x, i) => (
            <rect key={`${x}${y}`} x={x} y={y} width="5" height="6" rx="1" fill={(i + y) % 2 ? '#dff2ff' : '#8fc8f0'} />)))}
          {[42, 51, 60, 69].map((y) => (<rect key={y} x="60" y={y} width="12" height="6" rx="1" fill="#dff2ff" opacity="0.9" />))}
        </>);
      case 'social':
        return (<>
          <defs>
            <linearGradient id="mo-bubble" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5be0ff" /><stop offset="1" stopColor="#1aa0d8" />
            </linearGradient>
          </defs>
          <ellipse cx="46" cy="82" rx="26" ry="4" fill="#000" opacity="0.16" />
          {/* chat bubble */}
          <path d="M14 22 C14 16 18 12 24 12 L64 12 C70 12 74 16 74 22 L74 46 C74 52 70 56 64 56 L36 56 L22 68 L25 56 C18 55 14 51 14 46 Z" fill="url(#mo-bubble)" stroke={OUT2} strokeWidth="3" strokeLinejoin="round" />
          {/* heart */}
          <path d="M44 24 C41 19 32 20 31 27 C30 34 40 41 44 45 C48 41 58 34 57 27 C56 20 47 19 44 24 Z" fill="#fff" stroke={OUT2} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M35 25 q-1 4 4 8" stroke="#bff0ff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
          {/* like badge */}
          <circle cx="66" cy="64" r="12" fill="#8d6bff" stroke={OUT2} strokeWidth="3" />
          <path d="M66 58 V70 M60 64 H72" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />
        </>);
      case 'gamedev':
        return (<>
          <defs>
            <linearGradient id="mo-pad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9a6fff" /><stop offset="1" stopColor="#5a2fd0" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="30" ry="4" fill="#000" opacity="0.16" />
          {/* controller body */}
          <path d="M26 34 L70 34 C80 34 84 46 81 60 C79 70 71 74 65 69 C60 65 59 60 52 60 L44 60 C37 60 36 65 31 69 C25 74 17 70 15 60 C12 46 16 34 26 34 Z" fill="url(#mo-pad)" stroke={OUT2} strokeWidth="3" strokeLinejoin="round" />
          {/* d-pad */}
          <path d="M28 42 V54 M22 48 H34" stroke="#e8e0ff" strokeWidth="4.5" strokeLinecap="round" />
          {/* buttons */}
          <circle cx="62" cy="44" r="4.5" fill="#45e08a" stroke={OUT2} strokeWidth="2.2" />
          <circle cx="72" cy="52" r="4.5" fill="#ff5c74" stroke={OUT2} strokeWidth="2.2" />
          <circle cx="52" cy="52" r="4.5" fill="#5be0ff" stroke={OUT2} strokeWidth="2.2" />
          <circle cx="62" cy="60" r="4.5" fill="#ffd24a" stroke={OUT2} strokeWidth="2.2" />
        </>);
      case 'satnet':
        return (<>
          <defs>
            <linearGradient id="mo-panel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4a8ae0" /><stop offset="1" stopColor="#2a5fb0" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="24" ry="4" fill="#000" opacity="0.16" />
          {/* signal arcs */}
          <path d="M36 18 A16 16 0 0 1 60 18 M30 12 A24 24 0 0 1 66 12" fill="none" stroke="#31d2f7" strokeWidth="3.2" strokeLinecap="round" />
          {/* solar panels */}
          <rect x="8" y="38" width="24" height="13" rx="2" fill="url(#mo-panel)" stroke={OUT2} strokeWidth="2.6" />
          <rect x="64" y="38" width="24" height="13" rx="2" fill="url(#mo-panel)" stroke={OUT2} strokeWidth="2.6" />
          <path d="M14 38 v13 M20 38 v13 M26 38 v13 M70 38 v13 M76 38 v13 M82 38 v13" stroke="#8fb8e8" strokeWidth="1.4" />
          {/* body */}
          <rect x="40" y="34" width="14" height="30" rx="3" fill="#c9cdd6" stroke={OUT2} strokeWidth="2.8" />
          <circle cx="47" cy="26" r="6" fill="#e8ecf5" stroke={OUT2} strokeWidth="2.6" />
          <rect x="41" y="64" width="12" height="12" rx="2" fill="#8a92a8" stroke={OUT2} strokeWidth="2.4" />
        </>);

      // ─── Era 7: Space — RICH redraw ───
      case 'mooncolony':
        return (<>
          <defs>
            <radialGradient id="sp-dome" cx="0.4" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#bfeaff" stopOpacity="0.9" /><stop offset="1" stopColor="#5aa0d8" stopOpacity="0.55" />
            </radialGradient>
          </defs>
          <circle cx="72" cy="20" r="7" fill="#fff4c0" stroke="#e0c060" strokeWidth="1.5" />
          <circle cx="18" cy="16" r="1.8" fill="#fff" /><circle cx="30" cy="24" r="1.4" fill="#fff" /><circle cx="82" cy="40" r="1.4" fill="#fff" />
          {/* moon ground */}
          <path d="M10 70 Q30 62 48 68 Q66 72 86 66 L86 82 L10 82 Z" fill="#c8cfdb" stroke={OUT2} strokeWidth="2.6" strokeLinejoin="round" />
          <ellipse cx="24" cy="72" rx="4" ry="2" fill="#9aa2b0" /><ellipse cx="68" cy="74" rx="5" ry="2.5" fill="#9aa2b0" />
          {/* habitat modules */}
          <rect x="40" y="48" width="14" height="20" rx="3" fill="#dfe6f2" stroke={OUT2} strokeWidth="2.6" />
          <path d="M34 48 a14 14 0 0 1 28 0 Z" fill="url(#sp-dome)" stroke={OUT2} strokeWidth="2.8" strokeLinejoin="round" />
          <circle cx="48" cy="42" r="4" fill="#bfeaff" stroke={OUT2} strokeWidth="1.8" />
          <rect x="58" y="58" width="10" height="10" rx="2" fill="#c9cfdb" stroke={OUT2} strokeWidth="2.2" />
          <line x1="54" y1="60" x2="58" y2="62" stroke={OUT2} strokeWidth="2.2" />
        </>);
      case 'marsmine':
        return (<>
          <defs>
            <radialGradient id="sp-mars" cx="0.38" cy="0.32" r="0.9">
              <stop offset="0" stopColor="#ff8a5c" /><stop offset="1" stopColor="#b3341c" />
            </radialGradient>
          </defs>
          <circle cx="24" cy="14" r="1.8" fill="#fff" /><circle cx="34" cy="10" r="1.4" fill="#fff" />
          <ellipse cx="44" cy="82" rx="30" ry="4" fill="#000" opacity="0.16" />
          {/* mars planet */}
          <circle cx="40" cy="52" r="26" fill="url(#sp-mars)" stroke={OUT} strokeWidth="3" />
          <ellipse cx="30" cy="44" rx="6" ry="4" fill="#a83418" opacity="0.7" />
          <ellipse cx="50" cy="60" rx="7" ry="5" fill="#a83418" opacity="0.7" />
          <path d="M22 40 q10 -3 18 2" stroke="#c85a3a" strokeWidth="2" opacity="0.6" fill="none" />
          {/* drill rig */}
          <path d="M56 12 L76 12 L66 34 Z" fill="#6a7284" stroke={OUT2} strokeWidth="2.8" strokeLinejoin="round" />
          <line x1="66" y1="32" x2="66" y2="50" stroke="#3a424f" strokeWidth="5" strokeLinecap="round" />
          <path d="M63 50 l3 6 l3 -6 z" fill="#8a92a6" stroke={OUT2} strokeWidth="1.8" />
        </>);
      case 'asteroid':
        return (<>
          <defs>
            <radialGradient id="sp-ast" cx="0.4" cy="0.35" r="0.85">
              <stop offset="0" stopColor="#8a92a6" /><stop offset="1" stopColor="#4a5266" />
            </radialGradient>
          </defs>
          <circle cx="78" cy="16" r="2" fill="#fff" /><circle cx="70" cy="72" r="1.6" fill="#fff" /><circle cx="16" cy="24" r="1.6" fill="#fff" />
          {/* asteroid */}
          <path d="M22 18 C36 8 54 12 64 24 C72 36 68 56 54 66 C40 74 18 68 14 50 C10 34 12 26 22 18 Z" fill="url(#sp-ast)" stroke={OUT2} strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="30" cy="34" rx="6" ry="4.5" fill="#3a424f" /><ellipse cx="48" cy="50" rx="5" ry="4" fill="#3a424f" /><circle cx="60" cy="34" r="3" fill="#3a424f" />
          {/* embedded crystals */}
          <path d="M40 24 L48 30 L42 40 L34 34 Z" fill="#5be0ff" stroke={OUT2} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M26 50 L32 54 L28 62 L22 56 Z" fill="#b088ff" stroke={OUT2} strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="55" cy="56" r="3" fill="#ffd24a" stroke={OUT2} strokeWidth="1.8" />
        </>);
      case 'shipyard':
        return (<>
          <defs>
            <linearGradient id="sp-ship" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#f2f6ff" /><stop offset="1" stopColor="#c4cee0" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="16" r="1.8" fill="#fff" /><circle cx="80" cy="26" r="1.6" fill="#fff" />
          {/* gantry frame */}
          <rect x="58" y="10" width="6" height="60" rx="2" fill="#5a6272" stroke={OUT2} strokeWidth="2.4" />
          <rect x="36" y="12" width="28" height="5" rx="2" fill="#5a6272" stroke={OUT2} strokeWidth="2.2" />
          <line x1="46" y1="17" x2="46" y2="26" stroke="#8a92a6" strokeWidth="2.4" />
          {/* rocket */}
          <path d="M32 10 C42 18 44 34 42 54 L24 54 C22 34 24 18 32 10 Z" fill="url(#sp-ship)" stroke={OUT2} strokeWidth="3" strokeLinejoin="round" />
          <path d="M32 10 C36 15 38 22 39 32 L25 32 C26 22 28 15 32 10 Z" fill="#e24438" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="33" cy="38" r="5" fill="#8fd6ff" stroke={OUT2} strokeWidth="2.4" />
          {/* fins + exhaust */}
          <path d="M24 54 L18 66 L28 60 Z" fill="#c4cee0" stroke={OUT2} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M40 54 L46 66 L36 60 Z" fill="#c4cee0" stroke={OUT2} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M28 60 Q33 76 38 60 Z" fill="#ff9838" stroke={OUT} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M31 62 Q33 70 35 62 Z" fill="#ffe04a" />
        </>);

      // ─── Turkic (İlk Türkler / Göktürk) — RICH redraw ───
      case 'yurt':
        return (<>
          <defs>
            <linearGradient id="tk-yurt-dome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4ead4" /><stop offset="1" stopColor="#cdb992" />
            </linearGradient>
            <linearGradient id="tk-yurt-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e6d8ba" /><stop offset="1" stopColor="#bda480" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="78" rx="34" ry="6" fill="#000" opacity="0.24" />
          {/* smoke wisp */}
          <path d="M48 20 C44 15 52 13 48 8" fill="none" stroke="#cfd8e0" strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />
          {/* wall */}
          <path d="M18 78 L18 54 Q48 48 78 54 L78 78 Z" fill="url(#tk-yurt-wall)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* dome */}
          <path d="M14 56 Q48 26 82 56 Z" fill="url(#tk-yurt-dome)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* roof lattice */}
          <g stroke="#9c8258" strokeWidth="1.8" opacity="0.7">
            <path d="M48 30 L26 54 M48 30 L38 55 M48 30 L58 55 M48 30 L70 54" />
          </g>
          <path d="M18 56 H78" stroke="#8a6a45" strokeWidth="2.2" opacity="0.6" />
          {/* crown ring */}
          <ellipse cx="48" cy="30" rx="8" ry="3.5" fill="#8a5a34" stroke={OUT} strokeWidth="2.4" />
          {/* door */}
          <path d="M40 78 L40 60 Q48 55 56 60 L56 78 Z" fill="#6e4626" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M43 62 L53 62 M43 68 L53 68" stroke="#3e2814" strokeWidth="1.6" />
          {/* red trim */}
          <path d="M40 60 Q48 55 56 60" fill="none" stroke="#d94040" strokeWidth="2.6" strokeLinecap="round" />
        </>);
      case 'horsefarm':
        return (<>
          <defs>
            <linearGradient id="tk-horse" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a0703f" /><stop offset="1" stopColor="#6e4626" />
            </linearGradient>
          </defs>
          <ellipse cx="46" cy="80" rx="30" ry="5" fill="#000" opacity="0.22" />
          {/* legs */}
          <path d="M30 62 L28 78 M40 66 L40 80 M56 66 L58 80 M66 60 L70 76" stroke="#5e3a1e" strokeWidth="5" strokeLinecap="round" />
          {/* body */}
          <path d="M26 60 Q24 46 40 46 L60 46 Q70 46 70 58 Q70 66 60 66 L34 66 Q26 66 26 60 Z" fill="url(#tk-horse)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* neck + head */}
          <path d="M60 50 C64 38 68 26 78 22 C82 20 86 24 84 30 C80 40 76 46 70 52 Z" fill="url(#tk-horse)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* mane */}
          <path d="M62 46 C58 38 60 30 66 26 M66 44 C62 37 64 30 70 26" fill="none" stroke="#3e2814" strokeWidth="3" strokeLinecap="round" />
          {/* ear, eye */}
          <path d="M80 22 L82 15 L86 20 Z" fill="#8a5a34" stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="80" cy="28" r="2" fill={OUT} />
          {/* tail */}
          <path d="M26 54 C16 56 14 66 18 74" fill="none" stroke="#3e2814" strokeWidth="4.5" strokeLinecap="round" />
        </>);
      case 'orkhon':
        return (<>
          <defs>
            <linearGradient id="tk-stele" x1="0" y1="0" x2="1" y2="0.3">
              <stop offset="0" stopColor="#c4beb0" /><stop offset="1" stopColor="#8f887a" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="26" ry="5" fill="#000" opacity="0.22" />
          {/* stele body, tapered with rounded top */}
          <path d="M32 78 L34 26 Q34 14 48 12 Q62 14 62 26 L64 78 Z" fill="url(#tk-stele)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* tamga emblem at top */}
          <circle cx="48" cy="24" r="5" fill="none" stroke="#4c4638" strokeWidth="2.4" />
          <path d="M48 24 L48 30 M45 21 L51 21" stroke="#4c4638" strokeWidth="2.2" strokeLinecap="round" />
          {/* runic inscription columns */}
          <g stroke="#4c4638" strokeWidth="2.2" strokeLinecap="round">
            <path d="M42 34 L42 40 M40 37 L44 37" />
            <path d="M54 34 L54 42 M52 38 L56 38" />
            <path d="M42 46 L46 52 M46 46 L42 52" />
            <path d="M52 46 L52 54 M55 48 L52 50" />
            <path d="M42 58 L54 58 M44 64 L52 64 M46 70 L50 70" />
          </g>
          {/* highlight edge */}
          <path d="M36 26 Q37 16 47 14" stroke="#e6e0d2" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.6" />
        </>);
      case 'khagan':
        return (<>
          <defs>
            <linearGradient id="tk-kh-roof" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5a86d8" /><stop offset="1" stopColor="#2f5aa0" />
            </linearGradient>
            <linearGradient id="tk-kh-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4a72c0" /><stop offset="1" stopColor="#2a4d90" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="34" ry="6" fill="#000" opacity="0.24" />
          {/* banner pole + wolf-head pennant */}
          <line x1="48" y1="30" x2="48" y2="8" stroke="#8a5a34" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M48 10 L70 14 L62 20 L70 26 L48 24 Z" fill="#d8dfe8" stroke={OUT} strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="58" cy="17" r="2" fill="#2f5aa0" />
          {/* wall */}
          <path d="M16 80 L16 56 Q48 50 80 56 L80 80 Z" fill="url(#tk-kh-wall)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* grand dome */}
          <path d="M12 58 Q48 24 84 58 Z" fill="url(#tk-kh-roof)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* gold trim + lattice */}
          <path d="M16 58 H80" stroke="#ffd24a" strokeWidth="2.6" />
          <g stroke="#ffd24a" strokeWidth="1.6" opacity="0.7"><path d="M48 30 L28 56 M48 30 L48 56 M48 30 L68 56" /></g>
          {/* ornate gold door */}
          <path d="M40 80 L40 60 Q48 54 56 60 L56 80 Z" fill="#ffd24a" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M48 62 L48 78 M44 70 L52 70" stroke="#a8791a" strokeWidth="1.8" />
        </>);
      case 'kimiz':
        return (<>
          <defs>
            <linearGradient id="tk-kimiz" x1="0" y1="0" x2="1" y2="0.3">
              <stop offset="0" stopColor="#e0d3b6" /><stop offset="1" stopColor="#a89170" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="24" ry="5" fill="#000" opacity="0.22" />
          {/* wooden stand legs */}
          <path d="M34 78 L30 60 M62 78 L66 60" stroke="#6e4626" strokeWidth="4" strokeLinecap="round" />
          {/* leather churn (saba) — bulging skin */}
          <path d="M34 30 Q30 44 34 60 Q38 76 48 76 Q58 76 62 60 Q66 44 62 30 Q48 24 34 30 Z" fill="url(#tk-kimiz)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* stitched seam */}
          <path d="M48 26 L48 76" stroke="#8a7452" strokeWidth="1.8" strokeDasharray="3 3" opacity="0.7" />
          <path d="M36 44 Q48 48 60 44 M35 58 Q48 62 61 58" stroke="#8a7452" strokeWidth="1.6" opacity="0.5" fill="none" />
          {/* neck opening + stir stick */}
          <rect x="42" y="18" width="12" height="10" rx="3" fill="#c9b88a" stroke={OUT} strokeWidth="2.4" />
          <line x1="48" y1="8" x2="48" y2="22" stroke="#7c5230" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="48" cy="8" rx="4" ry="2" fill="#7c5230" />
          {/* highlight */}
          <path d="M38 32 Q35 44 38 56" stroke="#f2ead6" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.6" />
        </>);
      case 'archer':
        return (<>
          <defs>
            <linearGradient id="tk-bow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#b5763f" /><stop offset="1" stopColor="#6e4626" />
            </linearGradient>
          </defs>
          {/* recurve composite bow */}
          <path d="M64 12 C50 20 50 32 56 40 C50 48 50 60 64 68" fill="none" stroke="url(#tk-bow)" strokeWidth="6" strokeLinecap="round" />
          <path d="M64 12 C50 20 50 32 56 40 C50 48 50 60 64 68" fill="none" stroke={OUT} strokeWidth="2.4" strokeLinecap="round" opacity="0.4" />
          {/* string */}
          <line x1="64" y1="12" x2="64" y2="68" stroke="#e8dcc0" strokeWidth="1.8" />
          {/* nocked arrow */}
          <line x1="20" y1="40" x2="62" y2="40" stroke="#7c5230" strokeWidth="3" strokeLinecap="round" />
          <path d="M20 40 L27 35 M20 40 L27 45" stroke="#c85a3a" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M62 40 L54 36 L54 44 Z" fill="#c9cdd6" stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
          {/* quiver of arrows bottom-left */}
          <path d="M26 58 L34 76 L44 76 L36 58 Z" fill="#8a5a34" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          <line x1="30" y1="58" x2="30" y2="48" stroke="#7c5230" strokeWidth="2" /><line x1="35" y1="58" x2="35" y2="46" stroke="#7c5230" strokeWidth="2" />
          <circle cx="30" cy="47" r="1.6" fill="#c85a3a" /><circle cx="35" cy="45" r="1.6" fill="#c85a3a" />
        </>);
      case 'caravan':
        return (<>
          <defs>
            <linearGradient id="tk-camel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e0b878" /><stop offset="1" stopColor="#b0844a" />
            </linearGradient>
          </defs>
          <circle cx="74" cy="20" r="7" fill="#ffe08a" opacity="0.9" />
          <ellipse cx="46" cy="80" rx="32" ry="5" fill="#000" opacity="0.2" />
          {/* legs */}
          <path d="M28 62 L26 78 M40 64 L40 80 M56 64 L58 80 M64 62 L68 78" stroke="#8a5a34" strokeWidth="4.5" strokeLinecap="round" />
          {/* bactrian body with two humps */}
          <path d="M22 62 Q22 52 30 50 Q32 40 40 46 Q48 38 56 46 Q64 42 66 52 Q72 54 70 62 Z" fill="url(#tk-camel)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* neck + head */}
          <path d="M66 54 C74 50 78 40 76 32 C75 28 70 28 69 33 C68 40 64 48 62 52 Z" fill="url(#tk-camel)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="74" cy="34" r="1.8" fill={OUT} />
          <path d="M75 30 L77 25 L80 29 Z" fill="#b0844a" stroke={OUT} strokeWidth="1.6" strokeLinejoin="round" />
          {/* saddle packs */}
          <rect x="30" y="48" width="14" height="10" rx="2" fill="#c25a3a" stroke={OUT} strokeWidth="2.4" />
          <path d="M31 53 H43" stroke="#7c2e1a" strokeWidth="1.6" />
          {/* tail */}
          <path d="M22 56 C16 58 16 66 20 70" fill="none" stroke="#8a5a34" strokeWidth="3.5" strokeLinecap="round" />
        </>);
      case 'kurgan':
        return (<>
          <defs>
            <radialGradient id="tk-mound" cx="0.4" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#7a9a5a" /><stop offset="1" stopColor="#4a6a38" />
            </radialGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="36" ry="6" fill="#000" opacity="0.2" />
          {/* grassy burial mound */}
          <path d="M12 78 Q30 40 48 40 Q66 40 84 78 Z" fill="url(#tk-mound)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {/* grass tufts */}
          <path d="M24 70 l-2 -5 l4 2 M34 74 l-2 -5 l4 2 M62 72 l2 -5 l-4 2 M74 68 l2 -5 l-4 2" stroke="#3a5a2a" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* balbal (stone ancestor figure) on top */}
          <path d="M42 44 L42 22 Q42 14 48 14 Q54 14 54 22 L54 44 Z" fill="#b8b0a0" stroke={OUT} strokeWidth="2.8" strokeLinejoin="round" />
          <circle cx="48" cy="22" r="5" fill="#c8c2b4" stroke={OUT} strokeWidth="2.4" />
          {/* face + cup held */}
          <circle cx="46" cy="21" r="1" fill="#4c4638" /><circle cx="50" cy="21" r="1" fill="#4c4638" />
          <path d="M44 34 h8" stroke="#7c7466" strokeWidth="2" strokeLinecap="round" />
          <rect x="45" y="36" width="6" height="4" rx="1.5" fill="#9c9488" stroke={OUT} strokeWidth="1.6" />
        </>);

      // ─── Ottoman — RICH redraw ───
      case 'grandbazaar':
        return (<>
          <defs>
            <linearGradient id="ot-bz" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f0c860" /><stop offset="1" stopColor="#b8842a" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="32" ry="4" fill="#000" opacity="0.18" />
          {/* domed roof with crescent */}
          <path d="M14 40 L82 40 L74 26 L22 26 Z" fill="#c88a2a" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M14 40 Q22 30 30 40 Q38 30 46 40 Q54 30 62 40 Q70 30 78 40" fill="url(#ot-bz)" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M48 18 a4 4 0 1 0 0.1 8 a3 3 0 1 1 -0.1 -8 Z" fill="#5ac8b0" stroke={OUT} strokeWidth="1.8" />
          {/* arched shop front */}
          <rect x="18" y="40" width="60" height="38" rx="3" fill="#d8a84a" stroke={OUT} strokeWidth="2.8" />
          <path d="M28 78 L28 56 Q38 48 48 56 L48 78 Z" fill="#7c4e1a" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M38 54 v22" stroke="#5a3810" strokeWidth="1.8" />
          {/* hanging lanterns + carpet */}
          <circle cx="60" cy="52" r="4" fill="#ffcf3c" stroke={OUT} strokeWidth="2" /><line x1="60" y1="40" x2="60" y2="48" stroke={OUT} strokeWidth="1.6" />
          <rect x="56" y="62" width="16" height="14" rx="1" fill="#c23a5a" stroke={OUT} strokeWidth="2.2" />
          <path d="M59 66 h10 M59 70 h10" stroke="#ffcf3c" strokeWidth="1.4" />
        </>);
      case 'janissary':
        return (<>
          <defs>
            <linearGradient id="ot-jan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4ece0" /><stop offset="1" stopColor="#cabfa8" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="82" rx="24" ry="4" fill="#000" opacity="0.16" />
          {/* tall börk hat with plume */}
          <path d="M38 22 C38 16 58 16 58 22 L55 42 L41 42 Z" fill="url(#ot-jan)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M38 22 L58 22 L58 15 C58 10 38 10 38 15 Z" fill="#d84a4a" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M48 15 C50 8 54 6 52 2" fill="none" stroke="#ffcf3c" strokeWidth="2.6" strokeLinecap="round" />
          {/* red robe body */}
          <path d="M48 42 L62 78 L34 78 Z" fill="#c23a3a" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M48 46 L48 76" stroke="#8a2020" strokeWidth="2" opacity="0.6" />
          <rect x="42" y="54" width="12" height="6" rx="2" fill="#ffcf3c" stroke={OUT} strokeWidth="1.8" />
          {/* yatağan sword */}
          <path d="M68 12 C58 24 54 38 54 52" fill="none" stroke="#c4cbd8" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M68 12 C58 24 54 38 54 52" fill="none" stroke={OUT2} strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
          <line x1="68" y1="12" x2="72" y2="8" stroke="#c9a15e" strokeWidth="4" strokeLinecap="round" />
        </>);
      case 'mosque':
        return (<>
          <defs>
            <radialGradient id="ot-dome" cx="0.4" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#7fe0c8" /><stop offset="1" stopColor="#2f9a84" />
            </radialGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="32" ry="4" fill="#000" opacity="0.16" />
          {/* prayer hall */}
          <rect x="20" y="46" width="56" height="32" rx="4" fill="#eef4f2" stroke={OUT2} strokeWidth="2.8" />
          {/* main dome + semidomes */}
          <path d="M26 46 A22 20 0 0 1 70 46 Z" fill="url(#ot-dome)" stroke={OUT2} strokeWidth="3" strokeLinejoin="round" />
          <path d="M20 46 a8 7 0 0 1 16 0 Z" fill="#5ac8b0" stroke={OUT2} strokeWidth="2.2" />
          <path d="M60 46 a8 7 0 0 1 16 0 Z" fill="#5ac8b0" stroke={OUT2} strokeWidth="2.2" />
          <path d="M48 16 a3 3 0 1 0 0.1 6 a2 2 0 1 1 -0.1 -6 Z" fill="#ffcf3c" stroke={OUT} strokeWidth="1.4" />
          {/* minarets */}
          {[14, 78].map((x) => (<g key={x}>
            <rect x={x - 3} y="28" width="6" height="50" rx="2" fill="#dce8e4" stroke={OUT2} strokeWidth="2.4" />
            <path d={`M${x - 3} 28 L${x} 20 L${x + 3} 28 Z`} fill="#5ac8b0" stroke={OUT2} strokeWidth="2" strokeLinejoin="round" />
            <line x1={x - 3} y1="42" x2={x + 3} y2="42" stroke="#9fc8bc" strokeWidth="1.6" />
          </g>))}
          {/* arched door + windows */}
          <path d="M42 78 L42 62 Q48 56 54 62 L54 78 Z" fill="#2f7a68" stroke={OUT2} strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="31" cy="60" r="3" fill="#bfe8de" stroke={OUT2} strokeWidth="1.6" /><circle cx="65" cy="60" r="3" fill="#bfe8de" stroke={OUT2} strokeWidth="1.6" />
        </>);
      case 'topkapi':
        return (<>
          <defs>
            <linearGradient id="ot-pal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eccb84" /><stop offset="1" stopColor="#bc9040" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="80" rx="32" ry="4" fill="#000" opacity="0.16" />
          {/* palace wall */}
          <rect x="16" y="48" width="64" height="30" rx="3" fill="url(#ot-pal)" stroke={OUT} strokeWidth="2.8" />
          {/* two pavilion towers with pointed roofs */}
          {[30, 66].map((x) => (<g key={x}>
            <rect x={x - 8} y="34" width="16" height="14" fill="#d8a84a" stroke={OUT} strokeWidth="2.4" />
            <path d={`M${x - 10} 34 L${x} 18 L${x + 10} 34 Z`} fill="#3f9a86" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" />
            <path d={`M${x} 18 l0 -5`} stroke="#ffcf3c" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx={x} cy="12" r="1.8" fill="#ffcf3c" />
            <circle cx={x} cy="41" r="2.4" fill="#bfe8de" stroke={OUT} strokeWidth="1.4" />
          </g>))}
          {/* grand gate */}
          <path d="M40 78 L40 60 Q48 52 56 60 L56 78 Z" fill="#7c4e1a" stroke={OUT} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M48 60 v18 M44 68 h8" stroke="#ffcf3c" strokeWidth="1.8" />
          <path d="M22 54 h8 M66 54 h8" stroke="#a8791a" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </>);

      // ─── Era 8: Future — RICH redraw ───
      case 'aicore':
        return (<>
          <defs>
            <radialGradient id="fu-core" cx="0.5" cy="0.45" r="0.55">
              <stop offset="0" stopColor="#eafcff" /><stop offset="0.6" stopColor="#5be0ff" /><stop offset="1" stopColor="#1aa0d8" />
            </radialGradient>
            <linearGradient id="fu-hex" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1e3358" /><stop offset="1" stopColor="#0e1a30" />
            </linearGradient>
          </defs>
          {/* hex frame */}
          <path d="M48 14 L78 31 L78 65 L48 82 L18 65 L18 31 Z" fill="url(#fu-hex)" stroke="#31d2f7" strokeWidth="3" strokeLinejoin="round" />
          {/* neural links */}
          {[[48, 22], [26, 35], [70, 35], [26, 61], [70, 61], [48, 74]].map(([x, y], i) => (
            <line key={i} x1="48" y1="48" x2={x} y2={y} stroke="#5be0ff" strokeWidth="2.6" strokeLinecap="round" opacity="0.8" />))}
          {[[48, 22], [26, 35], [70, 35], [26, 61], [70, 61], [48, 74]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="#bff2ff" stroke={OUT2} strokeWidth="2" />))}
          {/* glowing core */}
          <circle cx="48" cy="48" r="13" fill="url(#fu-core)" stroke={OUT2} strokeWidth="2.6" />
          <circle cx="48" cy="48" r="5" fill="#fff" />
        </>);
      case 'quantum':
        return (<>
          <defs>
            <radialGradient id="fu-q" cx="0.5" cy="0.45" r="0.5">
              <stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#b088ff" />
            </radialGradient>
          </defs>
          <ellipse cx="48" cy="48" rx="32" ry="12" fill="none" stroke="#c8b6ff" strokeWidth="3.4" />
          <ellipse cx="48" cy="48" rx="32" ry="12" fill="none" stroke="#8d6bff" strokeWidth="3.4" transform="rotate(60 48 48)" />
          <ellipse cx="48" cy="48" rx="32" ry="12" fill="none" stroke="#5be0ff" strokeWidth="3.4" transform="rotate(-60 48 48)" />
          {/* orbiting electrons */}
          <circle cx="16" cy="48" r="3.6" fill="#8d6bff" stroke={OUT2} strokeWidth="1.8" />
          <circle cx="72" cy="30" r="3.2" fill="#5be0ff" stroke={OUT2} strokeWidth="1.8" />
          <circle cx="72" cy="66" r="3.2" fill="#c8b6ff" stroke={OUT2} strokeWidth="1.8" />
          {/* nucleus */}
          <circle cx="48" cy="48" r="10" fill="url(#fu-q)" stroke={OUT2} strokeWidth="2.8" />
          <circle cx="45" cy="45" r="2.4" fill="#fff" opacity="0.9" />
        </>);
      case 'dyson':
        return (<>
          <defs>
            <radialGradient id="fu-sun" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff6cc" /><stop offset="1" stopColor="#ff9838" />
            </radialGradient>
          </defs>
          {/* star */}
          <circle cx="48" cy="48" r="16" fill="url(#fu-sun)" stroke={OUT} strokeWidth="2.8" />
          <circle cx="43" cy="43" r="4" fill="#fff8dc" opacity="0.8" />
          {/* orbiting collector panels */}
          <path d="M18 48 A30 30 0 0 1 33 22" fill="none" stroke="#6a7284" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M78 48 A30 30 0 0 1 63 74" fill="none" stroke="#6a7284" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M63 22 A30 30 0 0 1 77 41" fill="none" stroke="#8a92a5" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M33 74 A30 30 0 0 1 19 55" fill="none" stroke="#8a92a5" strokeWidth="6.5" strokeLinecap="round" />
          {/* panel nodes */}
          <circle cx="24" cy="30" r="2.4" fill="#5be0ff" /><circle cx="72" cy="66" r="2.4" fill="#5be0ff" />
        </>);
      case 'timeengine':
        return (<>
          <defs>
            <linearGradient id="fu-sand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe08a" /><stop offset="1" stopColor="#ffb43c" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="48" rx="32" ry="12" fill="none" stroke="#b7a6ff" strokeWidth="3" transform="rotate(-24 48 48)" opacity="0.7" />
          <ellipse cx="48" cy="48" rx="32" ry="12" fill="none" stroke="#5be0ff" strokeWidth="2.4" transform="rotate(24 48 48)" opacity="0.5" />
          {/* frame */}
          <rect x="26" y="14" width="44" height="7" rx="3.5" fill="#8d6bff" stroke={OUT2} strokeWidth="2.6" />
          <rect x="26" y="75" width="44" height="7" rx="3.5" fill="#8d6bff" stroke={OUT2} strokeWidth="2.6" />
          {/* glass hourglass */}
          <path d="M30 21 L66 21 L52 48 L66 75 L30 75 L44 48 Z" fill="rgba(200,220,255,0.25)" stroke={OUT2} strokeWidth="2.8" strokeLinejoin="round" />
          {/* glowing sand */}
          <path d="M36 24 L60 24 L48 42 Z" fill="url(#fu-sand)" />
          <path d="M48 54 L61 72 L35 72 Z" fill="url(#fu-sand)" />
          <line x1="48" y1="46" x2="48" y2="60" stroke="#ffd24a" strokeWidth="2" opacity="0.8" />
        </>);

      // ─── Galactic — RICH redraw ───
      case 'starport':
        return (<>
          <defs>
            <radialGradient id="ga-hub" cx="0.4" cy="0.35" r="0.8">
              <stop offset="0" stopColor="#8fb8ff" /><stop offset="1" stopColor="#2f4fb0" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="20" r="1.8" fill="#fff" /><circle cx="82" cy="66" r="1.8" fill="#fff" />
          {/* docking ring */}
          <ellipse cx="48" cy="48" rx="33" ry="11" fill="none" stroke="#8fb4ff" strokeWidth="5" transform="rotate(-8 48 48)" />
          <ellipse cx="48" cy="48" rx="33" ry="11" fill="none" stroke="#3a5fc0" strokeWidth="2" strokeDasharray="5 5" transform="rotate(-8 48 48)" />
          {/* central station */}
          <circle cx="48" cy="48" r="15" fill="url(#ga-hub)" stroke={OUT2} strokeWidth="3" />
          <circle cx="48" cy="48" r="6" fill="#cfe8ff" stroke={OUT2} strokeWidth="1.8" />
          {/* spokes / towers */}
          <rect x="44" y="18" width="8" height="14" rx="2" fill="#c9cdd6" stroke={OUT2} strokeWidth="2.4" />
          <rect x="44" y="64" width="8" height="14" rx="2" fill="#c9cdd6" stroke={OUT2} strokeWidth="2.4" />
          <circle cx="48" cy="18" r="2" fill="#ff5c74" /><circle cx="48" cy="78" r="2" fill="#5be0ff" />
        </>);
      case 'galfleet':
        return (<>
          <circle cx="80" cy="18" r="1.8" fill="#fff" /><circle cx="14" cy="70" r="1.8" fill="#fff" /><circle cx="22" cy="20" r="1.4" fill="#fff" />
          {/* lead cruiser */}
          <path d="M28 16 C34 22 37 34 34 48 L22 48 C19 34 22 22 28 16 Z" fill="#dfe6f2" stroke={OUT2} strokeWidth="2.8" strokeLinejoin="round" />
          <circle cx="28" cy="30" r="4" fill="#8fd6ff" stroke={OUT2} strokeWidth="2" />
          <path d="M22 48 L16 58 L27 53 Z" fill="#c4cee0" stroke={OUT2} strokeWidth="2" strokeLinejoin="round" />
          <path d="M34 48 L40 58 L29 53 Z" fill="#c4cee0" stroke={OUT2} strokeWidth="2" strokeLinejoin="round" />
          <path d="M24 53 Q28 66 32 53 Z" fill="#ff9838" stroke={OUT} strokeWidth="1.8" strokeLinejoin="round" />
          {/* escort ship */}
          <path d="M60 36 C64 40 66 48 64 58 L52 58 C50 48 52 40 56 36 Z" fill="#c9cdd6" stroke={OUT2} strokeWidth="2.6" strokeLinejoin="round" />
          <circle cx="58" cy="46" r="3" fill="#8fd6ff" stroke={OUT2} strokeWidth="1.6" />
          <path d="M55 58 Q58 68 61 58 Z" fill="#ff9838" stroke={OUT} strokeWidth="1.6" strokeLinejoin="round" />
        </>);
      case 'ringworld':
        return (<>
          <defs>
            <radialGradient id="ga-star" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff6cc" /><stop offset="1" stopColor="#ffd24a" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="20" r="1.8" fill="#fff" /><circle cx="80" cy="74" r="1.8" fill="#fff" />
          {/* central star */}
          <circle cx="48" cy="48" r="12" fill="url(#ga-star)" stroke={OUT} strokeWidth="2.6" />
          {/* the megastructure ring (front + back) */}
          <ellipse cx="48" cy="48" rx="35" ry="13" fill="none" stroke="#4a9aa8" strokeWidth="7" transform="rotate(-20 48 48)" />
          <ellipse cx="48" cy="48" rx="35" ry="13" fill="none" stroke="#7fd0d8" strokeWidth="4" transform="rotate(-20 48 48)" />
          <ellipse cx="48" cy="48" rx="35" ry="13" fill="none" stroke="#bfeef0" strokeWidth="1.6" strokeDasharray="3 4" transform="rotate(-20 48 48)" />
          <circle cx="48" cy="45" r="3" fill="#fff8dc" opacity="0.8" />
        </>);
      case 'nebula':
        return (<>
          <defs>
            <radialGradient id="ga-neb" cx="0.45" cy="0.45" r="0.6">
              <stop offset="0" stopColor="#f0a0ff" /><stop offset="1" stopColor="#7a2fb0" />
            </radialGradient>
          </defs>
          {/* nebula cloud */}
          <path d="M20 42 C15 28 32 18 46 25 C55 16 72 21 73 35 C84 40 81 58 67 59 C62 72 44 74 38 62 C25 64 15 53 20 42 Z" fill="url(#ga-neb)" stroke={OUT2} strokeWidth="2.6" strokeLinejoin="round" opacity="0.92" />
          <path d="M32 40 C30 32 40 30 46 34 C52 30 60 35 58 44 C56 52 46 55 40 50 C33 52 30 46 32 40 Z" fill="#e0a8ff" opacity="0.7" />
          {/* newborn star + sparkles */}
          <circle cx="46" cy="42" r="4.5" fill="#fff6cc" />
          <path d="M46 34 v-4 M46 50 v4 M38 42 h-4 M54 42 h4" stroke="#fff2c0" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
          <circle cx="62" cy="30" r="2" fill="#fff" /><circle cx="28" cy="58" r="1.8" fill="#fff" /><circle cx="72" cy="52" r="1.6" fill="#fff" />
        </>);

      // ─── Cosmic — RICH redraw ───
      case 'wormhole':
        return (<>
          <defs>
            <radialGradient id="co-worm" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#1a0a40" /><stop offset="0.7" stopColor="#5a2fd0" /><stop offset="1" stopColor="#b088ff" />
            </radialGradient>
          </defs>
          <circle cx="78" cy="22" r="1.8" fill="#fff" /><circle cx="18" cy="72" r="1.8" fill="#fff" />
          {/* funnel rings */}
          <ellipse cx="48" cy="48" rx="33" ry="31" fill="url(#co-worm)" stroke="#8d6bff" strokeWidth="4" />
          <ellipse cx="48" cy="48" rx="26" ry="24" fill="none" stroke="#b088ff" strokeWidth="3" opacity="0.8" />
          <ellipse cx="48" cy="48" rx="17" ry="15" fill="none" stroke="#d0b8ff" strokeWidth="2.4" opacity="0.7" />
          {/* singular center */}
          <circle cx="48" cy="48" r="6" fill="#1a0a30" stroke="#e6dcff" strokeWidth="2" />
          <circle cx="48" cy="48" r="2" fill="#fff" />
        </>);
      case 'multiverse':
        return (<>
          <defs>
            <radialGradient id="co-b1" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#7fb8ff" /><stop offset="1" stopColor="#2f5fc0" /></radialGradient>
            <radialGradient id="co-b2" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#c8a0ff" /><stop offset="1" stopColor="#6a2fc0" /></radialGradient>
            <radialGradient id="co-b3" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#7ff0d8" /><stop offset="1" stopColor="#2f9a80" /></radialGradient>
          </defs>
          {/* nested bubble universes */}
          <circle cx="34" cy="38" r="19" fill="url(#co-b1)" stroke={OUT2} strokeWidth="2.8" opacity="0.95" />
          <circle cx="62" cy="52" r="15" fill="url(#co-b2)" stroke={OUT2} strokeWidth="2.8" opacity="0.95" />
          <circle cx="44" cy="66" r="11" fill="url(#co-b3)" stroke={OUT2} strokeWidth="2.6" opacity="0.95" />
          {/* mini galaxies inside */}
          <path d="M30 34 q8 -2 8 6" fill="none" stroke="#dff" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
          <circle cx="28" cy="32" r="2" fill="#fff" opacity="0.9" /><circle cx="66" cy="48" r="1.8" fill="#fff" opacity="0.9" />
        </>);
      case 'singularity':
        return (<>
          <defs>
            <linearGradient id="co-disk" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ff7a1c" /><stop offset="0.5" stopColor="#ffd24a" /><stop offset="1" stopColor="#ff7a1c" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="20" r="1.8" fill="#fff" /><circle cx="78" cy="72" r="1.8" fill="#fff" />
          {/* accretion disk */}
          <ellipse cx="48" cy="48" rx="34" ry="12" fill="none" stroke="url(#co-disk)" strokeWidth="7" transform="rotate(-18 48 48)" />
          <ellipse cx="48" cy="48" rx="34" ry="12" fill="none" stroke="#fff0b0" strokeWidth="2" transform="rotate(-18 48 48)" opacity="0.6" />
          {/* event horizon */}
          <circle cx="48" cy="48" r="15" fill="#0a0416" stroke="#c0a0ff" strokeWidth="2.4" />
          <circle cx="48" cy="48" r="15" fill="none" stroke="#ffb060" strokeWidth="1.4" opacity="0.5" />
        </>);
      case 'godcore':
        return (<>
          <defs>
            <radialGradient id="co-god" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff" /><stop offset="0.5" stopColor="#fff2a0" /><stop offset="1" stopColor="#ffb43c" />
            </radialGradient>
          </defs>
          {/* radiant rays */}
          {[0, 30, 60, 90, 120, 150].map((a) => (
            <line key={a} x1="48" y1="10" x2="48" y2="86" stroke="#ffe08a" strokeWidth="3" strokeLinecap="round" transform={`rotate(${a} 48 48)`} opacity="0.6" />
          ))}
          {/* halo ring */}
          <circle cx="48" cy="48" r="23" fill="none" stroke="#ffd24a" strokeWidth="2" opacity="0.5" />
          {/* divine core */}
          <circle cx="48" cy="48" r="18" fill="url(#co-god)" stroke={OUT} strokeWidth="2.6" />
          <circle cx="48" cy="48" r="9" fill="#fff8dc" />
          <circle cx="48" cy="48" r="3.5" fill="#fff" />
          <circle cx="42" cy="42" r="2" fill="#fff" opacity="0.9" />
        </>);

      default:
        return null;
    }
  })();

  const P = `ic-${id}`;
  return (
    <svg {...props}>
      <IconDefs id={id} />
      {/* badge base */}
      <rect x="3" y="3" width="90" height="90" rx="25" fill={`url(#${P}-bg)`} stroke="rgba(0,0,0,0.28)" strokeWidth="2" />
      {/* subject clipped so nothing spills past the badge */}
      <g clipPath={`url(#${P}-clip)`}>
        {scene}
        {/* lighting overlays */}
        <rect x="3" y="3" width="90" height="90" rx="25" fill={`url(#${P}-vig)`} />
        <rect x="3" y="3" width="90" height="90" rx="25" fill={`url(#${P}-gloss)`} />
        <ellipse cx="33" cy="21" rx="27" ry="16" fill={`url(#${P}-shine)`} opacity="0.65" />
      </g>
      {/* crisp inner rim highlight */}
      <rect x="4.6" y="4.6" width="86.8" height="86.8" rx="22.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" />
    </svg>
  );
}
