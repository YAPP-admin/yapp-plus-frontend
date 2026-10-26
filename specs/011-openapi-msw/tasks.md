# 작업 목록: OpenAPI 클라이언트와 MSW 개발 환경

**입력**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md),
[data-model.md](data-model.md), [공개 계약](contracts/api-mocking.md)
**현재 상태**: 1~8단계 작업과 최종 사용자 리뷰 완료. 이슈 #107 연결. 취소한 항목 외 모든 단계 작업 완료.

## 진행 규칙

각 단계가 끝나면 변경·검증·남은 문제를 사용자에게 보고하고 멈춘다.
명시적 리뷰 승인 없이 다음 단계의 파일 수정·설치·생성·테스트 연결을 시작하지 않는다.
수정 요청은 같은 단계에서 반영한다. 단계 승인은 commit·push·PR 승인이 아니다.
작업 완료 체크와 사용자 리뷰 승인은 구분한다. 승인 내역은 마지막 표에 기록한다.
명세의 US1은 생성, US2는 브라우저 모킹, US3은 테스트 격리를 의미한다.

## 1단계 — 작업 기준과 명세 (공통 준비)

- [x] T001 origin/main·작업 트리·열린 이슈·고정 도구를 확인하고 specs/011-openapi-msw/research.md에 기록한다.
- [x] T002 승인된 이슈 생성 또는 명시적 생략을 확인하고 specs/011-openapi-msw/plan.md에 연결한다.
- [x] T003 specs/011-openapi-msw/에 명세·계획·조사·데이터·계약·실행 안내·작업 목록을 반영한다.
- [x] T004 문서 링크·체크리스트·작업 ID를 검사하고 specs/011-openapi-msw/validation.md에 결과를 남긴다.

**완료 기준**: 요구사항과 구현 결정이 문서화되고 단계별 리뷰 중단점이 존재한다.
**중단점**: 문서 리뷰를 받는다. 승인 전 의존성 설치나 API 생성은 하지 않는다.

## 2단계 — 의존성과 생성 설정 (공통 기반)

- [x] T005 pnpm-workspace.yaml, packages/api/package.json, apps/admin/package.json, apps/web/package.json에 MSW 2.15.0의 catalog 의존성을 추가한다.
- [x] T006 고정 도구로 설치하고 pnpm-lock.yaml을 갱신한 뒤 frozen 설치를 검증한다.
- [x] T007 packages/api/openapi-ts.config.ts에 MSW 설정을 추가하고 기존 SDK 검증·변환 기본값을 유지한다.
- [x] T008 .oxfmtrc.json과 .oxlintrc.json에 두 앱의 자동 생성 worker 경로만 예외로 추가한다.

**완료 기준**: 의존성과 설정이 유효하며 생성물은 아직 만들지 않았다.
**중단점**: 설정 diff와 설치 결과를 리뷰받는다. 아직 없는 generated 디렉터리의 검사 제한은 별도 기록한다.

## 3단계 — 전체 API·MSW 생성 (US1, P1)

- [x] T009 [US1] 명세를 재조회하고 .context/openapi-msw-input.json에 검증용 원본을 보관해 operation·스키마를 확인한다.
- [x] T010 [US1] 동일 입력으로 packages/api/src/generated/의 SDK·타입·Zod·Query·MSW를 생성한다.
- [x] T011 [US1] packages/api/package.json에 generated/msw 공개 진입점을 추가하고 일반 index의 MSW 제외를 확인한다.
- [x] T012 [US1] 동일 입력 재생성·API 패키지 typecheck·operation 대조·수정 계약 확인 결과를 specs/011-openapi-msw/validation.md에 기록한다.

**독립 검증**: 입력 operation 전부에 SDK와 handler가 대응하고 같은 입력의 재생성 diff가 없다.
**중단점**: 생성 결과와 계약을 리뷰받는다. 문제는 설정·원본에서 해결하고 생성 파일을 직접 수정하지 않는다.

## 4단계 — 대표 응답과 핸들러 (US2, P2)

