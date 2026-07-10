// Local notification service — the #1 retention lever for idle games.
// Schedules "come back, your managers earned X" reminders while the player is away.
// Native only (Capacitor); a no-op on the web build. Uses @capacitor/local-notifications.

import { Capacitor } from '@capacitor/core';

let permissionAsked = false;

// Fixed ids so we can cancel/replace the retention set without touching other notifications.
const RETENTION_IDS = [9001, 9002, 9003];

export interface ReminderCopy {
  title: string;
  body: string;
}

async function ensurePermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted' && !permissionAsked) {
      permissionAsked = true;
      perm = await LocalNotifications.requestPermissions();
    }
    return perm.display === 'granted';
  } catch {
    return false;
  }
}

/**
 * (Re)schedule the away-reminder set. Call on background/save with localized copy.
 * `copy[i]` pairs with reminders at +8h, +24h, +72h. Missing entries are skipped.
 */
export async function scheduleRetention(copy: ReminderCopy[]): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const ok = await ensurePermission();
  if (!ok) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    // clear the previous set first so timers don't stack up
    await LocalNotifications.cancel({ notifications: RETENTION_IDS.map((id) => ({ id })) });
    const HOUR = 3600 * 1000;
    const delays = [8 * HOUR, 24 * HOUR, 72 * HOUR];
    const now = Date.now();
    const notifications = delays.slice(0, copy.length).map((d, i) => ({
      id: RETENTION_IDS[i],
      title: copy[i].title,
      body: copy[i].body,
      schedule: { at: new Date(now + d) },
      // no custom smallIcon → the plugin uses the app's default launcher icon.
      // For polish, add a monochrome `res/drawable/ic_stat_icon.png` and set it here.
    }));
    if (notifications.length) await LocalNotifications.schedule({ notifications });
  } catch {
    /* scheduling unavailable — ignore */
  }
}

/** Cancel pending away-reminders (call when the app returns to the foreground). */
export async function cancelRetention(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({ notifications: RETENTION_IDS.map((id) => ({ id })) });
  } catch {
    /* ignore */
  }
}
