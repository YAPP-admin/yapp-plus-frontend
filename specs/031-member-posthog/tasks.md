# 작업 목록: 회원 앱 PostHog

관련 이슈: [#669](https://github.com/YAPP-admin/yapp-plus-frontend/issues/669). 입력은 [계획](plan.md)·[명세](spec.md)·[계약](contracts/events.md)이다.
체크는 실제 완료만 표시한다. 각 리뷰 단위 이후 사용자 확인을 받고 다음 단위로 진행한다.

## 준비 — 계획 1단계

- [x] T001 `specs/031-member-posthog/spec.md`와 설계 산출물을 #669에 연결하고 사용자 결정·구현 범위를 반영한다.
- [x] T002 `specs/031-member-posthog/contracts/events.md`에 원문 40개·대상 24개·보류 16개 및 report_types 배열을 확정한다.
- [x] T003 `specs/031-member-posthog/validation.md`에 품질 게이트·문서 구조·변경량을 기록한다.

## 기반 — 계획 2단계

독립 검증: 설정이 없으면 전송 0건, 개인정보 마스킹, 사용자 전환 분리, 구형 브리지 fallback을 확인한다.
PR 크기에 따라 2a 의존성, 2b 설정·마스킹·Provider, 2c 식별·생명주기로 나누고 각 단위를 리뷰한다. 2a만으로 수집은 켜지지 않는다.

- [x] T004 `apps/web/package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`에 호환성이 확인된 웹 SDK를 catalog로 고정한다.
- [ ] T005 `apps/web/src/shared/lib/analytics/config.test.ts`에서 설정 누락·잘못된 host·로컬/Preview·모킹 비활성화를 검증한다.
- [ ] T006 `apps/web/src/shared/lib/analytics/config.ts`, `apps/web/.env.example`, `turbo.json`에 웹 환경 검증·기본 비활성·캐시 입력을 연결한다.
- [ ] T007 `apps/web/src/shared/lib/analytics/privacy.test.ts`와 `privacy.ts`에서 URL query/hash·동적 속성·입력·이미지 차단을 검증하고 마스킹 설정을 구현한다.
- [ ] T008 `apps/web/src/app/analytics-provider.tsx`, `apps/web/src/app/providers.tsx`에 단일 초기화·Provider·전송 실패 격리를 연결한다. 마스킹 준비 전 자동 수집·녹화를 활성화하지 않는다.
- [ ] T009 `apps/web/src/app/analytics-identity.tsx`와 인접 테스트에서 회원 ID 식별·계정 전환·로그아웃·탈퇴 reset을 구현하고 기존 인증 계정 경계를 재사용한다.
- [ ] T010 `packages/app-bridge/src/index.ts`와 인접 계약 테스트에 선택적 appLifecycleState를 추가하고 `apps/mobile/src/bridge.ts`에서 AppState 변화를 전달한다.
- [ ] T011 `apps/web/src/shared/lib/screen-activity.ts`와 인접 테스트에 native 상태·visibility 합성을 연결하고 중복 전면 복귀·구형 native fallback을 검증한다.
- [ ] T012 `specs/031-member-posthog/validation.md`에 2a/2b/2c별 check·build, 모바일 변경 시 doctor, 개발 프로젝트 개인정보 확인 결과를 기록한다.

## US1 — 인증·참여 분석 (계획 3·4단계, P1)

독립 검증: 직접 인증 결과별 1회, 취소·복원·갱신 0회, 실제 서버 제출만 시도로 집계한다. 인증과 출석은 각각 별도 리뷰 단위다.

- [ ] T013 [US1] `apps/web/src/features/auth/model/mutations.test.ts`에서 직접 인증 3종·취소·복원·늦은 계정 결과를 검증한 뒤 `mutations.ts`에 분석 콜백을 주입한다.
- [ ] T014 [US1] `apps/web/src/pages/signup/ui/signup-page.tsx`와 인접 테스트에 단계 완료·가입 신청을 연결하고 입력 원문을 제외한다.
- [ ] T015 [US1] `apps/web/src/pages/login/`, `apps/web/src/pages/signup-status/`, `apps/web/src/pages/settings/`의 기존 handler·테스트에 실패 안내·문의·로그아웃·탈퇴를 연결한다.
- [ ] T016 [US1] `apps/web/src/pages/home/model/code-attendance.ts`와 인접 테스트에 서버 제출 횟수·응답 성공 여부를 연결한다. 코드 시트 열기는 `apps/web/src/pages/home/ui/`에서 연결한다.
- [ ] T017 [US1] `apps/web/src/pages/home/model/attendance-report.ts`와 `apps/web/src/pages/home/ui/attendance-report-sheet.tsx` 및 인접 테스트에 시작·성공·명시적 이탈, report_types·is_edit·코드포인트 길이를 연결한다.
- [ ] T018 [US1] `apps/web/src/pages/team-attendance-upload/`와 진입 안내 handler·인접 테스트에 시작·업로드 성공·실패를 연결하고 사진 주소·원문 오류를 제외한다.
- [ ] T019 [US1] `specs/031-member-posthog/validation.md`에 인증 7개·출석 5개·팀 인증 3개 수신 및 중복 제외 증거를 기록한다.

## US2 — 탐색·알림 분석 (계획 5단계, P1)

독립 검증: 홈 전면 복귀 1회, 숨겨진 화면 재조회 0회, 공지 전면 시간, 푸시 재전달과 실제 재클릭 구분을 확인한다.

- [ ] T020 [US2] `apps/web/src/pages/notice-detail/`의 기존 handler·인접 테스트에 상세 노출·확인 클릭·링크 클릭·본문 끝과 전면 읽기 시간을 연결한다.
- [ ] T021 [US2] `apps/web/src/pages/home/ui/home-page.tsx`와 인접 테스트에 최초·화면 복귀·앱 전면 복귀 노출을 연결한다.
- [ ] T022 [US2] `apps/web/src/pages/alerts/ui/alerts-page.tsx`, `apps/web/stackflow/src/notification-navigation.tsx`와 인접 테스트에 in_app/push 구분·요청 중복 처리·ID 생략을 연결한다.
- [ ] T023 [US2] `apps/web/src/pages/dining/`, `apps/web/src/pages/my/`, `apps/web/src/pages/schedule/`의 활성 화면과 실제 규칙 표시 handler·테스트에 나머지 조회 이벤트를 연결한다.
- [ ] T024 [US2] `specs/031-member-posthog/validation.md`에 공지 3개·홈/알림/기타 조회 6개 수신 결과와 소스 경로를 기록한다.

## US3 — 안전한 녹화·환경 분리 (기반의 개인정보 검증, P1)

독립 검증: 가짜 개인정보로 전송 데이터와 녹화를 확인하며 이 결과 전에는 운영 수집을 켜지 않는다.

- [ ] T025 [US3] `apps/web/src/pages/`의 프로필·팀 인증·공지 이미지와 동적 속성에 차단 표시를 적용하고 실제 고정 버튼·메뉴만 노출한다.
- [ ] T026 [US3] `specs/031-member-posthog/validation.md`에 개발/운영 프로젝트 분리·100% 초기 녹화율·실제 개인정보 마스킹·수집 off 결과를 기록한다. 비밀 값은 기록하지 않는다.

## US4 — iOS 오류 추적 (계획 6단계, P2)

독립 검증: 릴리스 오류·native crash를 다음 실행 후 수신하고 OTA 전후 원본 코드 위치를 각각 확인한다.

- [ ] T027 [US4] `apps/mobile/package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`에 Expo 호환 SDK·native plugin·필요 모듈만 추가한다.
- [ ] T028 [US4] `apps/mobile/app/_layout.tsx`, `apps/mobile/src/analytics/`에 iOS 전용 오류 수집·회원 식별을 연결한다. native 행동·화면·생명주기 자동 수집·녹화·콘솔 수집은 끈다.
- [ ] T029 [US4] `apps/mobile/app.config.ts`, `apps/mobile/metro.config.js`, `apps/mobile/eas.json`에 공개 환경·새 appVersion runtime·소스맵·dSYM 업로드를 구성한다.
- [ ] T030 [US4] `.github/workflows/mobile-delivery.yml`, `.github/workflows/mobile-manual.yml`과 `apps/mobile/scripts/delivery-policy.test.ts`에 고정 CLI·비밀 업로드 키·실제 배포 산출물 업로드·실패 시 배포 중단을 연결한다.
- [ ] T031 [US4] `apps/mobile/src/analytics/` 인접 테스트에서 iOS/Android 설정·회원 분리·raw 오류 부가 정보 제외·SDK 실패 격리를 확인한다.
- [ ] T032 [US4] `specs/031-member-posthog/validation.md`에 새 릴리스 바이너리·OTA별 오류/크래시·심볼 해석 및 check·build·doctor 결과를 기록한다.

## 통합과 운영 — 계획 7단계

- [ ] T033 `specs/031-member-posthog/quickstart.md`의 실환경 시나리오를 실행하고 `validation.md`에 신규 실행·캐시·미실행을 구분한다.
- [ ] T034 `specs/031-member-posthog/validation.md`에 검증된 main SHA·운영 수집 설정·비활성화·호환 OTA·바이너리 복구 절차를 기록한다.

## 의존성과 실행 순서

T001–T003 → 2a(T004) → 2b(T005–T008, T025) → 2c(T009–T012) → US1 인증 → US1 출석 → US2 → US4 → 통합 순서다.
US3의 마스킹 구현은 기반 단계에서 수행하고 실제 수신 검증 T026은 각 기능 수신 검증과 함께 확인한다. 개인정보 검증 없이 운영 수집을 시작하지 않는다.
최소 사용 가능한 분석은 기반·US3 검증·US1 인증까지다. 전체 완료 조건은 구현 대상 24개와 iOS 오류 검증이다.

별도 작업자가 있다면 US1의 인증/출석 테스트, US2의 공지/알림 테스트, US3의 이미지/입력 점검, US4의 오류/배포 정책 테스트는 파일 경계를 나눠 병행할 수 있다. 현재는 단계별 리뷰 순서대로 진행하며 자동으로 다른 에이전트를 시작하지 않는다.