- [x] T013 [US2] fixture 계약·대상 범위·미구현 실패를 확인한다. 당시 작성한 api-contract.test.ts는 5단계 리뷰 요청에 따라 제거했다.
- [x] T014 [US2] Faker 의존성·생성 설정·별도 공개 진입점을 추가·재생성하고 packages/api/src/mocks/fixtures.ts에서 다섯 대표 API의 부족한 합성 고정 응답과 빈 결과를 보완한다.
- [x] T015 [US2] packages/api/src/mocks/handlers.ts에 base URL 검증·전체 핸들러 구성·Faker 응답 연결·대표 응답 보완·응답 부재 시 501 처리를 구현한다.
- [x] T016 [US2] packages/api/src/mocks/index.ts와 packages/api/package.json에서 수동 구성 함수와 미등록 요청 처리만 공개한다.
- [x] T017 [US2] 생성 Zod·SDK·Node MSW로 확인한 결과를 validation.md에 기록한다. 모킹 전용 테스트 파일은 유지하지 않는다.

**독립 검증**: 생성 타입·응답의 실행 시 Zod 검증과 브라우저에서 fixture·경로·실패 정책을 확인한다.
**중단점**: 데이터와 실패 정책을 리뷰받는다. 앱의 browser 초기화는 아직 연결하지 않는다.

## 5단계 — 개발 브라우저 연결 (US2, P2)

- [x] T018 [US2] 준비·실패·비활성·초기 렌더 동작을 확인한다. 당시 작성한 초기화 전용 테스트·보조 코드는 5단계 리뷰 요청에 따라 제거했다.
- [x] T019 [US2] 각 앱의 public/mockServiceWorker.js를 MSW CLI로 생성하고 package.json의 worker 경로를 기록한다.
- [x] T020 [US2] apps/admin/src/mocks/browser.ts와 apps/web/src/mocks/browser.ts에 worker·시작 Promise·대상 요청 정책을 구성한다.
- [x] T021 [US2] 각 앱 src/mocks/mock-api-boundary.tsx를 만들고 apps/admin/src/providers.tsx 및 apps/web/src/app/providers.tsx에 연결한다.
- [x] T022 [US2] apps/admin/.env.example, apps/web/.env.example, turbo.json에 모킹 플래그 기본값·전달을 반영하고 잘못된 값을 검증한다.
- [x] T023 [US2] 두 앱의 브라우저 초기화와 기존 UI·safe-area 회귀 확인 결과를 specs/011-openapi-msw/validation.md에 기록한다.

**독립 검증**: 실제 브라우저에서 초기화·실패 처리와 대표 요청 가로채기를 확인한다. 모킹 전용 단위 테스트는 유지하지 않는다.
**중단점**: 브라우저 동작을 리뷰받는다. 기존 직접 mock 서비스는 전환하지 않는다.

## 6단계 — 기능 테스트용 최소 MSW 설정 (US3, P3)

- [x] T024 [US3] apps/admin/src/mocks/server.ts와 apps/web/src/mocks/server.ts에 앱별 테스트 server를 만든다.
- [x] T025 [US3] apps/admin/vitest.setup.ts와 apps/web/vitest.setup.ts에 listen·resetHandlers·close를 연결하고 cleanup을 유지한다.
- T026 [US3] **취소** — 모킹 전용 계약 테스트를 제거했으므로 공통 setup으로 옮길 테스트가 없다.
- T027 [US3] **취소** — 어드민 SDK·모킹 전용 회귀 테스트를 추가하지 않는다.
- T028 [US3] **취소** — 웹 SDK·모킹 전용 회귀 테스트를 추가하지 않는다.
- [x] T029 [US3] 두 앱의 기존 기능 테스트를 실행하고 server 수명주기 설정과 실행 결과를 specs/011-openapi-msw/validation.md에 기록한다.

**독립 검증**: listen·resetHandlers·close 설정을 확인하고 기존 기능 테스트가 통과한다.
기능별 응답 override와 성공·오류 사례는 실제 기능을 구현할 때 해당 테스트에 추가한다.
**중단점**: 최소 설정과 기존 테스트 실행 결과를 리뷰받는다.

## 7단계 — 전체 검증 (공통 품질)

- [x] T030 node --run check와 node --run build를 실행하고 specs/011-openapi-msw/validation.md에 결과를 남긴다.
- [x] T031 apps/admin/.output/와 apps/web/.next/ 실행 번들에서 fixture·MSW 초기화 제외와 production 비활성화를 확인한다.
- [x] T032 두 앱의 플래그 on/off·worker 실패·기존 화면 회귀를 확인하고 .context/의 근거를 validation.md에 연결한다.

