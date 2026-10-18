import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [vanillaExtractPlugin()],
  // tsconfig의 `@/*` 경로 별칭을 테스트에서도 사용합니다.
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'happy-dom',
    server: {
      deps: {
        // SEED 컴포넌트의 recipe CSS를 Vite가 처리합니다.
        inline: ['@seed-design/react', '@seed-design/css'],
      },
    },
    setupFiles: ['./vitest.setup.ts'],
  },
});
