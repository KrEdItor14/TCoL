import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kreditor.thecreedoflife',
  appName: 'The Creed of Life',
  webDir: 'www',
  bundledWebRuntime: false,
  backgroundColor: '#050e08',
  android: {
    allowMixedContent: false,
    backgroundColor: '#050e08'
  },
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
      style: 'DARK',
      hidden: false
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 250,
      showSpinner: false,
      backgroundColor: '#050e08',
      androidScaleType: 'CENTER_CROP'
    }
  }
};

export default config;
