import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import pretendardVariable from '../assets/fonts/PretendardVariable.ttf';

export default function RootLayout() {
  const [loaded, error] = useFonts({ 'Pretendard Variable': pretendardVariable });

  useEffect(() => {
    if (error) {
      console.warn('Pretendard 로딩에 실패해 시스템 글꼴을 사용합니다.');
    }
    if (loaded || error) {
      SplashScreen.hide();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}

// 모듈을 읽을 때 초기 렌더 전에 호출해야 splash가 먼저 사라지지 않습니다.
void SplashScreen.preventAutoHideAsync().catch(() => {
  console.warn('폰트 로딩 중 splash 유지에 실패했습니다.');
});
