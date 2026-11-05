# 작업 목록: iOS OIDC 인증

> T001–T034는 기존 이력이다. #329 보완은 T035부터 시작하며 과거 체크를 현재 결함 해결의 증거로 사용하지 않는다.

**입력**: [명세](spec.md), [계획](plan.md), [계약](contracts/auth.md), [상태 모델](data-model.md).

**규칙**: 단계별 사용자 리뷰와 명시적 다음 단계 승인이 선행한다. 체크 표시는 구현·자동 검증 완료를 뜻하며, 실제 기기·외부 서비스 검증은 별도 대기 항목으로 유지한다.

## 1단계 — 기반 명세와 계약

- [x] T001 main의 제품 맥락·규칙·인증 계약을 조사하고 research.md에 기록한다.
- [x] T002 spec.md, plan.md, contracts/auth.md, data-model.md와 quickstart.md 초안을 작성한다.
- [x] T003 .context/oidc-stage-1/evidence/openapi.json을 수신하고 checksum·operationId 차이를 기록한다.
- [x] T004 issue 생성과 현재 브랜치 main 동기화 승인 후 specs/016-ios-oidc-auth/에 정식 반영한다.
- [x] T005 main의 packages/api/openapi-ts.config.ts를 바탕으로 격리 재생성하여 register1과 6343줄 변경을 확인했다. 정식 반영은 별도 1B로 대기한다.
- [x] T006 validation.md에 정식 diff·check 결과·분리 필요 여부를 기록하고 1단계 리뷰를 받는다.

**중단점**: T006 이후 2단계 명시적 승인 전까지 시작하지 않는다. 6343줄 생성 diff는 backend 대기 후 별도 1B에서 검토·반영한다.

## 2단계 — 앱 기반 설정

- [x] T007 apps/mobile/app.config.ts에 확정 식별자·origin·Apple capability·Google callback 설정을 적용한다.
- [x] T008 apps/mobile/assets/에 실제 Figma 아이콘 export를 추가하고 apps/mobile/eas.json에 3종 빌드 프로필을 정의한다.
- [x] T009 apps/mobile/package.json, pnpm-workspace.yaml에 Expo 호환 SDK 의존성을 선언하고 lockfile을 갱신한다.
- [x] T010 apps/mobile/README.md의 Expo Go 가정을 development build 기준으로 갱신한다.
- [x] T011 validation.md에 설정·check/build/expo:doctor·가능한 simulator 빌드 결과를 기록하고 2단계 리뷰를 받는다.

**중단점**: 실기기 부재는 승인 후 3단계 구현을 막지 않는다. TestFlight 업로드·계정 변경은 여기서 자동 실행하지 않는다.

## 3단계 — 공용 계약과 네이티브 구현

- [x] T012 packages/app-bridge/src/index.ts와 web.ts에 메서드·검증된 결과·가용성·revision과 sessionId/tokenVersion 계약을 추가한다.
- [x] T013 apps/mobile/src/auth/session.test.ts에 복구/명시적 갱신의 single-flight·실패 후 Promise 해제·늦은 401·로그아웃 중 저장·이전 finally 경쟁 사례를 작성한다.
- [x] T014 apps/mobile/src/auth/session.ts와 storage.ts에 세션 수명·직렬 저장·generation 검사와 요청 버전 비교/갱신 Promise의 원자적 등록을 구현한다.
- [x] T015 [US1] apps/mobile/src/auth/providers.ts와 actions.test.ts에 두 SDK·nonce·취소 분기를 구현하고 검증한다.
- [x] T016 [US1] apps/mobile/src/auth/auth-api.ts에서 생성 SDK 호출·native 응답 검증·오류 변환을 구현한다.
- [x] T017 [US2] apps/mobile/src/auth/actions.ts와 actions.test.ts에 가입 토큰 수명·`010-0000-0000` 화면 형식 검증·전송 직전 E.164 변환·응답 유실 처리를 구현한다.
- [x] T018 [US3] apps/mobile/src/auth/session.ts에 getSession/refreshSession/signOut을 연결하고 서버 해제 결과를 구분한다.
- [x] T019 [US4] apps/mobile/src/auth/actions.ts와 actions.test.ts에 204 성공 후 정리·실패·결과 불명확을 구현한다.
- [x] T020 apps/mobile/src/bridge.ts에 계약을 등록하고 apps/mobile/app/index.tsx에 신뢰 origin·외부 탐색 정책을 적용한다.
- [x] T021 validation.md에 경계 테스트·기본 검증·미확인 SDK 실동작을 기록하고 3단계 리뷰를 받는다.

