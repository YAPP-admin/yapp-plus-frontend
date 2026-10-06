import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  // SEED의 recipe CSS를 서버에서도 Vite가 처리합니다.
  ssr: { noExternal: ['@seed-design/react', '@seed-design/css'] },
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    vanillaExtractPlugin(),
    tanstackStart({
      srcDirectory: 'src',
      router: {
        routeFileIgnorePattern: '\\.(css|test)\\.',
      },
    }),
    react(),
    nitro(),
  ],
});
