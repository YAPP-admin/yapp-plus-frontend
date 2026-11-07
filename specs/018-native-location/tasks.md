# 작업 목록: 출석용 위치 브리지

입력: [명세](spec.md), [계획](plan.md), [계약](contracts/location-bridge.md).
단계 번호는 사용자 리뷰 단위다. 아래 사용자 시나리오별 묶음은 추가 승인 단계를 만들지 않는다.

## 1단계 — 문서와 준비

- [x] T001 `specs/018-native-location/spec.md`와 `checklists/requirements.md`에 사용자 결정·수용 조건을 기록한다.
- [x] T002 `specs/018-native-location/plan.md`, `research.md`, `data-model.md`, `contracts/location-bridge.md`, `quickstart.md`를 작성한다.
- [x] T003 `specs/018-native-location/issue-draft.md`에 저장소 템플릿을 따른 초안을 작성한다.
- [x] T004 `specs/018-native-location/validation.md`에 문서 검증·변경량을 기록하고 1단계 리뷰를 요청한다.
- [x] T005 `specs/018-native-location/spec.md`에 별도 승인으로 생성된 이슈 번호와 2단계 진행 확인을 기록한다.

## 2단계 — 공용 기반

2-1에서 T006의 타입·스키마·공개 export를 완료했다. AppBridgeState RPC 등록은 2-2 네이티브 연결 때 완료한다.

- [ ] T006 `packages/app-bridge/src/location.ts`에 결과 타입·Zod 스키마를 추가하고 `src/index.ts`에서 공개 및 AppBridgeState RPC를 선언한다.
- [x] T007 `packages/app-bridge/tests/location.test.ts`에서 유효 값·경계·잘못된 응답을 검증한다.
- [ ] T008 `apps/mobile/package.json`, `pnpm-lock.yaml`, `apps/mobile/app.config.ts`에 Expo 호환 의존성·foreground 설정·한국어 문구·앱 버전 1.0.1을 반영한다.

## 2단계 — US1 단발 위치 전달 (P1)

독립 검증: OS 어댑터에 합성 위치를 주입해 첫 유효 값 한 건 전달과 구독 정리를 확인한다.

- [ ] T009 [US1] `apps/mobile/src/location/actions.test.ts`에 단발·중복·오래된 표본·15초 제한·늦은 구독 정리 테스트를 작성한다.
- [ ] T010 [US1] `apps/mobile/src/location/actions.ts`에 요청 수명·정규화·정리 동작을 구현한다.
- [ ] T011 [US1] `apps/mobile/src/location/native-location-runtime.ts`에서 Expo와 AppState를 연결하고 `apps/mobile/src/bridge.ts`에 위치 RPC를 연결한다.

## 2단계 — US2 권한·설정 복구 (P1)

독립 검증: 권한 조회가 팝업을 띄우지 않고, 거부·설정 열기·재요청 결과가 구분된다.

- [ ] T012 [US2] `apps/mobile/src/location/actions.test.ts`에 권한 매핑·재요청 불가·서비스 꺼짐·설정 실패·전체 제한 테스트를 추가한다.
- [ ] T013 [US2] `apps/mobile/src/location/actions.ts`와 `native-location-runtime.ts`에 권한 조회·foreground 요청·설정 열기를 구현한다.

## 2단계 — US3 네이티브 수명과 민감 정보 (P2)

독립 검증: background와 종료된 요청의 지연 이벤트가 수집을 재개하지 않으며 원문 payload를 로그에 남기지 않는다.

- [ ] T014 [US3] `apps/mobile/src/location/actions.test.ts`에 inactive/background 구분·늦은 권한 응답·잠금 해제를 검증한다.
- [ ] T015 [US3] `apps/mobile/src/bridge.ts`의 debug 로깅을 끄고 `apps/mobile/src/location/actions.ts`의 종료 경로·예외 변환을 완성한다.
- [ ] T016 `specs/018-native-location/validation.md`에 2단계 테스트·check·build·expo:doctor·변경량을 기록하고 다음 단계 리뷰를 요청한다.

## 3단계 — US1·US2 웹 호출 (P1)

독립 검증: 합성 브리지 응답으로 공개 도우미를 호출해 유효한 성공·실패만 전달되는지 확인한다.

- [ ] T017 [US1] `packages/app-bridge/src/web-location.ts`에 위치 요청 도우미·응답 검증을 추가하고 `src/web.ts`에서 공개한다.
- [ ] T018 [US2] `packages/app-bridge/src/web-location.ts`에 권한 조회·설정 열기 도우미를 추가한다.
- [ ] T019 [US1] `packages/app-bridge/tests/web-location.test.ts`에서 성공·잘못된 응답·네이티브 오류 정규화를 검증한다.

## 3단계 — US3 실행 환경 확인과 개발 검증 도구 (P2)

독립 검증: 일반 웹·연결 실패와 화면 이탈을 재현하고 프로덕션 접근 차단을 확인한다.

- [ ] T020 [US3] `packages/app-bridge/src/web-location.ts`와 `tests/web-location.test.ts`에 SSR·실행 환경 확인·통신 오류 처리를 구현·검증한다.
- [ ] T021 [US3] `apps/web/src/pages/dev-routes/ui/location-check.tsx`를 작성하고 `dev-routes-page.tsx`에 개발용 상태 검증 도구를 연결한다.
- [ ] T022 [US3] `apps/web/src/pages/dev-routes/ui/location-check.test.tsx`에서 중복 클릭·늦은 응답·재진입·접근성 상태·원문 미노출을 검증한다.

## 최종 검증과 기록

- [ ] T023 `specs/018-native-location/validation.md`에 최종 check·build·expo:doctor, 프로덕션 개발 도구 차단·출석 비활성 회귀 결과를 기록한다.
- [ ] T024 `specs/018-native-location/validation.md`에 quickstart의 iOS·Android 실기기 시나리오·런타임 분리·로그 미노출 결과와 미실행 항목을 기록한다.

## 의존성과 실행 전략

- T001~~T004 → 사용자 리뷰·이슈 생성 승인·T005 → T006~~T016 → 사용자 리뷰 → T017~T024 순서다.
- 공용 타입이 네이티브·웹 구현보다 먼저다. US1의 수명 동작을 US2·US3가 사용한다.
- US1의 계약 검증과 네이티브 합성 표본 테스트는 계약 확정 후 서로 다른 파일에서 병행 가능하다.
- US2·US3 네이티브는 같은 actions 파일을 수정하므로 순차 진행한다. 웹 테스트는 도우미 계약 확정 후 개발 도구 작업과 병행 가능하다.
- 최소 기능 검증은 US1의 단발 수신이다. 출시 완료는 US2 복구·US3 수명·양 플랫폼 실기기 확인까지 필요하다.
- 자동 커밋·브랜치 변경·원격 이슈 생성·배포 작업은 이 목록 실행에 포함하지 않는다.
