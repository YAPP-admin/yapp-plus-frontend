import { seedDesignPlugin } from '@seed-design/vite-plugin';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const webSourcePath = fileURLToPath(new URL('../src', import.meta.url));
const legacyPath = fileURLToPath(new URL('./src/legacy', import.meta.url));

export default defineConfig({
  root: 'stackflow-spike',
  resolve: {
    alias: {
      '@': webSourcePath,
      'next/navigation': `${legacyPath}/next-navigation.ts`,
      'next/link': `${legacyPath}/next-link.tsx`,
      'next/image': `${legacyPath}/next-image.tsx`,
    },
  },
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
