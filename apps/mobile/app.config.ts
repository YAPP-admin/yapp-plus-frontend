/// <reference types="node" />

import type { ExpoConfig } from 'expo/config';

import { validateMobileWebUrl } from './src/mobile-url-policy.ts';

// EAS의 명시적 development 프로필 외 빌드와 production export는 로컬 fallback을 허용하지 않습니다.
const buildProfile = process.env.EAS_BUILD_PROFILE;
const development =
  process.env.NODE_ENV !== 'production' &&
  (!buildProfile || buildProfile === 'development') &&
  process.env.EAS_BUILD !== 'true';
const configuredWebUrl = validateMobileWebUrl(process.env.MOBILE_WEB_URL, development);

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
    mobileWebUrl: configuredWebUrl ?? null,
  },
};

export default config;
