import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.velolog',
  appName: 'velo-log',
  webDir: 'dist',
  server: {
    url: 'https://75aebda6-3835-49e8-8c66-ef9e8193c92c.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    BackgroundGeolocation: {
      locationProvider: 'DISTANCE_FILTER_PROVIDER',
      desiredAccuracy: 'HIGH_ACCURACY',
      stationaryRadius: 10,
      distanceFilter: 10,
      notificationTitle: 'VeloLog Tracking',
      notificationText: 'Recording your route',
      debug: false,
      startOnBoot: false,
      stopOnTerminate: false,
    },
  },
};

export default config;
