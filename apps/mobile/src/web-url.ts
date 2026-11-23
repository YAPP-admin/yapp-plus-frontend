import Constants from 'expo-constants';
import { Platform } from 'react-native';

const WEB_DEV_PORT = 3000;

type MobileExtra = {
  mobileWebUrl?: unknown;
};

const readConfiguredWebUrl = (): string | undefined => {
  const extra = Constants.expoConfig?.extra as MobileExtra | undefined;
  const value = extra?.mobileWebUrl;

  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

const readMetroHost = (): string | undefined => {
  const hostUri = Constants.expoConfig?.hostUri;
  return hostUri?.replace(/:\d+$/, '');
};

export const resolveMobileWebUrl = (): string => {
  const configuredWebUrl = readConfiguredWebUrl();
  if (configuredWebUrl) {
    return configuredWebUrl;
  }

  // iOS Simulator의 WebView는 API가 허용한 localhost origin으로 웹을 열어야 합니다.
  // Metro host(예: 127.0.0.1)는 번들 연결에만 쓰고 WebView origin으로는 사용하지 않습니다.
  const host =
    Platform.OS === 'ios'
      ? 'localhost'
      : (readMetroHost() ?? (Platform.OS === 'android' ? '10.0.2.2' : 'localhost'));

  return `http://${host}:${WEB_DEV_PORT}`;
};
