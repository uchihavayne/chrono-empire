// Lightweight analytics over the GA4 Measurement Protocol (REST — same "no SDK, works in the
// Capacitor WebView" spirit as cloud.ts). Fill ANALYTICS_CONFIG with a GA4 Measurement ID + API
// secret to start collecting; until then events are no-ops (but still buffered in-memory so they
// can be inspected while testing). No native Firebase SDK or google-services files required.
//
// To enable (Firebase console → Analytics → Data Streams → your web/app stream):
//   measurementId: the stream's "G-XXXXXXXXXX"
//   apiSecret:     Admin → Measurement Protocol API secrets → create
// Key funnel/retention events are logged from the engine (session_start, era_unlock, rebirth,
// ascension, iap_purchase, ad_view, tutorial_done). GA4 then derives D1/D7 retention & funnels.

export const ANALYTICS_CONFIG = {
  measurementId: '', // e.g. 'G-XXXXXXXXXX'
  apiSecret: '',     // GA4 Measurement Protocol API secret
};

export function isAnalyticsEnabled(): boolean {
  return ANALYTICS_CONFIG.measurementId.length > 0 && ANALYTICS_CONFIG.apiSecret.length > 0;
}

type Params = Record<string, string | number | boolean>;

const CID_KEY = 'chrono_analytics_cid';
const FIRST_KEY = 'chrono_analytics_first';

/** stable per-install id (GA4 client_id) */
function clientId(): string {
  let cid: string | null = null;
  try { cid = localStorage.getItem(CID_KEY); } catch { /* storage blocked */ }
  if (!cid) {
    cid = `${Date.now()}.${Math.floor(Math.random() * 1e9)}`;
    try { localStorage.setItem(CID_KEY, cid); } catch { /* ignore */ }
  }
  return cid;
}

// last events kept in memory so tests / a debug panel can confirm instrumentation fires even when
// no real GA endpoint is configured.
const recent: { name: string; params: Params; t: number }[] = [];
export function recentEvents(): ReadonlyArray<{ name: string; params: Params; t: number }> {
  return recent;
}

/** Log an analytics event. Never throws, never blocks gameplay. */
export function logEvent(name: string, params: Params = {}): void {
  try {
    recent.push({ name, params, t: Date.now() });
    if (recent.length > 50) recent.shift();
    if (!isAnalyticsEnabled()) return;
    const body = JSON.stringify({
      client_id: clientId(),
      events: [{ name, params: { ...params, engagement_time_msec: 1 } }],
    });
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
      ANALYTICS_CONFIG.measurementId,
    )}&api_secret=${encodeURIComponent(ANALYTICS_CONFIG.apiSecret)}`;
    // fire-and-forget; keepalive lets the request survive the app being backgrounded
    fetch(url, { method: 'POST', body, keepalive: true }).catch(() => {});
  } catch {
    /* analytics must never break the game */
  }
}

/** Fire session_start every launch, plus first_open exactly once per install. */
export function logSession(): void {
  let first = false;
  try { first = !localStorage.getItem(FIRST_KEY); } catch { /* ignore */ }
  if (first) {
    try { localStorage.setItem(FIRST_KEY, String(Date.now())); } catch { /* ignore */ }
    logEvent('first_open');
  }
  logEvent('session_start');
}