**독립 검증**: US1–US4는 실제 공급자/서버 대신 SDK·API·저장소 대역으로 검증한다.

## 4단계 — 사용자 이야기별 웹 연결

- [x] T022 [US1] apps/web/src/features/auth/에 세션 초기화·bridge 구독·보호 경계와 테스트 전용 대역을 추가한다.
- [x] T023 [US1] apps/web/src/pages/login/ui/login-page.tsx와 인접 테스트에 실제 호출·취소·실패·구버전 안내를 연결한다.
- [x] T024 [US2] apps/web/src/pages/signup/ui/signup-page.tsx와 인접 테스트에 입력·필드 오류·만료·가입 완료를 연결한다.
- [x] T025 [US3] apps/web/src/features/auth/에 요청 당시 sessionId/tokenVersion 캡처·native 갱신 연계와 늦은 401·계정 변경 시 재전송 차단·재시도 상한·403 비갱신 테스트를 구현한다.
- [x] T026 [US3] apps/web/stackflow/src/stack.tsx와 settings 페이지에 세션별 화면 초기화·캐시 정리·로그아웃을 연결한다.
- [x] T027 [US4] apps/web/src/pages/settings/ui/settings-page.tsx와 인접 테스트에 실제 탈퇴·실패·응답 유실을 연결한다.
- [x] T028 validation.md에 네 이야기의 화면·접근성·안전 영역 검증과 스크린샷 위치를 기록하고 4단계 리뷰를 받는다.

**독립 검증**: US1 로그인 결과, US2 가입 필요 상태, US3 복구 상태, US4 탈퇴 결과를 각각 주입해 검증한다.

## 5단계 — 통합 검증

- [x] T029 quickstart.md의 자동 시나리오·check/build/expo:doctor와 가능한 simulator 확인을 실행한다.
- [x] T030 validation.md에 신규 실행/캐시·실패/미실행·CORS/실기기 대기 항목을 구분해 5단계 리뷰를 받는다.

## 후속 외부 검증 — 현재 대기

- [x] T031 1B 별도 승인 후 packages/api/에서 최신 snapshot으로 재생성하고 mock·소비자 함수 변경, check 결과와 변경량을 validation.md에 기록한다.
- [ ] T032 validation.md에 서비스 origin의 인증된 실제 브라우저 요청 CORS 확인을 기록한다. OPTIONS·비인증 오류 응답 헤더는 확인했지만, 로그인 세션의 업무 API 요청은 대기다.
- [ ] T033 validation.md에 iPhone의 Apple/Google 로그인·가입·복구·로그아웃·테스트 계정 탈퇴 결과를 기록한다.
- [ ] T034 apps/mobile/README.md와 validation.md에 승인된 TestFlight 업로드·설치 결과, build number·commit SHA·웹 버전을 기록한다. build 15의 업로드·processing은 완료했고 설치 결과는 대기다.

## 의존성과 실행 전략

1A(문서) 승인 → 2단계 승인 → 3단계 승인 → 4단계 승인 → 5단계. 1B(API 재생성)는 backend 반영·변경량 검토 후 별도 승인으로 실행하고 3단계 코드와 계약을 다시 대조한다. 외부 검증 T031–T034은 준비될 때 별도 리뷰한다.
US2–US4는 US1의 세션 기반을 사용한다. 최소 시연은 US1의 기존 회원 로그인이며 나머지 범위를 생략한 완료로 보고하지 않는다.
단계 내 서로 다른 provider 조사·US별 테스트 설계는 독립적으로 가능하지만 제품 구현 단계와 리뷰 경계를 넘겨 병렬 실행하지 않는다.
테스트는 명세가 요구한 실패 가능성을 가장 가까운 계층에서 확인하며 라이브러리 자체를 중복 검증하지 않는다.

