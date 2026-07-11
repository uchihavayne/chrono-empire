# Chrono Empire — Publish Checklist

Status as of the latest commit. The **code is publish-ready**; what remains is account/store
setup that only you can do (Apple, Codemagic, RevenueCat).

---

## ✅ Done (in the code / repo)

| Item | Status |
|---|---|
| Game complete | 18 eras · 76 ventures · card/gacha system · 2 prestige layers · quests · achievements · events |
| Cloud backup + Leaderboard | **LIVE** — Firebase configured (`src/services/cloud.ts`), Firestore rules set |
| iOS AdMob | Real app id + rewarded unit configured (`capacitor.config.ts`, `src/services/ads.ts`) |
| iOS ATT prompt | Implemented (needs `NSUserTrackingUsageDescription` in Info.plist — see below) |
| App icon + splash | `resources/icon.png` (1024) + `resources/splash.png` — run `@capacitor/assets generate` |
| Privacy policy | `public/privacy.html` (host it, use the URL in the store listing) |
| Music + SFX | Looping soundtrack, independent Music/SFX toggles |
| 12 languages | EN/TR full + 10 more |
| App Store screenshots | `appstore-shots/` (6.7"/6.9" + 6.5", exact sizes) |
| Version | 1.0.0 |

---

## ⏳ Your remaining steps

### 1. App Store Connect app record  ✅ (you created it — bundle `com.chronoempire.game`)

### 2. Build & submit via Codemagic  → **this ships the app**
Repo is on GitHub: https://github.com/uchihavayne/chrono-empire  (`codemagic.yaml` included)
1. [codemagic.io](https://codemagic.io) → sign in with GitHub → add the `chrono-empire` app.
2. Team → Integrations → **App Store Connect** → add your API key (App Store Connect →
   Users and Access → Integrations → App Store Connect API → generate). Name it **`Chrono Empire ASC`**.
3. Code signing → iOS → let Codemagic manage signing automatically.
4. **Start build** → it archives on a cloud Mac and uploads to **TestFlight**.

### 3. iOS Info.plist (one line, after `cap add ios` — Codemagic uses the checked-in project)
Add key `NSUserTrackingUsageDescription` = `We use your device's ad identifier to show you relevant rewarded ads.`

### 4. IAP (optional for v1 — the shop auto-hides until this is done, so submission is safe without it)
- Create products in App Store Connect: `remove_ads`, `starter_pack`, `gems_small`, `gems_medium`, `gems_large`.
- RevenueCat: create project, paste the public SDK keys into `src/services/iap.ts` `IAP_CONFIG`,
  create entitlements `remove_ads` + `starter_pack`.

### 5. Android (later)
- Create an Android app in AdMob → put its app id in `capacitor.config.ts` `appIdAndroid`
  and the rewarded unit id in `src/services/ads.ts` `REWARDED_ID_ANDROID` (currently Google TEST ids).
- Then `npx cap add android && npx cap sync` and build via Codemagic/Play Console.

---

## Store listing assets
- **Screenshots:** `appstore-shots/6.7-and-6.9inch/` and `appstore-shots/6.5inch/` (regenerate with
  `node scripts/gen-screenshots.mjs` while the dev server runs, if you tweak `public/appstore.html`).
- **Privacy URL:** host `public/privacy.html` anywhere public (e.g. GitHub Pages) and paste the URL.
- **App icon** for the listing: `resources/icon.png`.
