import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vanillaExtractPlugin()],
  test: {
    environment: 'happy-dom',
    server: {
      deps: {
        // Seed 컴포넌트의 recipe CSS를 Node.js 대신 Vite가 처리합니다.
        inline: ['@seed-design/react', '@seed-design/css'],
      },
    },
    setupFiles: ['./src/test/setup.ts'],
  },
});
