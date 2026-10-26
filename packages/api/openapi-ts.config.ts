import { defineConfig } from '@hey-api/openapi-ts';

const input = process.env.OPENAPI_INPUT;
const enableSdkValidation = process.env.HEY_API_SDK_VALIDATION === 'true';

if (!input) {
  throw new Error(
    'OPENAPI_INPUT is required. Set it to an OpenAPI document URL or file path before running pnpm --filter @yapp-plus/api generate.',
  );
}

export default defineConfig({
  input,
  output: {
    path: 'src/generated',
    postProcess: ['oxfmt'],
  },
  plugins: [
    {
      name: '@hey-api/client-ky',
      includeInEntry: true,
    },
    '@hey-api/typescript',
    {
      name: 'zod',
      includeInEntry: true,
      compatibilityVersion: 4,
    },
    {
      name: '@hey-api/sdk',
      transformer: false,
      validator: enableSdkValidation,
    },
    {
      name: '@tanstack/react-query',
      includeInEntry: true,
    },
    {
      name: 'msw',
      includeInEntry: false,
      baseUrl: 0,
      // 기본 source로 명세 예제를 사용하고, 응답을 만들 수 없으면 501로 처리합니다.
      responseFallback: 'error',
    },
  ],
});
