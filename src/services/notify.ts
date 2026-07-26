// Local notification service — the #1 retention lever for idle games.
// Schedules game-state-aware "come back" reminders while the player is away:
// offline cap reached, daily reward + wheel ready, festival ending, long-idle nudge.
// Native only (Capacitor); a no-op on the web build. Uses @capacitor/local-notifications.

import { Capacitor } from '@capacitor/core';

let permissionAsked = false;

// Fixed ids so we can cancel/replace the reminder set without touching other notifications.
const REMINDER_IDS = [9001, 9002, 9003, 9004];

export interface Reminder {
  id: number;
  title: string;
  body: string;
  /** absolute epoch-ms fire time */
  at: number;
}

async function ensurePermission(ask: boolean): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted' && ask && !permissionAsked) {
      permissionAsked = true;
      perm = await LocalNotifications.requestPermissions();
    }
    return perm.display === 'granted';
  } catch {
    return false;
  }
}

/** Ask the OS for notification permission (call when the player opts in). Returns granted. */
export async function requestNotifPermission(): Promise<boolean> {
  return ensurePermission(true);
}

/**
 * (Re)schedule the away-reminder set with the given absolute fire times. Call on background
 * with localized copy computed from the current game state. Past / too-soon items are dropped;
 * the previous set is cleared first so timers never stack.
 */
export async function scheduleReminders(items: Reminder[]): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const ok = await ensurePermission(true);
  if (!ok) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({ notifications: REMINDER_IDS.map((id) => ({ id })) });
    const min = Date.now() + 60_000; // at least 1 minute out
    const notifications = items
      .filter((it) => it.at > min)
      .map((it) => ({
        id: it.id,
        title: it.title,
        body: it.body,
        schedule: { at: new Date(it.at) },
        // no custom smallIcon → the plugin uses the app's default launcher icon.
      }));
    if (notifications.length) await LocalNotifications.schedule({ notifications });
  } catch {
    /* scheduling unavailable — ignore */
  }
}

/** Cancel pending away-reminders (call when the app returns to the foreground). */
export async function cancelReminders(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({ notifications: REMINDER_IDS.map((id) => ({ id })) });
  } catch {
    /* ignore */
  }
}
