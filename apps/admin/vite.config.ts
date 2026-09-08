import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

export default defineConfig({
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
