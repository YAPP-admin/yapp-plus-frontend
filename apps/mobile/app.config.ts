/// <reference types="node" />

import type { ExpoConfig } from 'expo/config';
import { existsSync } from 'node:fs';

const mobileWebUrl = process.env.MOBILE_WEB_URL;
const configuredWebUrl = typeof mobileWebUrl === 'string' ? mobileWebUrl.trim() : '';
const firebaseIosConfig = process.env.FIREBASE_IOS_GOOGLE_SERVICES_FILE;
const firebaseIosConfigFile =
  typeof firebaseIosConfig === 'string' ? firebaseIosConfig.trim() : undefined;
const isTestFlightBuild = process.env.EAS_BUILD_PROFILE === 'testflight';
const apnsEnvironment =
  process.env.APNS_ENVIRONMENT ?? (isTestFlightBuild ? 'production' : 'development');

const isHttpsUrl = (value: string): boolean => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

if (configuredWebUrl.length > 0 && !isHttpsUrl(configuredWebUrl)) {
  throw new Error('MOBILE_WEB_URL은 HTTPS URL이어야 합니다.');
}

if (isTestFlightBuild && !firebaseIosConfigFile) {
  throw new Error('TestFlight 빌드에는 FIREBASE_IOS_GOOGLE_SERVICES_FILE이 필요합니다.');
}

if (firebaseIosConfigFile && !existsSync(firebaseIosConfigFile)) {
  throw new Error('FIREBASE_IOS_GOOGLE_SERVICES_FILE 경로에 파일이 없습니다.');
}

if (apnsEnvironment !== 'development' && apnsEnvironment !== 'production') {
  throw new Error('APNS_ENVIRONMENT는 development 또는 production이어야 합니다.');
}

const config: ExpoConfig = {
  name: 'YAPP+',
  slug: 'yapp-plus',
  owner: 'yapp-plus-official',
  // Expo Router의 앱 URL과 iOS Bundle ID를 같은 안정 식별자로 유지합니다.
  scheme: 'org.yapp.yappplus',
  version: '1.0.6',
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/e34d595c-d553-4007-ac7c-8e85d6549e44',
  },
  icon: './assets/icon.png',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'org.yapp.yappplus',
    supportsTablet: false,
    usesAppleSignIn: true,
    googleServicesFile: firebaseIosConfigFile,
    entitlements: {
      'aps-environment': apnsEnvironment,
    },
    config: {
      usesNonExemptEncryption: false,
    },
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-splash-screen',
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'dynamic',
        },
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission: '출석 확인을 위해 현재 위치를 사용합니다.',
        locationAlwaysPermission: false,
        locationAlwaysAndWhenInUsePermission: false,
        motionUsagePermission: false,
        locationFullAccuracyPermission: false,
      },
    ],
    [
      'react-native-nitro-google-signin',
      {
        iosUrlScheme: 'com.googleusercontent.apps.47093355379-s1gkq650qpgjhvsb2bev9h4na5mlmnsi',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    mobileWebUrl: configuredWebUrl.length > 0 ? configuredWebUrl : null,
    eas: {
      projectId: 'e34d595c-d553-4007-ac7c-8e85d6549e44',
    },
  },
};

export default config;
