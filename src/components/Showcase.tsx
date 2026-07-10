// Temporary full icon gallery. Reachable at ?showcase=1 for design review.

import { GENERATORS, ERAS, TOTAL_VENTURES } from '../game/data';
import { CartoonIcon } from './iconsCartoon';
import { makeT } from '../i18n';

const t = makeT('tr');

export function Showcase() {
  return (
    <div className="app era-space" style={{ overflowY: 'auto' }}>
      <div style={{ padding: '18px 14px 60px' }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, textAlign: 'center', marginBottom: 4 }}>
          {TOTAL_VENTURES} İşletme — Yeni Çizgi-film Stili
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 12.5, marginBottom: 8 }}>
          {ERAS.length} çağ · tarih öncesinden kozmik çağa
        </p>

        {ERAS.map((era, ei) => (
          <div key={era.id}>
            <h2 style={{ fontSize: 14, fontWeight: 800, margin: '20px 0 10px', color: 'var(--gold)' }}>
              {era.icon} {t(`era_${era.id}`)}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, justifyItems: 'center' }}>
              {GENERATORS.filter((g) => g.era === ei).map((g) => (
                <div key={g.id} style={{ textAlign: 'center' }}>
                  <CartoonIcon id={g.id} size={72} />
                  <div style={{ fontSize: 9.5, fontWeight: 700, marginTop: 3, color: 'var(--text-dim)', lineHeight: 1.15 }}>
                    {t(`gen_${g.id}`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
