# 작업 목록: 회원 알림함과 iOS 푸시

입력: [명세](spec.md)·[계획](plan.md)·[모델](data-model.md)·[계약](contracts/notifications.md).
테스트는 FR-009와 저장소 규칙에 따라 각 변경에 포함한다. [P]는 같은 리뷰 단위의 독립 파일만 뜻한다.
현재 제품 구현은 시작하지 않았다. 체크된 항목은 1단계 산출물이며 리뷰 완료를 의미하지 않는다.

## 준비 — 단계 1

- [x] T001 최신 main과 기존 계약을 대조하고 specs/023-member-notifications/research.md에 기록한다.
- [x] T002 specs/023-member-notifications/spec.md와 checklists/requirements.md에 시나리오·품질 검토를 작성한다.
- [x] T003 specs/023-member-notifications/plan.md·data-model.md·contracts/notifications.md에 단계·수명·계약을 작성한다.
- [x] T004 specs/023-member-notifications/quickstart.md·tasks.md·issue-draft.md에 검증·실행 순서·이슈 초안을 작성한다.
- [x] T005 specs/023-member-notifications/validation.md에 1단계 check·문서 검증·변경량을 기록한다.
- [x] T006 specs/023-member-notifications/issue-draft.md의 생성 승인을 받아 이슈 번호를 spec.md에 연결하고 1단계 리뷰를 완료한다.

## 공통 기반

새 공용 패키지·미사용 기반 구현은 없다. T006 후 생성 SDK·기존 인증·화면 경계를 재사용한다.
네이티브에만 필요한 Firebase 기반은 US2 단계 4에서 추가하므로 웹 MVP를 가로막지 않는다.

## US1 — 알림함 데이터·화면 (단계 2 → 리뷰 → 단계 3)

독립 검증: quickstart Q01~Q03, Q13. 우선 MVP는 US1까지다.

- [x] T007 [US1] apps/web/src/pages/alerts/model/alerts-query.test.ts에 날짜·cursor·401/503 회귀를 작성한다.
- [x] T008 [US1] apps/web/src/pages/alerts/model/alerts-query.ts·alerts-display.ts에 생성 find3InfiniteOptions·날짜 처리를 구현한다.
- [x] T009 [US1] apps/web/src/mocks/member-notification-handlers.ts와 browser.ts·server.ts에 개발/테스트 핸들러를 연결한다.
- [x] T010 [US1] apps/web/src/pages/alerts/model/alerts-query.ts에 첫 페이지 갱신·오류 보존·계정 취소를 연결한다.
- [x] T011 [US1] specs/023-member-notifications/validation.md에 2단계 검증·변경량·사용자 리뷰를 기록한다.
- [ ] T012 [P] [US1] apps/web/src/pages/alerts/ui/alerts-page.test.tsx에 목록 상태·추가 조회·일반/공지 링크 테스트를 작성한다.
- [ ] T013 [P] [US1] apps/web/stackflow/src/stack.test.tsx에 알림 직접 진입·상세 왕복·시연 query 제거 회귀를 작성한다.
- [ ] T014 [US1] apps/web/src/pages/alerts/ui/alerts-page.tsx에 실제 query·기존 공통 경계·상태별 UI·상세 링크를 연결한다.
- [ ] T015 [US1] apps/web/stackflow/src/stack.tsx·activities/activities.tsx에서 empty 파라미터·showEmpty를 제거하고 기존 부모 탐색을 유지한다.
- [ ] T016 [US1] specs/023-member-notifications/validation.md에 3단계 check/build·접근성·캡처·사용자 리뷰를 기록한다.

## US2 — 네이티브 설정 기반 (단계 4-A → 리뷰 → 4-B → 리뷰 → 4-C)

독립 검증: Q04~Q06. 단계 6 UI 완료 전에도 어댑터와 동기화를 독립 검증한다.

- [ ] T017 [US2] pnpm-workspace.yaml·apps/mobile/package.json·pnpm-lock.yaml에 설치 시점 최신 안정 Firebase app/messaging/installations를 호환 버전으로 고정한다.
- [ ] T018 [US2] apps/mobile/app.config.ts·eas.json·README.md와 .gitignore에 Firebase 환경·APNs·dynamic frameworks·설정 파일 보호·새 runtime을 반영한다.
- [ ] T019 [US2] specs/023-member-notifications/validation.md에 4-A check/build·expo:doctor·iOS 빌드·변경량·리뷰를 기록한다.
- [ ] T020 [P] [US2] apps/mobile/src/notifications/storage.test.ts·storage.ts에 설치별 선택·손상·읽기/쓰기 실패 처리를 구현한다.
- [ ] T021 [P] [US2] apps/mobile/src/notifications/registration.test.ts·registration.ts에 직렬화·서버 성공·OFF 해제·409·세션 경계 검증을 구현한다.
- [ ] T022 [US2] apps/mobile/src/notifications/notification-api.ts에 생성 register/remove·HTTP 성공 확인·401 복구 어댑터를 구현한다.
- [ ] T023 [US2] specs/023-member-notifications/validation.md에 4-B 테스트·check·사용자 리뷰를 기록한다.
- [ ] T024 [US2] apps/mobile/src/notifications/native-notification-runtime.ts·runtime.test.ts에 Firebase/권한·리스너·복귀 동기화를 연결한다.
- [ ] T025 [US2] apps/mobile/app/_layout.tsx·src/auth/native-auth-runtime.ts에 최초 인증·복원·token 갱신 동기화를 중복 없이 연결한다.
- [ ] T026 [US2] specs/023-member-notifications/validation.md에 4-C 수명·권한·복귀 테스트·check/build·리뷰를 기록한다.

