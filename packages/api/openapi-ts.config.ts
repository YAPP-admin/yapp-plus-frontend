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
    '@hey-api/client-ky',
    '@hey-api/typescript',
    {
      name: 'zod',
      compatibilityVersion: 4,
    },
    {
      name: '@hey-api/sdk',
      transformer: false,
      validator: enableSdkValidation,
    },
    '@tanstack/react-query',
    {
      name: 'msw',
      includeInEntry: false,
      baseUrl: 0,
      // 응답을 명시하지 않은 API는 명세 예제나 실서버 대신 501로 응답합니다.
      source: [],
      responseFallback: 'error',
    },
  ],
});
