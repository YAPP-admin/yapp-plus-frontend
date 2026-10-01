/// <reference types="node" />

import type { ExpoConfig } from 'expo/config';

const mobileWebUrl = process.env.MOBILE_WEB_URL;
const configuredWebUrl = typeof mobileWebUrl === 'string' ? mobileWebUrl.trim() : '';

const config: ExpoConfig = {
  name: 'YAPP Plus Mobile (Temporary)',
  slug: 'yapp-plus-mobile-placeholder',
  // 자체 빌드에서 Expo Router가 초기 URL을 만들 수 있도록 임시 앱 식별자와 맞춥니다.
  scheme: 'com.yappplus.placeholder.mobile',
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
    mobileWebUrl: configuredWebUrl.length > 0 ? configuredWebUrl : null,
  },
};

export default config;
