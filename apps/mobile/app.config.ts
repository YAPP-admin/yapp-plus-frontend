/// <reference types="node" />

import type { ExpoConfig } from 'expo/config';

const configuredWebUrl = process.env.MOBILE_WEB_URL?.trim();

const config: ExpoConfig = {
  name: 'YAPP Plus Mobile (Temporary)',
  slug: 'yapp-plus-mobile-placeholder',
  version: '0.0.1',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.yappplus.placeholder.mobile',
    supportsTablet: false,
  },
  android: {
    package: 'com.yappplus.placeholder.mobile',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    mobileWebUrl: configuredWebUrl?.length ? configuredWebUrl : null,
  },
};

export default config;
