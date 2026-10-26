# 구현 계획: OpenAPI 클라이언트와 MSW 개발 환경

**브랜치**: `DongjaJ/api-docs-implementation-check` | **작성일**: 2026-10-26
**상태**: 2단계 의존성·생성 설정 완료 — 사용자 리뷰 대기, 3단계 착수 승인 없음
**이슈**: [#107](https://github.com/YAPP-admin/yapp-plus-frontend/issues/107)
**명세**: [spec.md](spec.md) | **작업 목록**: [tasks.md](tasks.md)

## 요약과 기술 맥락

기존 `packages/api`에서 동일한 OpenAPI로 SDK와 MSW를 생성한다. 수동 fixture는 생성물과 분리하고
어드민·회원 웹은 패키지의 공개 진입점만 사용한다. 화면의 기존 직접 mock 서비스는 유지한다.

- Node 24.20.0, pnpm 12.3.4, TypeScript 6, Hey API 0.99.0, Ky 2.1.0을 유지한다.
- 기존 Zod 4·TanStack Query 생성 설정을 유지하고 MSW 2.15.0을 catalog에 고정한다.
- 검증은 기존 Vitest·happy-dom, 생성 Zod, 개발 브라우저와 프로덕션 빌드를 사용한다.
- 새 데이터베이스·영속 저장소·네이티브 의존성·공용 React 패키지를 추가하지 않는다.
- 기반 커밋은 `dc5c957`, 확인한 origin/main은 `25c1b7e`다. 현재 브랜치는 27커밋 뒤에 있다.
  main의 별도 공지·장소 변경은 병합하지 않는다. 명세 번호는 main의 010 다음인 011을 사용한다.

## 저장소 원칙 검토

- 헌법은 미작성 템플릿이므로 AGENTS.md를 적용하며 임의의 헌법을 새로 만들지 않는다.
- 한국어 문서, 앱 간 직접 import 금지, 공용 계약의 패키지 공개 진입점 사용을 따른다.
- 생성물을 직접 편집하지 않고 도구·명세·설정에서 해결한다. 타입 단언으로 계약 오류를 숨기지 않는다.
- 의존성·코드·생성물·환경 설정 변경은 해당 단계 승인 후 시작한다. 현재 2단계까지만 승인되었다.
- 모킹 플래그 해제와 변경 되돌리기로 복구할 수 있으며 인증·외부 데이터 마이그레이션은 없다.
- 설계 후 재검토: 기존 UI 서비스와 프로덕션 인증 동작을 바꾸지 않는 범위다.

## 생성과 공개 계약

- `packages/api/openapi-ts.config.ts`에 `msw`를 추가한다. `includeInEntry: false`, `source: []`,
  `responseFallback: 'error'`, `baseUrl: 0`을 사용해 예제의 암묵적 응답과 전역 origin 매칭을 피한다.
- Ky·타입·SDK·Zod·Query·MSW를 한 번의 생성으로 갱신한다. SDK validator와 transformer 기본값은 유지한다.
- `@yapp-plus/api/generated`는 기존 API 진입점, `@yapp-plus/api/generated/msw`는
  `src/generated/msw.gen.ts`, `@yapp-plus/api/mocks`는 `src/mocks/index.ts`를 공개한다.
- API 패키지는 생성 모듈에서 사용하는 MSW를 dependencies에, 각 앱은 devDependencies에 선언한다.
- MSW 2.15.0의 postinstall은 worker를 자동 복사하므로 해당 버전만 allowBuilds에서 false로 둔다.
  worker 생성·갱신은 명시적인 CLI 실행으로 관리하고 버전 변경 시 정책을 재검토한다.
- `src/mocks/fixtures.ts`에 고정 응답, `handlers.ts`에 `createApiMockHandlers(baseUrl)`를 둔다.
  생성된 `createMswHandlers`와 혼동되지 않게 수동 함수명을 구분한다.
- 런타임 입력인 base URL은 절대 HTTP(S) URL인지 검증한다. 브라우저는 생성 클라이언트의 설정을,
  테스트는 `https://api.yapp.test`를 사용한다. 끝의 slash를 정규화하고 origin·경로 범위를 한정한다.
- 다섯 대표 응답을 생성 factory에 주입한다. 나머지는 501, 알 수 없는 대상 `/api/` 요청은 실패한다.
  정적 자원·HMR·외부 서비스는 통과시킨다. 전체 CRUD와 OAuth redirect 흐름은 재현하지 않는다.
- 수동 계약과 반환값은 [contracts/api-mocking.md](contracts/api-mocking.md)를 따른다.

## 브라우저와 테스트 경계

- 앱별 `src/mocks/browser.ts`, `mock-api-boundary.tsx`, `server.ts`를 둔다.
- 어드민 `src/providers.tsx`, 웹 `src/app/providers.tsx`의 기존 Provider 내부에 작은 경계를 추가한다.
- 어드민은 DEV와 `VITE_API_MOCKING=true`를 함께 확인하고 test 모드에서는 browser worker를 시작하지 않는다.
  웹은 development와 `NEXT_PUBLIC_API_MOCKING=true`를 함께 확인한다. 기본값은 false다.
- 플래그 값은 미지정·`false`·`true`만 허용한다. 잘못된 값은 개발 시 설명하고 실행하지 않는다.
- 활성화 시 SSR와 첫 hydration은 같은 준비 안내를 보여 준다. effect에서 동적으로 browser 모듈을 읽고
  worker 시작 완료 후 children을 연다. 이 모드는 클라이언트 요청만 보장하며 서버 요청을 막는 장치가 아니다.
- 모듈의 시작 Promise를 재사용하고 effect cleanup은 상태 갱신만 취소한다. 실패하면 오류 안내를 유지한다.
- 비활성·프로덕션에서는 기존 children을 즉시 반환한다. QueryClient와 safe-area 초기화를 유지한다.
- 앱별 `public/mockServiceWorker.js`는 CLI로 생성하고 포맷터·린터에서 제외한다. 범용 정적 worker가
  배포 폴더에 남는 것과 모의 데이터·등록 코드가 실행 번들에 들어가는 것은 구분해 검증한다.
- Vitest setup에 listen → 테스트별 resetHandlers → close를 추가한다. 기존 cleanup은 유지한다.
- 테스트 override와 fixture는 공개 생성 타입을 사용한다. SDK 자동 검증 활성화와 fixture 검증을 혼동하지 않는다.

## 파일 책임과 실행 순서

문서 묶음은 `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/api-mocking.md`,
`quickstart.md`, `tasks.md`, `checklists/requirements.md`, `validation.md`로 구성한다.
실제 생성물은 `packages/api/src/generated/`, 수동 데이터는 `packages/api/src/mocks/`에 둔다.
각 앱은 초기화·종료만 관리하며 패키지에 앱별 React·브라우저·Node 초기화를 넣지 않는다.

| 단계 | 결과                          | 다음 단계 시작 조건      |
| ---- | ----------------------------- | ------------------------ |
| 1    | 요구사항·계획·작업 목록       | 문서 리뷰 승인           |
| 2    | 의존성과 생성 설정            | 설정 변경 리뷰 승인      |
| 3    | 전체 API·MSW 생성물과 export  | 생성 계약 리뷰 승인      |
| 4    | 대표 응답과 공용 handler 구성 | 응답·실패 정책 리뷰 승인 |
| 5    | 두 앱 브라우저 초기화         | 개발 환경 동작 리뷰 승인 |
| 6    | Vitest 연결과 회귀 테스트     | 테스트 결과 리뷰 승인    |
| 7    | 전체 품질·빌드·브라우저 확인  | 검증 결과 리뷰 승인      |
| 8    | 사용법과 인계                 | 최종 리뷰                |

각 단계에서 결과·검증·미완료 사항을 보고한 뒤 멈춘다. 수정 요청은 같은 단계에서 처리한다.
단계 승인과 commit·push·PR 승인은 별개다. 브랜치 변경이나 외부 게시를 자동으로 수행하지 않는다.

## 검증과 복구

[quickstart.md](quickstart.md)의 검증을 해당 단계에서 수행하고 [validation.md](validation.md)에 남긴다.
전체 품질 게이트는 `node --run check`, 배포 앱 변경 후에는 `node --run build`다.
동일한 입력으로 두 번 생성한 결과를 비교하고, 생성 입력의 operation 수와 handler 수를 대조한다.
원격 명세를 읽지 못하면 생성하지 않는다. 필요하면 검증용 원본을 `.context/`에만 보관한다.
프로덕션 실행 번들에는 새 수동 fixture와 MSW 등록 코드가 없어야 한다.
복구는 플래그 해제·개발 서버 재시작부터 수행하며, 코드 복구가 필요하면 변경을 의존성 역순으로 되돌린다.
