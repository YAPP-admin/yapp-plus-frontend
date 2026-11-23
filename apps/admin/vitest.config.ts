import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // 실제 앱과 같은 Compiler 변환을 거쳐 상태 변경과 렌더링을 검증합니다.
  plugins: [vanillaExtractPlugin(), react({ compiler: true })],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'happy-dom',
    // 라우터·오버레이 UI 테스트가 공유 개발 환경의 과도한 worker 경합으로 timeout 나지 않도록 제한한다.
    maxWorkers: 4,
    testTimeout: 10_000,
    server: { deps: { inline: ['@seed-design/react', '@seed-design/css'] } },
    setupFiles: ['./vitest.setup.ts'],
  },
});
