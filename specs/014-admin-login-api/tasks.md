# 작업 목록: 관리자 로그인 API와 세션 연동

**입력**: `specs/014-admin-login-api/`의 명세·계획·조사·데이터 모델·내부 계약

**테스트 원칙**: 각 구현 단계에서 회귀 테스트를 먼저 추가해 실패를 확인하고 구현 뒤 통과시킨다.

**진행 원칙**: 단계 완료 보고와 사용자 승인을 받기 전에는 다음 단계 task를 시작하지 않는다.

## 1단계 — 이슈·명세·계획 리뷰

**목적**: 구현 전 인증 범위, 보안 경계, 복구와 검증 방법을 확정한다.

- [ ] T001 1단계 산출물의 사용자 리뷰 결과와 다음 단계 승인을 `specs/014-admin-login-api/validation.md`에 기록한다.

**체크포인트**: T001 승인 전에는 `apps/admin` 소스 코드를 수정하지 않는다.

---

## 2단계 — US2 브라우저 재시작 후 관리자 세션 사용 (P2)

**목표**: Staff access token을 안전하게 유지하고 생성 client의 Staff 요청에만 제공한다.

**독립 검증**: 저장·재조회·SSR·저장소 실패와 Staff/회원 인증 종류를 독립 단위 테스트로 확인한다.

- [x] T002 [US2] token 저장·재조회·빈 값·저장소 예외·SSR·인증 종류 테스트를 `apps/admin/src/features/login/admin-session.test.ts`에 먼저 추가하고 실패를 확인한다.
- [x] T003 [US2] `readAdminAccessToken`, `saveAdminAccessToken`, `configureAdminApiClient`를 `apps/admin/src/features/login/admin-session.ts`에 구현한다.
- [x] T004 [US2] 관리자 세션 함수를 `apps/admin/src/features/login/index.ts`에서 공개하고 `apps/admin/src/providers.tsx`에서 client 설정을 초기화한다.
- [x] T005 [US2] 2단계 집중 테스트와 변경량을 실행하고 결과·캐시 여부를 `specs/014-admin-login-api/validation.md`에 기록한 뒤 리뷰받는다.

**체크포인트**: 로그인 API는 아직 연결하지 않으며 2단계 승인 전 T006을 시작하지 않는다.

---

## 3단계 — US1 발급 계정으로 관리자 로그인 (P1) 🎯 MVP

**목표**: 기존 폼 계약을 유지하면서 생성된 Staff 로그인 SDK의 성공·실패를 제품 결과로 변환한다.

**독립 검증**: MSW로 요청 body, 200·401·기타 오류·잘못된 응답·저장 실패와 기존 token 보존을 확인한다.

- [x] T006 [US1] API 요청 변환과 성공·401·400·5xx·네트워크·검증·저장 실패 회귀 테스트를 `apps/admin/src/features/login/login.test.ts`에 먼저 추가하고 실패를 확인한다.
- [x] T007 [US1] 생성 SDK·Zod 검증·token 저장을 사용한 `Login` 어댑터를 `apps/admin/src/features/login/login.ts`에 구현한다.
- [x] T008 [US1] 개발용 직접 판정을 제거해 `apps/admin/src/features/login/login.mock.ts`와 `apps/admin/src/features/login/login.mock.test.ts`를 삭제한다.
- [x] T009 [US1] 3단계 집중 테스트와 변경량을 실행하고 결과·캐시 여부를 `specs/014-admin-login-api/validation.md`에 기록한 뒤 리뷰받는다.

**체크포인트**: API 어댑터까지 독립 검증하고 3단계 승인 전 폼·라우트 계약을 변경하지 않는다.

---

## 4단계 — US3 떠난 로그인 화면의 늦은 성공 격리 (P3)

**목표**: 모든 환경에서 실제 로그인 제출을 허용하고 현재 화면에 속한 성공만 이동시킨다.

**독립 검증**: 정상 성공은 이동하고 unmount 뒤 성공은 이동하지 않는 폼 수명 회귀를 확인한다.

- [x] T010 [US3] unmount 뒤 늦은 성공과 환경 제한 제거 회귀 테스트를 `apps/admin/src/features/login/login-form.test.tsx`와 `apps/admin/src/routes/login.test.tsx`에 먼저 추가하고 실패를 확인한다.
- [x] T011 [US3] `available` prop을 제거하고 제출별 성공 callback으로 이동을 제한하도록 `apps/admin/src/features/login/login-form.tsx`를 수정한다.
- [x] T012 [US3] 환경 제한을 제거하도록 `apps/admin/src/pages/login/ui/login-page.tsx`와 `apps/admin/src/routes/login.tsx`를 수정한다.
- [x] T013 [US3] 4단계 집중 테스트와 변경량을 실행하고 #157 회귀 결과를 `specs/014-admin-login-api/validation.md`에 기록한 뒤 리뷰받는다.

**체크포인트**: 정상 성공·오류 재시도·늦은 성공 격리를 함께 통과하고 4단계 승인 전 전체 검증을 시작하지 않는다.

---

## 5단계 — 전체 품질·브라우저·보안 검증

**목적**: 전체 저장소 품질 게이트와 세 실행 환경에서 사용자 흐름을 확인한다.

- [x] T014 로그인 집중 테스트, `node --run check`, `node --run build`를 실행하고 새 실행·Turbo 캐시·실패를 `specs/014-admin-login-api/validation.md`에 구분해 기록한다.
- [x] T015 MSW 개발·실서버 개발·프로덕션 빌드의 로그인, 재시작 후 Staff 인증과 늦은 성공을 `specs/014-admin-login-api/quickstart.md`대로 검증해 `specs/014-admin-login-api/validation.md`에 기록한다.
- [x] T016 실제 base 대비 변경량·format·비밀 비기록·복구 위험을 점검하고 최종 결과를 `specs/014-admin-login-api/validation.md`에 기록해 리뷰받는다.

## 의존성과 실행 순서

```text
1단계 문서 승인
  -> 2단계 US2 세션 기반
  -> 3단계 US1 실제 로그인 MVP
  -> 4단계 US3 화면 수명 격리
  -> 5단계 전체 검증
```

- 제품 우선순위는 US1이 가장 높지만, 실제 로그인 성공을 안전하게 저장하려면 US2 기반을 먼저
  구현해야 한다.
- US3은 실제 네트워크 요청이 연결된 US1 뒤에 검증한다.
- 단계별 리뷰 제약 때문에 단계 사이 또는 서로 다른 사용자 시나리오를 병렬 구현하지 않는다.

## 독립 완료 기준

- **US1**: 생성 SDK 요청과 성공·실패 매핑을 폼 이동 없이 독립 테스트할 수 있다.
- **US2**: 로그인 API 없이 합성 token으로 저장소와 Staff 전용 auth callback을 독립 테스트할 수 있다.
- **US3**: 주입한 `Login` promise로 화면 수명과 이동 callback을 독립 테스트할 수 있다.

## 구현 전략

1. 세션 기반을 작은 단위로 먼저 검증한다.
2. 실제 로그인 어댑터를 연결해 US1 MVP를 만든다.
3. 폼 수명 회귀와 프로덕션 활성화를 추가한다.
4. 전체 품질·브라우저·보안 검증으로 완료한다.
5. commit·push·PR 생성과 issue 종료는 작업 단계 승인과 별도로 사용자 승인을 받는다.
