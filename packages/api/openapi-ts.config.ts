import { defineConfig } from '@hey-api/openapi-ts';

const input = process.env.OPENAPI_INPUT;
const enableSdkValidation = process.env.HEY_API_SDK_VALIDATION === 'true';
const mockCount = {
  fakerPath: ['number', 'int'] as const,
  defaultArgs: { min: 0, max: 100 },
};

if (!input) {
  throw new Error(
    'OPENAPI_INPUT is required. Set it to an OpenAPI document URL or file path before running pnpm --filter @yapp-plus/api generate.',
  );
}

export default defineConfig({
  input,
  // #198: 후속 PR에서 기능군별로 해제하며 최종 단계에서는 필터를 제거합니다.
  parser: {
    filters: {
      operations: {
        exclude: [
          'GET /api/attendance-scores/me',
          'GET /api/attendance-history',
          'GET /api/admin/users/{userId}/retained-history',
          'DELETE /api/users/me',
        ],
      },
    },
  },
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
      name: '@faker-js/faker',
      compatibilityVersion: 10,
      includeInEntry: false,
      requests: false,
      locale: 'en',
      // 0.99.0은 int32 형식만으로 정수 범위를 제한하지 않아 응답 필드의 생성 범위를 지정합니다.
      nameRules: {
        number: {
          totalMemberCount: mockCount,
          totalCount: mockCount,
          presentCount: mockCount,
          absentCount: mockCount,
          undecidedCount: mockCount,
          allCount: mockCount,
          regularCount: mockCount,
          teamCount: mockCount,
          generationNumber: { fakerPath: ['number', 'int'], defaultArgs: { min: 1, max: 100 } },
          displayOrder: { fakerPath: ['number', 'int'], defaultArgs: { min: 0, max: 10 } },
          scoreDelta: { fakerPath: ['number', 'int'], defaultArgs: { min: -10, max: 0 } },
          code: { fakerPath: ['number', 'int'], defaultArgs: { min: 1000, max: 9999 } },
        },
      },
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
