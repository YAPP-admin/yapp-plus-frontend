# 구현 계획: 마이페이지 프로필 조회

**실제 브랜치**: `DongjaJ/api-v2` | **작성일**: 2026-11-10
**명세**: [spec.md](spec.md) | **이슈**: [#413](https://github.com/YAPP-admin/yapp-plus-frontend/issues/413)

## 요약

최신 OpenAPI를 재생성한 뒤 마이페이지 프로필을 생성 Query와 기존 인증 Provider에 연결한다.
이름은 API 응답만 사용하고 프로필·출석 조회를 독립시킨다. 이번 제출은 1단계 문서 작성까지다.

## 기술 맥락

- TypeScript 6.0.3, React 19.2.8, TanStack Query 5.102.8, Zod 4.5.4, MSW 2.15.0을 유지한다.
- Hey API 0.99.0, 기존 Ky client, SEED·vanilla-extract·Stackflow를 재사용한다. 새 의존성은 없다.
- Node.js 24.20.0과 pnpm 12.3.4를 mise로 실행한다. API 생성은 패키지 명령, 루트 검증은 `node --run`을 사용한다.
- 저장소 추가·DB migration 없이 QueryClient 메모리 캐시만 사용한다. 인증·브리지 프로토콜은 유지한다.
- Vitest·Testing Library·MSW로 가까운 계층을 검증한다. 대상은 회원 웹과 모바일 WebView다.
- 성능 목표는 프로필과 출석의 불필요한 순차 요청을 막고 기존 30초 stale 정책을 유지하는 것이다. 별도 지연 SLA는 추가하지 않는다.
- 범위는 프로필 한 영역과 공용 생성 계약·필수 소비 코드 호환성이다. 실제 서버 인증 조회는 명세 조회와 별도로 검증한다.

## 헌법 점검

기준: `origin/main`과 HEAD `7bd77d09035d8c1a317469bc4d03caedb25955f1`.
[루트 지침](../../AGENTS.md), [웹 지침](../../apps/web/AGENTS.md), [제품 맥락](../../docs/mission.md),
[공통 개발 가이드](../../docs/frontend-development.md), [웹 가이드](../../docs/web-development.md)를 적용한다.

| 항목                     | 설계 전·후 판단과 근거                                                         |
| ------------------------ | ------------------------------------------------------------------------------ |
| 최소 범위·한국어         | 적용: 기존 프로필 항목만 연결하고 문서·관리 코드 주석은 한국어로 작성          |
| 공용 계약·입력 검증      | 적용: 생성 파일 수동 편집 금지, 공개 진입점 사용, Zod 검증 후 성공 처리        |
| 고정 도구·의존성         | 적용: 기존 고정 버전 사용, 의존성 추가 없음                                    |
| 검증                     | 적용: 모델·화면·계정 경계별 검증, check/build, 실제 실행과 캐시 구분           |
| 단계 리뷰·변경량         | 적용: 네 단계별 리뷰, 모든 파일 포함 650줄부터 분리 검토·800줄 미만 유지       |
| 인증·데이터·복구         | 적용: 인증 구조는 유지하되 캐시 격리 검증, 생성·소비 코드와 연동을 함께 복구   |
| 모바일 설정·공용 UI 변경 | 해당 없음: 네이티브·공용 UI 수정 계획이 없어 expo:doctor·Storybook 추가 불필요 |

설계상 예외는 없다. 구현 후 실제 diff·실행 결과로 재평가하며 현재 제품 검증 완료를 뜻하지 않는다.

## 프로젝트 구조

- `specs/022-my-profile/`: 명세·계획·연구·모델·계약·실행 안내·작업 목록·검증 기록.
- `packages/api/src/generated/`: 기존 설정으로 재생성. 관련 소비 지점은 operation 경로로 찾아 수정.
- `apps/web/src/pages/my/model/`: `profile-query.ts`, `profile-model.ts`와 인접 테스트.
- `apps/web/src/pages/my/ui/`: `profile-section.tsx`와 기존 `my-page.tsx`, `my-page.test.tsx` 연결.
- `apps/web/src/mocks/`: `member-profile-handlers.ts`, 기존 `browser.ts`·`server.ts`에 개발·테스트 연결.

화면 단일 소비이므로 feature·shared로 승격하지 않는다. 프로필 경계·표시 private 컴포넌트는
`profile-section.tsx` 안에 두고 UI 추상화를 추가하지 않는다.

## 리뷰 단계와 구현 순서

### 1단계 — 이슈와 명세

승인된 이슈 생성, Spec Kit 산출물 작성, 문서 품질·상호 일관성·기본 check와 변경량을 검증한다.
신규 기능 번호는 022이며 `.specify/feature.json`에 연결한다. 실제 브랜치를 변경하지 않는다.
이 단계 종료 후 사용자 리뷰를 기다리고 생성기·제품 코드 작업은 시작하지 않는다.

### 2단계 — 생성 코드와 기존 소비 코드

1. 배포 OpenAPI를 `.context/profile-openapi.json`에 받아 시각·SHA-256을 기록한다.
2. 프로필 경로·여섯 필수 필드·nullable·오류 계약을 확인한 뒤 기존 생성 명령을 실행한다.
3. SDK·타입·Zod·Query·MSW·Faker와 웹·관리자·공용 mock 소비 지점을 경로·메서드 기준으로 대조한다.
4. 이름이 바뀐 operation 연결과 필수 타입 호환성만 수정하고 새 기능은 연결하지 않는다.
5. 전체 check/build와 변경량을 제출한다. 생성 결과를 손으로 잘라 PR 크기를 맞추지 않는다.

650줄부터 문서/생성 호환성/프로필 연동의 독립 검토 단위 분리를 검토한다. 800줄 이상이면
후속 구현 전에 파일별 원인·분리안을 보고한다. 생성 호환성만으로 제한을 지킬 수 없으면 중단하여
사용자와 해소 방법을 정한다. 실제 브랜치·commit·PR 작업은 별도 승인 없이 수행하지 않는다.

### 3단계 — 프로필 연결

1. 생성 Query 옵션에 기존 `apiOptions`와 프로필 `responseValidator`를 전달한다. 생성 key·queryFn·AbortSignal을 유지한다.
2. 생성 Zod 스키마를 응답 경계에서 검사한다. client가 원본 JSON을 반환하는 기존 패턴을 따라 bigint 변환 결과를 캐시에 저장하지 않는다.
3. 순수 표시 모델에서 회원 상태·직군 매핑, 기수 표기와 null의 `—` 처리를 수행한다.
4. `ProfileSection`에 독립 `ScreenQueryBoundary`·Suspense·`useSuspenseQuery`를 둔다. 출석 경계와 나란히 배치해 순차 대기를 피한다.
5. 기존 `canQuery` 조건, 화면 복귀 훅과 계정 캐시 수명을 재사용한다. 로그인 세션 이름 참조를 프로필 표시에서 제거한다.
6. 생성 핸들러 기반 고정 개발 fixture와 테스트를 연결한다. 운영 fixture·정적 콘텐츠 경로에는 프로필을 추가하지 않는다.
7. 관련 회귀 테스트와 화면 상태 확인 결과를 제출하고 리뷰받는다.

### 4단계 — 통합 검증과 완료 보고

3단계 테스트 결과를 재사용하고 남은 통합·접근성·브라우저·WebView 검증을 마친다.
최종 check/build와 실제 base 대비 변경량을 기록한다. 이미 검증한 동일 조합은 중복 테스트하지 않는다.
실서버 조회·스크린 리더·WebView를 실행하지 못했다면 환경과 남은 위험을 명시한다.

## 복구와 승인 경계

배포·DB 변경은 없다. 문제 발생 시 이번 생성 계약과 그 소비 코드, 프로필 연동을 대응하는 단위로
되돌려 기존 마이페이지로 복구한다. 사용자 변경을 함께 되돌리지 않는다. 실제 revert·배포는 별도 승인 대상이다.
단계 리뷰는 commit·push·PR 승인에 해당하지 않는다. 설계 완료와 사용자 리뷰 완료를 분리해 기록한다.
