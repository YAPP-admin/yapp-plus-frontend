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

  const host = readMetroHost() ?? (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

  return `http://${host}:${WEB_DEV_PORT}`;
};