## #329 보완 0단계 — 명세와 연계

- [x] T035 `specs/016-ios-oidc-auth/spec.md`, `plan.md`, `research.md`에 R1–R6·p-mutex·#328 연계와 이슈 #329를 기록한다.
- [x] T036 `specs/016-ios-oidc-auth/data-model.md`, `contracts/auth.md`, `quickstart.md`, `tasks.md`에 상태·오류·회귀 검증·단계별 작업을 보완한다.
- [x] T037 `specs/016-ios-oidc-auth/validation.md`에 문서 검사·check·변경량을 기록하고 0단계 결과를 제출한다.

**중단점**: 리뷰 반영 및 다음 단계 승인 전 제품 코드·p-mutex 설치를 시작하지 않는다.

## 보완 1단계 — R1 공통 네이티브 세션 기반

독립 검증: US1 로그인·US2 가입·US3 복구를 각각 지연하고 logout 후 반환해 메모리·저장소 비복원을 확인한다.

- [ ] T038 `apps/mobile/src/auth/session.test.ts`, `actions.test.ts`에 R1 지연·저장 실패·이전 finally 회귀를 먼저 추가해 수정 전 실패를 확인한다.
- [x] T039 `pnpm-workspace.yaml`, `apps/mobile/package.json`, `pnpm-lock.yaml`에 p-mutex@1.0.0을 추가하고 `apps/mobile/src/auth/session.ts`의 저장·메모리 확정을 직렬화한다.
- [ ] T040 `apps/mobile/src/auth/actions.ts`, `session.ts`에 작업 시작 세대·조건부 결과 반영·즉시 logout 무효화·삭제 예약·가입 자격 정리를 구현한다.
- [x] T041 `apps/mobile/src/auth/session.ts`에 restore/refresh의 세대·대상별 single-flight와 identity-safe finally, 삭제 실패 후 복구 차단을 적용한다.
- [ ] T042 `specs/016-ios-oidc-auth/validation.md`에 R1·check/build/expo:doctor·Metro 결과와 #328 웹 연계 미검증을 기록하고 리뷰받는다.

1A에서 T039·T041과 T038의 session 회귀, T042의 기반 검증을 완료했다. T038의 actions 회귀·T040과 전체 R1 보고는 1B에 남긴다.
1A 리뷰 수정에서 필수 세대 인자에 맞춰 로그인·가입의 세대 전달과 회귀 2건을 추가했다. 나머지 actions 무효화·로그아웃 순서·가입 자격 정리는 1B에 남긴다.
**중단점**: 1A 리뷰와 1B 진행 확인 전 AuthActions 연결을 시작하지 않는다.

## 보완 2단계 — R2 US3 갱신 오류

- [ ] T043 [US3] `apps/mobile/src/auth/session.test.ts`, `actions.test.ts`에 renew 401·timeout·5xx·잘못된 200·저장 실패·구 세션 오류 사례를 추가한다.
- [ ] T044 [US3] `apps/mobile/src/auth/auth-api.ts`, `actions.ts`, `session.ts`에서 HTTP status를 보존하고 대상 검사 후 자격 정리·보존과 오류를 분류한다.
- [ ] T045 [US3] `specs/016-ios-oidc-auth/validation.md`에 R2 회귀·품질 게이트 결과를 기록하고 리뷰받는다.

## 보완 3단계 — R3 US1 iOS 설정

