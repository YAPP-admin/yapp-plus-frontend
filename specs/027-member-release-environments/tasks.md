# 태스크: 회원 웹과 iOS 앱의 개발·운영 배포 분리

**입력**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [배포 계약](contracts/delivery.md).
**규칙**: [P]는 같은 리뷰 단계 안에서만 병렬 가능한 작업이다. 사용자 단계 리뷰를 우회하지 않는다.
테스트는 명세의 회귀·수용 조건을 검증한다. 외부 설정값·자격 정보는 문서에 복사하지 않는다.

## 1A — 문서 준비

- [x] T001 이슈 #512 생성·조회와 기준 commit·실행 범위를 validation.md에 기록한다.
- [x] T002 spec.md와 checklists/requirements.md에 사용자 시나리오·요구사항·범위를 작성한다.
- [x] T003 plan.md, research.md, data-model.md, contracts/delivery.md, quickstart.md와 tasks.md를 작성한다.
- [x] T004 문서 링크·요구사항 추적·포맷·기본 check·변경량을 확인해 validation.md에 기록한다.
- [ ] T005 문서 리뷰와 1B 진행 확인 결과를 validation.md에 기록한다.

## 1B — 공통 외부 준비

- [x] T006 Doppler yapp-plus-web dev/prd와 Vercel sync·override를 준비하고 validation.md에 값 없이 기록한다. (FR-004)
- [x] T007 개발 전용 alias·WebView 접근·Git 자동 배포 설정을 확인해 validation.md에 기록한다. (FR-003)
- [ ] T008 GitHub 환경·EAS 환경/채널·API·OAuth·Firebase 조합과 복구 기준을 validation.md에 기록한다. (FR-005, FR-013)
- [ ] T009 contracts/delivery.md의 입력 준비 결과를 검토하고 웹 단계 진행 확인을 validation.md에 기록한다.

## 2 — US1: 회원 웹 설정 (P1)

**목표·독립 검증**: PR Preview에서 개발 API를 사용하고 운영 설정·관리자에는 영향을 주지 않는다.

- [x] T010 [P] [US1] apps/web/src/app/api-environment.test.ts에 누락·잘못된 URL·초기화 순서 회귀 테스트를 작성한다. (FR-005)
- [x] T011 [US1] apps/web/src/app/api-environment.ts와 apps/web/stackflow/src/main.tsx에 환경 검증·공개 client 초기화를 구현한다. (FR-005)
- [x] T012 [US1] apps/web/vite.config.ts, turbo.json, .github/workflows/ci.yml에 빌드 입력 검증·캐시·테스트용 URL을 연결한다. (FR-004)
- [x] T013 [US1] package.json, apps/web/.env.example, apps/web/README.md에 Doppler 로컬 실행·설정 재빌드 절차를 반영한다. (FR-004)
- [ ] T014 [US1] quickstart.md의 웹 설정·캐시·관리자 회귀와 check/build를 수행하고 validation.md에 결과·리뷰를 기록한다. (FR-003, FR-014)

## 3 — US2: iOS 환경과 세션 (P1)

**목표·독립 검증**: QA/운영 IPA의 접속·인증·푸시가 일치하고 환경 전환 시 세션이 섞이지 않는다.

- [ ] T015 [P] [US2] apps/mobile/scripts/environment-config.test.ts에 프로필·APP_ENV·URL·OAuth·plist 검증 fixture를 작성한다. (FR-005)
- [ ] T016 [P] [US2] apps/mobile/src/auth/storage.test.ts에 구형 키 삭제·개발/운영 세션 격리·복원 회귀를 추가한다. (FR-006)
- [ ] T017 [US2] apps/mobile/app.config.ts, apps/mobile/eas.json에 프로필·공개 설정·IPA 전용 파일 검사와 appVersion 증가를 반영한다. (FR-005, FR-007)
- [ ] T018 [US2] apps/mobile/src/api-environment.ts, apps/mobile/app/_layout.tsx, apps/mobile/src/auth/providers.ts에 요청 전 환경 설정을 연결한다. (FR-005)
- [ ] T019 [US2] apps/mobile/src/auth/storage.ts의 키를 환경별로 바꾸고 알림의 기존 project/FID 격리를 유지한다. (FR-006)
- [ ] T020 [US2] .github/workflows/mobile-manual.yml, mobile-delivery.yml, mobile-native-check.yml의 환경 공급·검사를 설정과 함께 갱신한다. main 반영 전 게시 중지를 validation.md에 기록한다. (FR-007, FR-011)
- [ ] T021 [US2] apps/mobile/README.md를 갱신하고 QA IPA·로그인·푸시·기본 게이트·양 OS 검사·리뷰 결과를 validation.md에 기록한다. (FR-005, FR-007)

