// Cloud backup service — protects against progress loss on reinstall / device change.
//
// Real cloud uses Firebase Firestore's REST API (no SDK, tiny, works in the Capacitor
// WebView). Fill CLOUD_CONFIG with your Firebase project id + Web API key to enable it —
// same pattern as the real AdMob ids. Until then it falls back to a LOCAL mock (localStorage)
// so the whole Backup / Restore-by-code flow is fully functional for testing; only actual
// cross-device sync needs the real config.
//
// Firestore security rule to allow anonymous code-keyed backups (add in the Firebase console):
//   match /saves/{code} { allow read, write: if true; }
// Codes are unguessable random tokens, and saves hold no personal data, so this is acceptable
// for a backup feature. Tighten with App Check if you want extra protection.

export const CLOUD_CONFIG = {
  firebaseProjectId: 'chrono-empire-f371b',
  firebaseApiKey: 'AIzaSyDRiV-JeQD9iDluZPzCTyOTfgB9yAVLShg', // public Firebase Web API key (safe in client)
};

export function isCloudConfigured(): boolean {
  return CLOUD_CONFIG.firebaseProjectId.length > 0 && CLOUD_CONFIG.firebaseApiKey.length > 0;
}

/** true when using the local mock (no real cross-device sync yet) */
export function isCloudMock(): boolean {
  return !isCloudConfigured();
}

export interface CloudResult {
  ok: boolean;
  /** save JSON payload (only on a successful pull) */
  data?: string;
  error?: string;
}

const MOCK_PREFIX = 'chrono_cloud::';

function docUrl(code: string): string {
  const { firebaseProjectId, firebaseApiKey } = CLOUD_CONFIG;
  const path = `projects/${firebaseProjectId}/databases/(default)/documents/saves/${encodeURIComponent(code)}`;
  return `https://firestore.googleapis.com/v1/${path}?key=${firebaseApiKey}`;
}

/** Upload a save payload to the code's cloud slot. */
export async function cloudPush(code: string, json: string): Promise<CloudResult> {
  if (isCloudMock()) {
    try {
      localStorage.setItem(MOCK_PREFIX + code, JSON.stringify({ data: json, updatedAt: Date.now() }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }
  try {
    const body = {
      fields: {
        data: { stringValue: json },
        updatedAt: { integerValue: String(Date.now()) },
      },
    };
    const res = await fetch(docUrl(code), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Download the save payload stored under a code (null data if the slot is empty). */
export async function cloudPull(code: string): Promise<CloudResult> {
  if (isCloudMock()) {
    try {
      const raw = localStorage.getItem(MOCK_PREFIX + code);
      if (!raw) return { ok: false, error: 'empty' };
      const parsed = JSON.parse(raw);
      return { ok: true, data: parsed.data };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }
  try {
    const res = await fetch(docUrl(code), { method: 'GET' });
    if (res.status === 404) return { ok: false, error: 'empty' };
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const doc = await res.json();
    const data = doc?.fields?.data?.stringValue;
    if (typeof data !== 'string') return { ok: false, error: 'empty' };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
