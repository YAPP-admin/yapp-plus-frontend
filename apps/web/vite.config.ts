import { seedDesignPlugin } from '@seed-design/vite-plugin';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { getWebApiBaseUrl } from './src/app/api-environment';

const webSourcePath = fileURLToPath(new URL('./src', import.meta.url));
const stackflowRoot = fileURLToPath(new URL('./stackflow', import.meta.url));
const publicPath = fileURLToPath(new URL('./public', import.meta.url));
const outputPath = fileURLToPath(new URL('./dist', import.meta.url));

export default defineConfig(({ mode }) => {
  const envDir = fileURLToPath(new URL('.', import.meta.url));
  getWebApiBaseUrl(loadEnv(mode, envDir, 'VITE_').VITE_API_BASE_URL);

  return {
    root: stackflowRoot,
    envDir,
    publicDir: publicPath,
    resolve: {
      alias: {
        '@': webSourcePath,
      },
    },
    plugins: [
      vanillaExtractPlugin(),
      react({ compiler: true }),
      seedDesignPlugin({ colorMode: 'system' }),
    ],
    build: {
      emptyOutDir: true,
      outDir: outputPath,
    },
  };
});