## 4A — US3: 출처와 영향 판정 (P1)

**목표·독립 검증**: 외부 CLI를 대체한 테스트에서 검증된 후보의 누적 변경만 선택한다.

- [ ] T022 [P] [US3] .github/scripts/member-delivery.test.ts에 태그·CI 출처·최초/조회 오류·누적 변경·부분 실패 사례를 작성한다. (FR-002, FR-008, FR-009)
- [ ] T023 [US3] .github/scripts/member-delivery.ts에 웹 성공 기록·출처·영향 판정을 구현하고 package.json의 test:delivery를 test/check에 연결한다. Node 내장 테스트를 사용한다. (FR-002, FR-008, FR-009)
- [ ] T024 [US3] apps/mobile/scripts/ota-impact.test.ts와 .github/workflows/mobile-delivery.yml의 기존 EAS 기준 조회를 환경별로 확장한다. (FR-008, FR-009)
- [ ] T025 [US3] validation.md에 4A 회귀·변경량·리뷰 결과를 기록하고 4B 진행 확인을 받는다.

## 4B — US3·US4: workflow와 복구 (P1/P2)

**목표·독립 검증**: 개발·운영 목적지를 분리하고 동시 실행·재실행에서 정상 결과를 보존한다.

- [ ] T026 [US3] .github/workflows/cd.yml, member-release.yml, mobile-delivery.yml에 개발 자동·태그 운영 경로를 연결한다. 회원 웹 전환 전 자동 배포 중지를 validation.md에 기록한다. (FR-001, FR-002, FR-014)
- [ ] T027 [US3] .github/actions/vercel-deploy/action.yml에 개발 전용 alias·metadata·연결 확인을 추가하고 deploy-preview.yml의 PR 목적지를 유지한다. (FR-003)
- [ ] T028 [US3] .github/workflows/deploy-manual.yml, mobile-manual.yml에 tag/force·환경·artifact 출처 계약을 연결한다. (FR-011, FR-014)
- [ ] T029 [US4] .github/scripts/member-delivery.test.ts에 공통 잠금·구버전·force 우회 차단·외부 성공/기록 실패 회귀를 추가한다. (FR-010, FR-012)
- [ ] T030 [US4] .github/workflows/의 회원 자동·수동 진입점에 대상별 잠금·직전 검증·최소 권한·결과 기록을 연결한다. (FR-010, FR-012)
- [ ] T031 [US4] README.md, apps/mobile/README.md, quickstart.md에 채널별 복구·기록 실패 대조·명시적 재개 절차를 반영한다. (FR-013)
- [ ] T032 [US4] validation.md에 전체 회귀·관리자·브리지 호환·게이트·PR 크기·4B 리뷰를 기록한다. (FR-014)

## 5 — 전환·마무리

- [ ] T033 quickstart.md 순서로 개발 배포·새 QA IPA·환경 전환·호환/비호환 OTA를 검증해 validation.md에 기록한다. (SC-001, SC-003, SC-005)
- [ ] T034 검증 SHA의 첫 정식 태그·운영 배포·별도 production IPA 검증을 수행해 validation.md에 기록한다. 실제 실행 전 승인 대상을 확인한다. (SC-002, SC-005)
- [ ] T035 quickstart.md의 부분 실패·웹/OTA 복구·정상 source 기록을 확인하고 validation.md에 결과를 남긴다. (SC-004, SC-006)
- [ ] T036 개발 자동 배포 재개 후 운영 불변과 최종 리뷰를 validation.md에 기록한다. 기존 019 명세에 적용 완료된 대체 정책만 연결한다. (SC-001)

## 의존성과 실행 전략

1A → 리뷰 → 1B → 리뷰 → US1 → 리뷰 → US2 → 리뷰 → 4A → 리뷰 → 4B → 리뷰 → 전환 순서다.
US1은 PR Preview까지 독립 검증하고, US2는 수동 IPA까지 검증한다. 자동 운영 활성화는 마지막이다.
병렬 예: T015 설정 fixture와 T016 저장소 회귀는 같은 단계에서 병렬 준비할 수 있다.
US1·US3·US4는 각 판정 테스트를 독립 실행할 수 있으나 공유 workflow 수정은 순차로 수행한다.
실행 명령·필요 설정은 quickstart와 계약을 따른다. commit·push·PR·원격 변경은 단계 진행과 별도로 승인 범위를 확인한다.
