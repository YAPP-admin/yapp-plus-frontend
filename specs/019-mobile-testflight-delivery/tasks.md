# 작업 목록: TestFlight 자동 OTA와 조건부 iOS 빌드

**입력**: [명세](spec.md), [계획](plan.md), [상태 모델](data-model.md), [계약](contracts/delivery.md)
**진행 경계**: 0단계 리뷰와 1단계 진행이 승인되었다. 2단계 이후는 단계별 리뷰 후 진행한다.
**표기**: T번호는 작업 ID, US번호는 사용자 시나리오, [P]는 같은 단계 안에서만 병렬 가능한 작업이다.

## 0단계 — 준비와 설계

- [x] T001 기존 이슈를 조회하고 승인된 #367을 생성한 뒤 specs/019-mobile-testflight-delivery/spec.md에 연결한다.
- [x] T002 specs/019-mobile-testflight-delivery/spec.md에 확정 정책·시나리오·수용 기준을 작성한다.
- [x] T003 specs/019-mobile-testflight-delivery/plan.md와 research.md에 고정 소스 조사·구현 경계·복구 계획을 기록한다.
- [x] T004 specs/019-mobile-testflight-delivery/data-model.md와 contracts/delivery.md에 상태·운영 입력을 정의한다.
- [x] T005 specs/019-mobile-testflight-delivery/quickstart.md와 tasks.md에 단계별 검증·의존 작업을 작성한다.
- [x] T006 specs/019-mobile-testflight-delivery/validation.md에 문서·품질 게이트 결과와 실제 미확인 조건을 기록한다.
- [x] T007 specs/019-mobile-testflight-delivery/validation.md에 사용자 리뷰와 1단계 진행 확인을 기록한다.

## 1단계 기반 — 정책 실행 구조

- [ ] T008 apps/mobile/scripts/delivery/config.mjs에 공개 프로필 해석·환경/식별자 검증·도구 버전 검사를 구현한다.
- [ ] T009 apps/mobile/scripts/delivery/ledger.mjs에 읽기 계약과 대역, 누락·조회 오류·pagination 구분을 구현한다.
- [ ] T010 apps/mobile/package.json의 Vitest와 Node 테스트 수집 경로를 분리하고 양쪽 실행·실패 전파·루트 check 연결을 검증한다.

## 1단계 US1 — PR 호환성 검사와 보고 전용 판정

**독립 검증**: 실제 게시 없이 버전 누락 PR 실패와 main 누적 판정 결과를 확인한다.

- [ ] T011 [P] [US1] apps/mobile/scripts/delivery/policy.test.mjs에 버전·미반영 변경·bootstrap·대기·실패 판정 회귀를 작성한다.
- [ ] T012 [P] [US1] apps/mobile/scripts/delivery/fingerprint.test.mjs에 source 누락·native patch·정책 완화 차단·base 도구/대상 의존성 resolve·OS 경로 정규화를 검증한다.
- [ ] T013 [US1] apps/mobile/scripts/delivery/fingerprint.mjs에 iOS source 수집·수집 성공 확인·별도 빌드 구성 digest를 구현한다.
- [ ] T014 [US1] apps/mobile/scripts/delivery/policy.mjs에 spec FR-001–FR-005·FR-007·FR-010–FR-015의 순수 판정을 구현한다.
- [ ] T015 [US1] .github/workflows/ci.yml에 독립된 읽기 전용 PR merge/base job을 연결한다. persist-credentials:false, 비밀·인증 캐시·artifact 미사용을 same-repo/fork 모두 검증한다.
- [ ] T016 [US1] .github/workflows/mobile-delivery.yml에 성공 main CI와 report-only Summary를 연결한다.
- [ ] T017 [US1] specs/019-mobile-testflight-delivery/validation.md에 두 OS source/hash·native digest·최종 키·입력 조건을 기록한다. 불일치 시 2단계 차단, 도구/정책 변경 시 재검증한다.

## 2단계 US2 — 조건부 IPA 생성

**독립 검증**: 새 runtime의 IPA 생성·메타데이터 확인·재사용을 제출 없이 확인한다.

