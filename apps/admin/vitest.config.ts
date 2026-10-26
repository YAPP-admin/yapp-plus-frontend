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
    server: { deps: { inline: ['@seed-design/react', '@seed-design/css'] } },
    setupFiles: ['./vitest.setup.ts'],
  },
});
