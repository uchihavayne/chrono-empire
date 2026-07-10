// In-app purchase service (RevenueCat). Second monetization leg beside rewarded ads.
//
// SETUP (your side, like the AdMob ids):
//   1. Create products in App Store Connect / Google Play Console with the ids in PRODUCTS.
//   2. Create a RevenueCat project, add those products, and paste the public SDK keys below.
//   3. For the non-consumables (remove_ads, starter_pack) create RevenueCat *entitlements*
//      with ids matching ENTITLEMENT_* so restore can re-grant them.
// Until keys are filled, purchases are SIMULATED on-device too (so you can wire the UI first).
// On the web build purchases are always simulated via the registered callback (like ads).

import { Capacitor } from '@capacitor/core';

export const IAP_CONFIG = {
  revenueCatApiKeyIos: '',      // 'appl_...'
  revenueCatApiKeyAndroid: '',  // 'goog_...'
};

export const ENTITLEMENT_REMOVE_ADS = 'remove_ads';
export const ENTITLEMENT_STARTER = 'starter_pack';

export type IapKind = 'noncon' | 'consumable';

export interface ProductDef {
  id: string;
  kind: IapKind;
  /** consumable payout: chrono crystals granted on purchase */
  crystals?: number;
  /** emoji shown on the store card */
  icon: string;
}

// Store-facing product ids. Keep these in sync with the stores + RevenueCat.
export const PRODUCTS: ProductDef[] = [
  { id: 'remove_ads',   kind: 'noncon',     icon: '🚫' },
  { id: 'starter_pack', kind: 'noncon',     icon: '🎁' },
  { id: 'crystals_100', kind: 'consumable', crystals: 100,  icon: '💎' },
  { id: 'crystals_600', kind: 'consumable', crystals: 600,  icon: '💠' },
  { id: 'crystals_2000', kind: 'consumable', crystals: 2000, icon: '🔮' },
];

export const PRODUCT_BY_ID: Record<string, ProductDef> = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

export function iapConfigured(): boolean {
  return IAP_CONFIG.revenueCatApiKeyIos.length > 0 || IAP_CONFIG.revenueCatApiKeyAndroid.length > 0;
}

/** Whether to show the shop UI at all. On a native store build we hide it until real IAP is
 *  configured, so Apple/Google never see non-functional purchase buttons (an instant rejection).
 *  On the web build it stays visible for testing via the simulated purchase flow. */
export function shopVisible(): boolean {
  return !Capacitor.isNativePlatform() || iapConfigured();
}

let initialized = false;

/** UI registers a simulated purchase flow for web / unconfigured testing. */
let simulatePurchase: ((id: string) => Promise<boolean>) | null = null;
export function registerPurchaseSimulator(fn: (id: string) => Promise<boolean>): void {
  simulatePurchase = fn;
}

async function initRC(): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || !iapConfigured()) return false;
  if (initialized) return true;
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const apiKey = Capacitor.getPlatform() === 'ios'
      ? IAP_CONFIG.revenueCatApiKeyIos
      : IAP_CONFIG.revenueCatApiKeyAndroid;
    if (!apiKey) return false;
    await Purchases.configure({ apiKey });
    initialized = true;
    return true;
  } catch {
    return false;
  }
}

export interface PurchaseResult {
  ok: boolean;
  /** true when the store flow was simulated rather than a real charge */
  simulated?: boolean;
  error?: string;
}

/** Fetch localized prices keyed by product id (empty when not on a real store). */
export async function getPrices(): Promise<Record<string, string>> {
  const ready = await initRC();
  if (!ready) return {};
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { products } = await Purchases.getProducts({ productIdentifiers: PRODUCTS.map((p) => p.id) });
    const out: Record<string, string> = {};
    for (const p of products) out[p.identifier] = p.priceString;
    return out;
  } catch {
    return {};
  }
}

/** Purchase a product. Grants happen in the engine when this resolves ok. */
export async function purchase(id: string): Promise<PurchaseResult> {
  const real = await initRC();
  if (!real) {
    // web build → simulate through the UI. On a native build without RC keys we must NOT
    // grant anything (the shop is hidden there anyway) — never hand out free purchases.
    if (!Capacitor.isNativePlatform() && simulatePurchase) {
      const ok = await simulatePurchase(id);
      return { ok, simulated: true };
    }
    return { ok: false, error: 'not-configured' };
  }
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { products } = await Purchases.getProducts({ productIdentifiers: [id] });
    const product = products[0];
    if (!product) return { ok: false, error: 'product-unavailable' };
    await Purchases.purchaseStoreProduct({ product });
    return { ok: true };
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (err?.code === 'PURCHASE_CANCELLED') return { ok: false, error: 'cancelled' };
    return { ok: false, error: err?.message ?? 'failed' };
  }
}

/** Restore non-consumable purchases. Returns the entitlement ids currently active. */
export async function restore(): Promise<string[]> {
  const real = await initRC();
  if (!real) return [];
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { customerInfo } = await Purchases.restorePurchases();
    return Object.keys(customerInfo.entitlements.active);
  } catch {
    return [];
  }
}
