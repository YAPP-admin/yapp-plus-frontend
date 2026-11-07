import '@seed-design/css/base.css';
import '@seed-design/css/recipes/app-bar.css';
import '@seed-design/css/recipes/app-bar-main.css';
import '@seed-design/css/recipes/app-screen.css';
import '@yapp-plus/ui/styles';
import './styles.css';
import { ProgressCircle, VStack } from '@seed-design/react';
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Providers, createAppQueryClient } from '@/app/providers';
import { NativeAuthSessionProvider } from '@/features/auth';
import { createStackflowApp } from './stack';
import { detectPlatform, getReducedMotionPreference } from './platform';

const root = document.getElementById('root');

if (!root) {
  throw new Error('YAPP+ 웹 앱의 root 요소를 찾을 수 없습니다.');
}

const initialContext = {
  platform: detectPlatform(),
  reducedMotion: getReducedMotionPreference(),
};
const queryClient = createAppQueryClient();
const { Stack } = createStackflowApp({ reducedMotion: initialContext.reducedMotion, queryClient });

function App() {
  return (
    <Providers client={queryClient}>
      <Suspense
        fallback={
          <>
            <title>YAPP+</title>
            <VStack minHeight="100dvh" align="center" justify="center">
              <ProgressCircle.Root size="40" tone="neutral" aria-label="로그인 상태 확인 중">
                <ProgressCircle.Track />
                <ProgressCircle.Range />
              </ProgressCircle.Root>
            </VStack>
          </>
        }
      >
        <NativeAuthSessionProvider>
          <Stack initialContext={initialContext} />
        </NativeAuthSessionProvider>
      </Suspense>
    </Providers>
  );
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
