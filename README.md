# Chrono Empire — Zaman İmparatorluğu 🕰️

Zaman yolculuğu temalı idle/tycoon oyunu (AdVenture Capitalist tarzı, yeni mekaniklerle).
Vite + React + TypeScript + Capacitor. iOS öncelikli, Android destekli.

## Özellikler

- **9 bölüm (çağ) = 9 dünya**: Taş Devri → Antik Mısır → Roma → Orta Çağ → Rönesans → Sanayi → Modern → Uzay → Uzak Gelecek. Her çağ parayla açılır; açınca **4 yeni işletme + kalıcı ×2 global çarpan + yeni tema** gelir.
- **36 işletme** (çağ başına 4), kilometre taşı çarpanları (10/25/50/100/200… adette ×2), yöneticilerle tam otomasyon. Her işletme için el çizimi SVG ikon.
- **118 yükseltme** (işletme bazlı ×3/×3/×5 + 10 global çarpan).
- **Denge modeli**: çağ maliyet ölçeği ×2500, slot geri ödeme hedefleri 40 sn / 4 dk / 20 dk / 80 dk; ilk rebirth ~3-4. çağ civarına denk gelir (`src/game/data.ts` başındaki yorumda belgeli).
- **Rebirth — "Zaman Yarığı"**: Kronos Kristali kazan (her biri kalıcı +%2 gelir), 8 dallı yetenek ağacına harca (çevrimdışı limit, maliyet indirimi, hız, başlangıç bonusu, yönetici koruma…).
- **Reklam mekanikleri (AdMob rewarded)**: ×2 kâr boostu (uzatılabilir), Zaman Sıçraması (anında 2 saatlik üretim), bedava kristal, çevrimdışı kazancı ikiye katlama, anomali ödülünü üçe katlama. Web'de simüle reklam oynar.
- **Zaman Anomalisi**: 1,5–4 dakikada bir beliren, dokununca ödül veren baloncuk.
- **Günlük ödül serisi** (7 günlük döngü), **27 başarım** (+%2 gelir/başarım), çevrimdışı kazanç (8–24 saat), otomatik kayıt + dışa/içe aktarma.
- **12 dil**: EN, TR, ZH, HI, ES, FR, AR (RTL), PT, RU, JA, DE, KO — cihaz dilini otomatik algılar.

## Geliştirme (PC'de test)

```bash
npm install
npm run dev        # http://localhost:5199
```

## Mobil derleme (Capacitor)

İlk kurulum (bir kez):

```bash
npm run build
npx cap add ios        # macOS + Xcode gerekir
npx cap add android    # Android Studio gerekir
```

Sonraki derlemeler:

```bash
npm run cap:ios        # build + sync + Xcode'da aç
npm run cap:android    # build + sync + Android Studio'da aç
```

## Yayın öncesi kontrol listesi

1. **AdMob**: `capacitor.config.ts` içindeki `appIdIos` / `appIdAndroid` ve
   `src/services/ads.ts` içindeki `REWARDED_ID_IOS` / `REWARDED_ID_ANDROID`
   değerlerini kendi AdMob kimliklerinle değiştir (şu an Google'ın resmî TEST kimlikleri).
2. **iOS**: Xcode'da App Icon + Launch Screen ekle; Info.plist'e AdMob için
   `GADApplicationIdentifier` (Capacitor sync bunu config'den ekler) ve App Tracking
   Transparency açıklaması (`NSUserTrackingUsageDescription`) ekle.
3. **Android**: `android/app/build.gradle` sürüm kodu/imzalama; Play Console veri güvenliği formu.
4. Bundle ID: `com.chronoempire.game` (değiştirmek istersen `capacitor.config.ts`).

## Mimari

- `src/game/data.ts` — tüm denge verileri (işletmeler, çağlar, yetenekler, başarımlar, reklam sabitleri)
- `src/game/engine.ts` — oyun döngüsü (100 ms tick), kayıt/yükleme, çevrimdışı ilerleme, prestij matematiği
- `src/i18n/` — 12 dilin sözlükleri
- `src/services/ads.ts` — AdMob rewarded ad sarmalayıcı (web'de simülasyon)
- `src/components/` — sekmeler ve modallar
