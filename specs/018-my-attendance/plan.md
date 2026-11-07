# 구현 계획: 마이페이지·출석 내역 연동

**브랜치**: `DongjaJ/my-page-attendance-api-plan` | **작성일**: 2026-11-07

**명세**: [spec.md](spec.md) | **상태**: 2단계 구현 완료·리뷰 대기

## 요약

선택적 이름을 기존 native 세션에서 웹으로 전달하고 생성된 점수·내역 조회를 연결한다.
현재 UI를 유지하고 미지원 값은 `—`로 표시한다. 서버 변경과 별개로 진행한다.

## 기술 맥락

- TypeScript, React, Vite·Stackflow, TanStack Query, Zod, MSW, Vitest·Testing Library를 사용한다.
- native는 Expo SecureStore의 기존 세션 레코드를 확장한다. 웹에는 별도 영속 저장소를 만들지 않는다.
- Node.js 24.20.0, pnpm 12.3.4와 기존 SEED·vanilla-extract를 사용하며 새 의존성은 없다.
- 대상은 회원 웹 2개 화면, native 이름 전달, 공용 브리지의 선택적 필드다.
- 기본 staleTime 30초·retry false·기존 mount/focus/reconnect 정책을 유지한다. 별도 polling은 없다.

## 헌법 점검

HEAD와 fetch한 origin/main은 `4fc4cd837bc04df3d7c2c99152af5ce6ba68c744`다.
[AGENTS](../../AGENTS.md), [웹 지침](../../apps/web/AGENTS.md),
[제품 맥락](../../docs/mission.md), [헌법](../../.specify/memory/constitution.md)을 적용한다.

| 항목           | 판정과 근거                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------- |
| 목적·최소 범위 | 통과. 사용자 승인한 안드로이드 지원 범위만 연결한다.                                                |
| 공용 계약·인증 | 통과. 구현 전에 선택적 이름·저장 호환·계정 격리 계약을 문서화한다.                                  |
| 경계·생성 코드 | 통과. 공개 API만 소비하고 생성 코드·인증 프로토콜을 재설계하지 않는다.                              |
| 재현성         | 통과. 고정 도구와 기존 의존성을 사용한다.                                                           |
| 검증·복구      | 통과. 경계별 테스트·단계별 리뷰·기존 저장 호환과 롤백을 정의한다.                                   |
| 이슈·외부 변경 | 사용자 승인으로 이슈 #352를 생성했다. 1단계 리뷰 후 사용자 진행 요청으로 이름 전달 기반을 구현했다. |

설계 후에도 동일 기준을 만족하며 예외가 필요한 구조는 없다.

## 구조와 데이터 흐름

- `packages/app-bridge`: `AuthSession.name?: string`과 이름 정규화 schema를 공개한다. native 입력·저장 복구·웹 표시에서 동일 규칙을 사용한다.
- `apps/mobile/src/auth`: 로그인 응답 이름 → credentials → 세션 commit → SecureStore/공개 세션. 갱신은 저장된 이름을 함께 전달한다.
- `apps/web/src/features/member-attendance`: 두 화면이 소비하는 점수 schema·query 옵션만 둔다. 공개 `index.ts`를 사용한다.
- `apps/web/src/pages/my`: 세션 이름 표시와 점수 카드. `pages/attendance`: 내역 schema·상태 변환·커서·무한 스크롤.
- `apps/web/src/mocks`: 해당 조회의 시나리오 handler를 기존 browser/server에 등록한다. 생성 MSW helper를 사용한다.

기존 auth `apiOptions`와 계정 경계를 사용한다. 이름을 query key나 계정 식별자에 추가하지 않는다.
`useQuery`로 점수 영역을 독립 표시한다. 생성 `mineQueryKey`를 사용하고 `mine` SDK를
throwOnError false로 호출해 HTTP status와 오류 code를 함께 판별한다. 두 정상 미대상 오류만
null로 변환하며 두 화면이 같은 query key와 캐시 형태를 사용한다.
목록은 생성 `find5InfiniteOptions`와 `useInfiniteQuery`로 연결한다. 세부 계약은
[조회 계약](contracts/attendance-query.md)과 [이름 계약](contracts/session-name.md)에 둔다.

## 단계·의존성·리뷰

| 단계 | 사용자 흐름  | 산출물·완료 기준                                             |
| ---- | ------------ | ------------------------------------------------------------ |
| 1    | 전체 준비    | 명세·조사·모델·계약·작업·검증 가이드, 체크리스트와 이슈 초안 |
| 2    | US1·US3 기반 | 이름 전달·저장·복구와 계정 격리 테스트, 구버전 호환          |
| 3    | US1          | 마이페이지 실제 데이터, 미지원·미대상·실패 화면과 테스트     |
| 4    | US2          | 내역 무한 스크롤·배지·경고·직접 진입과 테스트                |
| 5    | US3·전체     | 실제 인증 흐름과 두 화면의 통합·접근성·출시 근거             |

순서는 1 → 2 → 3 → 4 → 5이며 각 단계 결과를 제출하고 다음 단계 진행 확인을 받는다.
US3의 독립 계정 격리 검증은 5단계에 모으고 기반 계약·native 회귀는 2단계에 둔다.
MVP는 3단계까지의 실제 마이페이지이며 전체 완료에는 4·5단계가 필요하다.
문서 PR과 이후 이름·마이페이지·내역 변경을 분리 가능한 리뷰 단위로 관리한다.
실제 base 대비 650줄부터 분리를 검토하고 문서·테스트·생성 파일을 포함해 800줄 미만을 지킨다.
브랜치 이름은 유지하고 이슈·commit·push·PR은 각각 승인된 범위에서만 실행한다.

## 검증과 복구

- [quickstart.md](quickstart.md)의 경계별 검증을 수행하고 실행·캐시·실패·미실행을 구분한다.
- 단계별 `node --run check`, 화면 변경 시 `node --run build`를 실행한다. 모바일 설정·의존성 변경 시 `node --run expo:doctor`를 추가한다.
- 새 웹은 구버전 native의 이름 없는 응답을 지원한다. version 1 레코드에 선택적 이름만 추가한다.
- 문제 시 웹 표시 변경을 먼저 되돌린다. native 롤백 시 기존 parser는 이름을 무시하고 갱신 때 제거할 수 있으나 로그인 자격은 유지한다.
- 계정 경계와 401 복구의 기존 보장 범위를 확대하지 않는다. 새 BFCache 차단·인증 복구 정책은 추가하지 않는다.
- 최신 배포 OpenAPI는 타임아웃으로 수신하지 못했다. 확인한 저장소 계약으로 진행하고 서버 원본 변경 발견 시 영향과 후속 범위를 리뷰한다.
