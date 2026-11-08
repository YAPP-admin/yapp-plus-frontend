import { seedDesignPlugin } from '@seed-design/vite-plugin';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const webSourcePath = fileURLToPath(new URL('./src', import.meta.url));
const stackflowRoot = fileURLToPath(new URL('./stackflow', import.meta.url));
const publicPath = fileURLToPath(new URL('./public', import.meta.url));
const outputPath = fileURLToPath(new URL('./dist', import.meta.url));

export default defineConfig({
  root: stackflowRoot,
  envDir: fileURLToPath(new URL('.', import.meta.url)),
  publicDir: publicPath,
  resolve: {
    alias: {
      '@': webSourcePath,
    },
  },
  plugins: [
    vanillaExtractPlugin(),
    react({ compiler: true }),
    seedDesignPlugin({ colorMode: 'light-only' }),
  ],
  build: {
    emptyOutDir: true,
    outDir: outputPath,
  },
});
