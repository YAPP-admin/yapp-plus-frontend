import '@seed-design/css/base.css';
import '@seed-design/css/recipes/app-bar.css';
import '@seed-design/css/recipes/app-bar-main.css';
import '@seed-design/css/recipes/app-screen.css';
import '@yapp-plus/ui/styles';
import './styles.css';
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Providers } from '@/app/providers';
import { createStackflowApp } from './stack';
import { detectPlatform, getReducedMotionPreference } from './platform';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Stackflow 호환성 셸의 root 요소를 찾을 수 없습니다.');
}

const initialContext = {
  platform: detectPlatform(),
  reducedMotion: getReducedMotionPreference(),
};
const { Stack } = createStackflowApp({ reducedMotion: initialContext.reducedMotion });

function App() {
  return (
    <Providers>
      <Suspense
        fallback={
          <>
            <title>YAPP+</title>
            <div>로딩 중…</div>
          </>
        }
      >
        <Stack initialContext={initialContext} />
      </Suspense>
    </Providers>
  );
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
