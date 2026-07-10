// Rewarded ad service.
// On iOS/Android (Capacitor) it uses AdMob rewarded ads.
// On the web (localhost testing) it falls back to a simulated ad dialog
// handled by the UI layer via the `simulateAd` callback.

import { Capacitor } from '@capacitor/core';

// Real iOS rewarded ad unit. Android still uses Google's TEST unit until an
// Android AdMob app + ad unit is created (do this before Google Play submission).
const REWARDED_ID_IOS = 'ca-app-pub-3323428505450637/6673899725';
const REWARDED_ID_ANDROID = 'ca-app-pub-3940256099942544/5224354917';

let initialized = false;

/** UI layer registers a simulated-ad implementation for web testing. */
let simulateAd: (() => Promise<boolean>) | null = null;
export function registerAdSimulator(fn: () => Promise<boolean>): void {
  simulateAd = fn;
}

async function initAdMob(): Promise<void> {
  if (initialized) return;
  const { AdMob } = await import('@capacitor-community/admob');
  // iOS App Tracking Transparency: Apple requires this prompt before an app may use the
  // advertising identifier for personalized ads. If the user declines (or on Android), AdMob
  // automatically serves non-personalized ads instead. Needs NSUserTrackingUsageDescription
  // in the iOS Info.plist (see the publish checklist).
  if (Capacitor.getPlatform() === 'ios') {
    try {
      const status = await AdMob.trackingAuthorizationStatus();
      if (status.status === 'notDetermined') {
        await AdMob.requestTrackingAuthorization();
      }
    } catch { /* older iOS or unavailable — continue with non-personalized ads */ }
  }
  await AdMob.initialize({ initializeForTesting: false });
  initialized = true;
}

/**
 * Shows a rewarded ad. Resolves true if the user earned the reward,
 * false if the ad was closed early or failed to load.
 */
export async function showRewardedAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    if (simulateAd) return simulateAd();
    return true;
  }
  try {
    await initAdMob();
    const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');
    const adId = Capacitor.getPlatform() === 'ios' ? REWARDED_ID_IOS : REWARDED_ID_ANDROID;

    return await new Promise<boolean>(async (resolve) => {
      let rewarded = false;
      const rewardSub = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        rewarded = true;
      });
      const dismissSub = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        rewardSub.remove();
        dismissSub.remove();
        resolve(rewarded);
      });
      try {
        await AdMob.prepareRewardVideoAd({ adId });
        await AdMob.showRewardVideoAd();
      } catch {
        rewardSub.remove();
        dismissSub.remove();
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}
