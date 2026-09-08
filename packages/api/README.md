# `@yapp-plus/api`

API 클라이언트는 백엔드의 OpenAPI 문서를 기반으로 Hey API가 생성합니다. 이 저장소에는
임시 OpenAPI 문서를 두지 않습니다.

```sh
OPENAPI_INPUT=https://api.example.com/openapi.json \
  pnpm --filter @yapp-plus/api generate
```

`OPENAPI_INPUT`에는 URL 또는 로컬 파일 경로를 지정할 수 있습니다. 생성 결과에는 Ky
클라이언트, TypeScript 타입과 SDK 함수, Zod 4 스키마, TanStack Query 옵션이 포함되며
`src/generated` 아래에 저장됩니다.

SDK 요청 및 응답 검증은 기본적으로 비활성화되어 있습니다. 생성된 Zod 스키마를 SDK
검증에 연결하려면 `HEY_API_SDK_VALIDATION=true`를 설정해 생성합니다. 응답 변환은 계속
비활성화됩니다.