- [ ] T046 [US1] `apps/mobile/src/auth/providers.ts`에 명시적 iosClientId를 전달하고 `apps/mobile/app.config.ts`의 scheme 대응과 인접 설정 테스트를 확인한다.
- [ ] T047 [US1] `.context/oidc-hardening-stage-3/`의 격리 출력에서 숨겨진 plist 없는 깨끗한 iOS 생성·빌드와 초기화를 확인하고 `specs/016-ios-oidc-auth/validation.md`에 실행 가능 범위·실기기 미확인을 기록한다.
- [ ] T048 [US1] `specs/016-ios-oidc-auth/validation.md`에 check/build/expo:doctor와 설정 diff를 기록하고 리뷰받는다.

## 보완 4단계 — R4 US1 silent nonce 조사

- [ ] T049 [US1] `specs/016-ios-oidc-auth/research.md`에 고정 SDK의 signIn/restore/getTokens와 nonce 발급·재시도·로그아웃 후 재로그인 근거 및 안전한 대안을 정리한다.
- [ ] T050 [US1] `specs/016-ios-oidc-auth/plan.md`, `tasks.md`, `validation.md`에 구현 가능 여부·추가 검증·제품 동작 변경 조건을 제출하고 사용자 리뷰로 후속 구현 범위를 확정한다. 조사만으로 R4를 완료 처리하지 않는다.

## 보완 5단계 — R5 US3 웹 브리지 복구

- [ ] T051 [US3] `specs/016-ios-oidc-auth/plan.md`에서 #328 통합 상태·공통 인증 적용 경로·복귀 이벤트 소유권을 재확인하고 적용 순서를 확정한다.
- [ ] T052 [US3] `apps/web/src/features/auth/model/session.test.tsx`에 undefined/timeout→준비·unsupported·최소 간격 재시도·늦은 query 결과 회귀를 추가한다.
- [ ] T053 [US3] `apps/web/src/features/auth/model/native-auth.ts`, `session.tsx`, `mutations.ts`에서 가용성·조회 오류·재조회를 #328 공통 적용 경로에 연결한다. 별도 웹 세대 관리자를 만들지 않는다.
- [ ] T054 [US3] `apps/web/src/features/auth/`의 보호 경계·재시도 안내와 인접 화면 테스트를 갱신하고 `specs/016-ios-oidc-auth/validation.md`에 R1 웹 전파·R5·접근성·화면·check/build 결과를 기록해 리뷰받는다.

## 보완 6단계 — R6 공지 상세 mock

- [ ] T055 `apps/admin/src/mocks/api-contract.test.ts`의 기존 Vitest 환경에서 `@yapp-plus/api/mocks`를 사용하는 공지 상세 URL 회귀 테스트를 추가해 현재 실패를 확인한다.
- [ ] T056 `packages/api/src/mocks/handlers.ts`에 detail1의 faker·생성 schema를 연결하고 기존 detail을 보존한다. `specs/016-ios-oidc-auth/validation.md`에 URL·응답 검증·check 결과를 기록해 리뷰받는다.

## 보완 7단계 — 통합 검증

- [ ] T057 `specs/016-ios-oidc-auth/quickstart.md`의 R1–R6 회귀와 check/build/expo:doctor·Metro/Hermes·가능한 iOS 검증을 실행하고 `validation.md`에 신규 실행·캐시·실패·미실행을 구분한다.
- [ ] T058 `specs/016-ios-oidc-auth/validation.md`에 #328 연계·R4 미해결 여부·실기기 대기·롤백·실제 base 변경량을 기록하고 최종 리뷰를 받는다. TestFlight/EAS 배포는 별도 승인 대상이다.

실행 순서는 보완 0→1→2→3→4(조사 리뷰)→5→6→7이다. 각 화살표에 사용자 리뷰와 다음 단계 승인이 필요하다.
공통 기반 R1은 US1·US2·US3을 함께 검증한다. R3·R4는 US1, R2·R5는 US3, R6은 별도 mock 회귀다.
가장 작은 독립 개선은 네이티브 R1이며 여섯 결함 전체 완료와 구분한다. US4 탈퇴 기능 확장은 하지 않는다.
추가 작업은 24개(공통·검증 12, US1 5, US3 7)다. 같은 인증 파일을 건드리는 단계 간 병렬 구현은 하지 않는다.
