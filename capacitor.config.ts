import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chronoempire.game',
  appName: 'Chrono Empire',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0b0e1a',
  },
  android: {
    backgroundColor: '#0b0e1a',
  },
  plugins: {
    AdMob: {
      // Real AdMob app IDs.
      appIdIos: 'ca-app-pub-3323428505450637~8715528140',
      // TODO: create an Android app in AdMob and paste its app ID here before
      // publishing to Google Play. This is still Google's TEST Android app ID.
      appIdAndroid: 'ca-app-pub-3940256099942544~3347511713',
    },
    LocalNotifications: {
      iconColor: '#7c5cff',
    },
  },
};

export default config;
