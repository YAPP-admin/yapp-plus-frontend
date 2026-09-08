import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  agentRules: false,
  reactCompiler: true,
  transpilePackages: ['@yapp-plus/api', '@yapp-plus/app-bridge', '@yapp-plus/ui'],
  experimental: {
    turbopackRustReactCompiler: true,
  },
};

const withVanillaExtract = createVanillaExtractPlugin({
  unstable_turbopack: {
    mode: 'auto',
  },
});

export default withVanillaExtract(nextConfig);
