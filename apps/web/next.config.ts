import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  agentRules: false,
  reactCompiler: true,
  // 작은 화면에서 개발 도구 버튼이 하단 홈 메뉴를 가리지 않도록 합니다.
  devIndicators: { position: 'top-right' },
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
