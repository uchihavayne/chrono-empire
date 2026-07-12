# Idle Chrono Empire 🕰️

A time-travel **idle / tycoon** game — start a campfire in the Stone Age and grow it into a
galaxy-spanning empire. Vite + React + TypeScript + Capacitor. iOS-first, Android-ready.

> Live on TestFlight · App Store name: **Idle Chrono Empire** · bundle `com.chronoempire.game`

## Features

- **18 historical eras · 76 businesses** — from the first campfire and the early Turkic steppe to
  Ancient Egypt, Rome, the Ottoman court, the Industrial Revolution, the Space Age and the birth of
  galaxies. Each era is unlocked with cash and brings new businesses, art and a themed background.
- **Idle income** — your empire keeps earning while the app is closed (offline earnings + a catch-up
  report on return).
- **Card / gacha system** — open loot boxes to collect cards; cards auto-run your businesses
  (managers) and boost their profit. Free daily box + rewarded-ad boxes + gem boxes.
- **Two prestige layers** — *Rebirth* for Chrono Crystals (permanent income boost + a skill tree),
  then *Ascension* for Eon Crystals once you've rebirthed enough.
- **Live-ops & rewards** — timed Golden Hour events, Golden Rush comets, time anomalies, a 57-step
  quest chain, achievements, daily-reward streak, and a global leaderboard.
- **Cloud backup** — restore your empire on any device via an anonymous backup code (Firebase).
- **12 languages** — EN, TR, ZH, HI, ES, FR, AR (RTL), PT, RU, JA, DE, KO. Auto-detects device
  language.
- **Monetization** — AdMob rewarded ads (all optional) + in-app purchases (No-Ads Pass, Starter
  Pack, gem packs). Ads are simulated on web/desktop for testing.

## Develop (test on PC)

```bash
npm install
npm run dev        # http://localhost:5199
```

## iOS build & publish

Built on a cloud Mac via **Codemagic** (the `ios/` project is committed and `codemagic.yaml`
drives archive → App Store Connect / TestFlight), so a local Mac is not required. Push to `main`
and start a build in Codemagic.

## Architecture

- `src/game/data.ts` — all balance data (eras, businesses, cards, prestige, quests, achievements, events)
- `src/game/engine.ts` — game loop, save/load, offline progress, prestige math (exposed as `window.__engine` in dev)
- `src/game/cards.ts` — card / loot-box model
- `src/i18n/` — the 12-language dictionaries
- `src/services/` — ads (AdMob), iap (RevenueCat), cloud + leaderboard (Firebase), notifications, audio
- `src/components/` — tabs (Empire / Cards / Time Rift / More) and modals

## Legal

- Privacy Policy: https://uchihavayne.github.io/chrono-empire/privacy.html
- Support: https://uchihavayne.github.io/chrono-empire/