## US3 — 합의된 로그아웃 정책 (단계 5)

독립 검증: Q06~Q07. 등록 어댑터를 대체해 서버 성공/실패와 인증 경합을 재현한다.

- [ ] T027 [US3] apps/mobile/src/auth/actions.test.ts·session-recovery.test.ts에 서버 실패 유지·성공 후 삭제·갱신 완료 뒤 최신 token revoke 회귀를 작성한다.
- [ ] T028 [US3] apps/mobile/src/auth/actions.ts·auth-api.ts·session.ts에 revoke 성공 검증·작업 조율·로컬 삭제 복구를 구현한다.
- [ ] T029 [US3] apps/web/src/features/auth/model/operations.ts·mutations.test.ts에 로그아웃 실패 시 세션/cache 유지와 mutation 진행 상태를 연결한다.
- [ ] T030 [US3] specs/023-member-notifications/validation.md에 5단계 인증 회귀·check/build·리뷰를 기록한다.

## US2 — 설정 브리지·화면 (단계 6)

독립 검증: Q08~Q09, Q13. US2 네이티브 기반과 US3 리뷰 후 진행한다.

- [ ] T031 [US2] packages/app-bridge/src/notifications.ts·web-notifications.ts와 tests/notifications.test.ts에 설정/권한 결과·입력 검증·미지원 계약을 구현한다.
- [ ] T032 [US2] packages/app-bridge/src/index.ts·web.ts와 apps/mobile/src/bridge.ts에 설정 RPC·공개 export를 연결한다.
- [ ] T033 [US2] apps/web/src/pages/settings/model/notification-settings.ts에 query·mutation·권한 요청·복귀 갱신을 구현한다.
- [ ] T034 [US2] apps/web/src/pages/settings/ui/settings-page.tsx·settings-page.test.tsx에 실제 토글·조회/변경 실패·구버전·접근성을 연결한다.
- [ ] T035 [US2] specs/023-member-notifications/validation.md에 6단계 경계/UI 테스트·check/build·캡처·리뷰를 기록한다.

## US4 — 수신·탭·콜드 스타트 (단계 7)

독립 검증: Q10~Q12. US1 상세 연결·US2 등록·US3 세션 경계 완료 후 진행한다.

- [ ] T036 [P] [US4] apps/mobile/src/notifications/push-target.test.ts·push-target.ts에 payload 검증·중복 ID·안전한 fallback을 구현한다.
- [ ] T037 [P] [US4] packages/app-bridge/src/notifications.ts와 tests/notification-open.test.ts에 대기 이벤트·revision·eventId ack 계약을 추가한다.
- [ ] T038 [US4] apps/mobile/src/notifications/native-notification-runtime.ts·apps/mobile/firebase.json에 수신/탭/initial 알림·banner/list·세션별 대기를 연결한다.
- [ ] T039 [US4] apps/web/stackflow/src/notification-navigation.tsx·notification-navigation.test.tsx와 stack.tsx에 준비 대기·typed 이동·동일 대상·ack를 연결한다.
- [ ] T040 [US4] apps/web/src/pages/alerts/model/alerts-query.ts에 notificationRevision·활성/복귀 목록 갱신을 연결한다.

## 통합·운영 검증

- [ ] T041 specs/023-member-notifications/validation.md에 Q11~Q14 실기기·배포 웹·접근성과 check/build·캐시·미검증 위험을 기록한다.
- [ ] T042 apps/mobile/README.md와 specs/023-member-notifications/validation.md에 Firebase 외부 준비·승인된 시험 발송·새 runtime·복구·최종 리뷰를 기록한다.

## 의존성과 실행 전략

T001~T006 → US1 단계 2 → 리뷰 → 단계 3 → 리뷰 → US2 단계 4-A/B/C 각각 리뷰 →
US3 단계 5 → 리뷰 → US2 단계 6 → 리뷰 → US4 단계 7 → 통합 검증 순서다.
동일 단계 [P] 예: US1 화면 테스트 T012와 탐색 테스트 T013, US2 저장 T020과 조율 T021,
US4 payload T036과 bridge T037. US3는 공유 인증 수명 변경이므로 병렬 구현하지 않는다.
이는 자동 병렬 에이전트 실행 지시가 아니며 단계별 사용자 리뷰를 건너뛰지 않는다.
650줄부터 분리 검토·800줄 미만을 지킨다. Git·이슈·배포 변경은 별도 승인 범위를 따른다.
