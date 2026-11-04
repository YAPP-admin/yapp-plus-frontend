import type { AppScreenProps } from '../../seed-design/ui/app-screen';
import { useSyncExternalStore } from 'react';

export type StackflowPlatform = 'ios' | 'android' | 'web';

export type StackflowInitialContext = {
  platform: StackflowPlatform;
  reducedMotion: boolean;
};

export type AppScreenOptions = Pick<
  AppScreenProps,
  'theme' | 'transitionStyle' | 'preventSwipeBack'
>;

export function detectPlatform(
  userAgent: string = typeof navigator === 'undefined' ? '' : navigator.userAgent,
  maxTouchPoints: number = typeof navigator === 'undefined' ? 0 : navigator.maxTouchPoints,
): StackflowPlatform {
  if (/Android/i.test(userAgent)) {
    return 'android';
  }

  if (/iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1)) {
    return 'ios';
  }

  return 'web';
}

export function getReducedMotionPreference(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function subscribeToReducedMotion(onChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', onChange);

  return () => mediaQuery.removeEventListener('change', onChange);
}

function getReducedMotionSnapshot() {
  return getReducedMotionPreference();
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function useReducedMotionPreference() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

export function getAppScreenOptions(
  platform: StackflowPlatform,
  reducedMotion: boolean,
  screenPreventsSwipeBack = false,
): AppScreenOptions {
  let transitionStyle: AppScreenOptions['transitionStyle'] = 'fadeIn';

  if (!reducedMotion && platform === 'ios') {
    transitionStyle = 'slideFromRightIOS';
  } else if (!reducedMotion && platform === 'android') {
    transitionStyle = 'fadeFromBottomAndroid';
  }

  return {
    theme: platform === 'android' ? 'android' : 'cupertino',
    transitionStyle,
    preventSwipeBack: screenPreventsSwipeBack || reducedMotion || platform !== 'ios',
  };
}

export function useAppScreenOptions(screenPreventsSwipeBack = false): AppScreenOptions {
  const platform = detectPlatform();
  const reducedMotion = useReducedMotionPreference();

  return getAppScreenOptions(platform, reducedMotion, screenPreventsSwipeBack);
}
