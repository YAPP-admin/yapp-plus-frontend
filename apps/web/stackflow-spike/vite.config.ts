import { seedDesignPlugin } from '@seed-design/vite-plugin';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'stackflow-spike',
  plugins: [
    vanillaExtractPlugin(),
    react({ compiler: true }),
    seedDesignPlugin({ colorMode: 'light-only' }),
  ],
  build: {
    emptyOutDir: true,
    outDir: '../.stackflow-spike-dist',
  },
});