**완료 기준**: 품질 게이트·빌드·브라우저 검증을 통과하고 남은 제한을 구분한다.
**중단점**: 검증 결과를 리뷰받는다. 새로운 수정이 생기면 관련 검사만 다시 실행한다.

## 8단계 — 사용법과 인계 (공통 마무리)

- [x] T033 packages/api/README.md에 재생성·공개 진입점·fixture 추가·미구현 정책을 기록한다.
- [x] T034 apps/admin/README.md와 apps/web/README.md에 모킹 활성화·테스트·실패 복구·제외 범위를 기록한다.
- [x] T035 문서 포맷과 실행 안내를 검증하고 specs/011-openapi-msw/validation.md에 최종 결과·리뷰 요청을 정리한다.

**완료 기준**: 개발자가 문서만으로 재생성·브라우저 모킹·테스트를 실행할 수 있다.
**중단점**: 최종 리뷰를 요청한다. commit·push·PR은 자동 실행하지 않는다.

## 의존성과 병렬 가능성

진행 순서는 `1 → 승인 → 2 → 승인 → 3 → 승인 → 4 → 승인 → 5 → 승인 → 6 → 승인 → 7 → 승인 → 8`이다.
US1 완료가 최소 생성 기반이며 US2·US3은 그 결과를 소비한다. US2 fixture 검증은 브라우저 연결과 독립적이다.
같은 단계 안에서 두 앱의 별도 파일 점검은 병렬 가능하지만, 이 작업에서는 순서대로 수행한다.
단계 사이의 병렬 작업이나 선행 구현은 하지 않는다.

## 리뷰 기록

| 단계 | 작업 상태                             | 사용자 리뷰                                |
| ---- | ------------------------------------- | ------------------------------------------ |
| 1    | 문서 작성 완료                        | 사용자 “진행해”로 승인                     |
| 2    | 의존성·설정 완료                      | 사용자 “커밋하고 다음 진행해”로 승인       |
| 3    | API·MSW 생성 완료                     | 사용자 “커밋하고 다음 진행해”로 승인       |
| 4    | Faker·대표 응답 완료                  | 사용자 “다음 진행해”로 승인                |
| 5    | 개발 브라우저 연결 완료               | 사용자 “커밋 하고 다음 단계 진행해”로 승인 |
| 6    | 기능 테스트용 MSW 설정 완료           | 사용자 “다음 단계 진행해”로 승인           |
| 7    | 전체 품질·프로덕션·브라우저 검증 완료 | 사용자 “커밋하고 다음 진행해”로 승인       |
| 8    | README 문서화·인계 완료               | 사용자 “커밋하고 다음단계 진행해”로 승인   |

3단계 리뷰 수정에서 사용자 “그렇게 진행해”로 명세 예제 활용을 승인받아 source 설정 제거와 재생성을 수행했다.

사용자는 이어서 3단계 커밋과 4단계 진행·Faker 추가를 승인했다. 이후 사용자 “다음 진행해”로 4단계 리뷰와 5단계 착수를 승인했다. 당시 승인 범위는 5단계까지였다.

5단계 리뷰에서 사용자 “그렇게 수정해”로 모킹 전용 테스트 제거와 6단계 계획 축소를 승인했다.
이후 사용자 “커밋 하고 다음 단계 진행해”로 5단계 리뷰 승인과 6단계 진행을 승인했다.
4·5단계를 cf73b98에 커밋했으며 당시 승인 범위는 6단계까지였다.

사용자 “다음 단계 진행해”로 6단계 리뷰와 7단계 착수를 승인했다. 당시 승인 범위는 7단계까지였다.

사용자 “커밋하고 다음 진행해”로 7단계 리뷰와 8단계 착수를 승인했다. 6·7단계는 35d7fdc에 커밋했다.
사용자 “이해했어. 커밋하고 다음단계 진행해”로 8단계 최종 리뷰와 문서 커밋을 승인했다.
계획한 구현 단계는 모두 완료했으며 push·PR·merge는 별도 승인 범위다.