- [ ] T018 [P] [US2] apps/mobile/scripts/delivery/build.test.mjs에 IPA 식별자·digest·만료·중복 요청 검증을 작성한다.
- [ ] T019 [P] [US2] apps/mobile/scripts/delivery/ledger.test.mjs에 불변 result·auto_merge/auto_inactive·초기화 후 기록 소실·미실행 종결·현재 상태 검증을 작성한다.
- [ ] T020 [US2] apps/mobile/scripts/delivery/ledger.mjs에 initialization/operation/build-result/operation-resolution과 동일 runtime 키 예약을 구현한다. 초기화·미실행 확인은 검증된 main의 수동 진입점으로만 허용한다.
- [ ] T021 [US2] apps/mobile/scripts/delivery/build.mjs에 local build·IPA 검사·build number·출처 메타데이터를 구현한다.
- [ ] T022 [US2] .github/workflows/mobile-delivery.yml에 도구체인·서명 정리·공통 잠금·artifact 30일 보관을 연결하고 mobile-manual.yml에 initialize/resolve-operation 진입점을 추가한다.
- [ ] T023 [US2] apps/mobile/app.config.ts와 eas.json에 새 기준 버전·명시적 production 환경을 반영한다.
- [ ] T024 [US2] specs/019-mobile-testflight-delivery/validation.md에 자격 증명 준비·실제 IPA 생성·단계 리뷰를 기록한다.

## 3단계 US3 — 수동 제출과 활성화

**독립 검증**: 지정 IPA만 제출되고 설치 확인 전까지 자동 OTA가 차단되는지 확인한다.

- [ ] T025 [P] [US3] apps/mobile/scripts/delivery/manual.test.mjs에 잘못된 출처·입력·digest·역방향 활성화 회귀를 작성한다.
- [ ] T026 [P] [US3] apps/mobile/README.md에 새 기준 설치·로그인·WebView·위치 확인·수동 활성화 절차를 문서화한다.
- [ ] T027 [US3] apps/mobile/scripts/delivery/manual.mjs에 submit/activate/rebuild/evaluate 입력 검증과 이력 연결을 구현한다.
- [ ] T028 [US3] .github/workflows/mobile-manual.yml에 main 전용 수동 진입점·동일 잠금·활성화 후 최신 main 재평가를 연결한다.
- [ ] T029 [US3] specs/019-mobile-testflight-delivery/validation.md에 실제 제출·설치·핵심 기능 확인·활성화·단계 리뷰를 기록한다.

## 4단계 US4 — 자동 OTA와 복구

**독립 검증**: 실제 OTA 적용·롤백과 외부 성공/기록 실패 대역을 확인한다.

- [ ] T030 [P] [US4] apps/mobile/scripts/delivery/update.test.mjs에 최신성·멱등성·불명확한 외부 결과·설정 불일치를 검증한다.
- [ ] T031 [P] [US4] apps/mobile/scripts/delivery/recovery.test.mjs에 지속 pause·복구 실패·정상 group/embedded·복구 SHA 비교·resume 승인 키를 검증한다.
- [ ] T032 [US4] apps/mobile/scripts/delivery/update.mjs에 게시 직전 재검사·고정 CLI 게시·외부 결과 이력 복구를 구현한다.
- [ ] T033 [US4] apps/mobile/scripts/delivery/recovery.mjs에 pause/rollback/resume와 정상 group 의미 검증을 구현한다.
- [ ] T034 [US4] .github/workflows/mobile-delivery.yml과 mobile-manual.yml에 active·pause 우선 정책과 OTA·복구를 연결한다. active 승격 직후 evaluate로 누적 변경을 처리하는 회귀를 검증한다.
- [ ] T035 [US4] specs/019-mobile-testflight-delivery/validation.md에 실기기 OTA·롤백·경합·중복 실행·단계 리뷰를 기록한다.

## 마무리 — 운영 인계

- [ ] T036 apps/mobile/README.md에 main 자동화·수동 작업·artifact 만료·구버전 지원 경계·복구를 정리한다.
- [ ] T037 specs/019-mobile-testflight-delivery/validation.md에 최종 check/build/expo:doctor의 새 실행·캐시·미실행을 구분한다.

## 의존성과 전달 전략

T001–T007 → T008–T010 → US1(T011–T017) → US2(T018–T024) → US3(T025–T029) → US4(T030–T035) → T036~T037.
MVP는 US1의 보고 전용 흐름이다. 사용자 리뷰 없이는 다음 단계로 넘어가지 않는다.
US1 정책/수집 테스트, US2 빌드/기록 테스트, US3 입력 테스트/운영 문서, US4 게시/복구 테스트는 각 쌍만 병렬 가능하다.
공유 workflow·ledger 수정은 순차 진행한다. [P]는 에이전트 자동 생성이나 다음 단계 선행 구현을 승인하지 않는다.
각 단계 PR은 전체 추가·삭제 800줄 미만으로 제한하며 650줄부터 별도 검토 가능한 PR로 분리한다.
이슈·commit·push·PR·실제 배포 승인 범위는 GitHub 스킬을 따른다. 작업 체크는 실증한 범위만 완료 처리한다.
