import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const legacyPath = fileURLToPath(new URL('./stackflow-spike/src/legacy', import.meta.url));

export default defineConfig({
  plugins: [vanillaExtractPlugin()],
  // tsconfig의 `@/*` 경로 별칭을 테스트에서도 사용합니다.
  resolve: {
    tsconfigPaths: true,
    alias: {
      'next/navigation': `${legacyPath}/next-navigation.ts`,
      'next/link': `${legacyPath}/next-link.tsx`,
      'next/image': `${legacyPath}/next-image.tsx`,
    },
  },
  test: {
    environment: 'happy-dom',
    server: {
      deps: {
        // SEED 컴포넌트의 recipe CSS를 Vite가 처리합니다.
        inline: [
          '@seed-design/react',
          '@seed-design/css',
          '@seed-design/stackflow',
          '@stackflow/link',
          '@stackflow/react',
        ],
      },
    },
    setupFiles: ['./vitest.setup.ts'],
  },
});
