// Global leaderboard — shares the same Firebase backend as cloud.ts (fill CLOUD_CONFIG to
// go live). Until configured it uses a localStorage MOCK seeded with a few demo entries so
// the UI is fully testable; real global ranking activates with the Firebase config.
//
// Firestore rule (add alongside the saves rule):
//   match /scores/{code} { allow read, write: if true; }
// Scores are public and hold only a display name + number, so open access is fine.

import { CLOUD_CONFIG, isCloudConfigured } from './cloud';

export interface LbEntry {
  name: string;
  score: number;
  me?: boolean;
}

const MOCK_PREFIX = 'chrono_lb::';

// Demo names so the mock board doesn't look empty before real players exist.
const DEMO: LbEntry[] = [
  { name: 'ChronoKing', score: 48200 }, { name: 'TimeLord99', score: 31500 },
  { name: 'EonMaster', score: 22750 }, { name: 'RiftRunner', score: 14100 },
  { name: 'Nomad_Ata', score: 9300 }, { name: 'PyramidPro', score: 5600 },
  { name: 'SteppeWolf', score: 3100 }, { name: 'GalaxyBrain', score: 1450 },
];

function baseUrl(): string {
  return `https://firestore.googleapis.com/v1/projects/${CLOUD_CONFIG.firebaseProjectId}/databases/(default)/documents`;
}

/** Submit (upsert) the player's score under their cloud code. */
export async function submitScore(code: string, name: string, score: number): Promise<boolean> {
  const safeName = (name || 'Player').slice(0, 16);
  if (!isCloudConfigured()) {
    try { localStorage.setItem(MOCK_PREFIX + code, JSON.stringify({ name: safeName, score })); return true; }
    catch { return false; }
  }
  try {
    const body = { fields: { name: { stringValue: safeName }, score: { integerValue: String(Math.floor(score)) } } };
    const res = await fetch(`${baseUrl()}/scores/${encodeURIComponent(code)}?key=${CLOUD_CONFIG.firebaseApiKey}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    return res.ok;
  } catch { return false; }
}

/** Fetch the top N scores, highest first. Marks the caller's own row via `myCode`. */
export async function topScores(limit = 20, myCode?: string): Promise<LbEntry[]> {
  if (!isCloudConfigured()) {
    const entries: (LbEntry & { code: string })[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(MOCK_PREFIX)) continue;
      try { const v = JSON.parse(localStorage.getItem(k)!); entries.push({ name: v.name, score: v.score, code: k.slice(MOCK_PREFIX.length) }); } catch { /* skip */ }
    }
    const merged = [...DEMO.map((e) => ({ ...e, code: '' })), ...entries];
    merged.sort((a, b) => b.score - a.score);
    return merged.slice(0, limit).map((e) => ({ name: e.name, score: e.score, me: !!myCode && e.code === myCode }));
  }
  try {
    const q = {
      structuredQuery: {
        from: [{ collectionId: 'scores' }],
        orderBy: [{ field: { fieldPath: 'score' }, direction: 'DESCENDING' }],
        limit,
      },
    };
    const res = await fetch(`${baseUrl()}:runQuery?key=${CLOUD_CONFIG.firebaseApiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q),
    });
    if (!res.ok) return [];
    const rows = await res.json();
    const out: LbEntry[] = [];
    for (const r of rows) {
      const doc = r.document;
      if (!doc) continue;
      const name = doc.fields?.name?.stringValue ?? 'Player';
      const score = Number(doc.fields?.score?.integerValue ?? 0);
      const code = doc.name?.split('/').pop();
      out.push({ name, score, me: !!myCode && code === myCode });
    }
    return out;
  } catch { return []; }
}
