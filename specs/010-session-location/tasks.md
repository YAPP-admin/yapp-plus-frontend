# 작업 목록: 세션 장소 검색과 위치 설정

**상태**: 4-1 목록 상태 구현·검증 완료, 리뷰 대기 | **입력**: [계획](plan.md), [명세](spec.md)

3-3까지 사용자 리뷰 후 3-4 코드·단위 검증을 완료했다. 실제 좌표 API 검증은 승인키 설정 후 진행한다. 준비 항목의 미확인 내용은 체크박스로 유지한다. **각 2-1·2-2… 세부 단계가 끝나면 반드시 멈추고 사용자 리뷰와 진행 지시를 받는다.**
작업 개수가 적다는 이유로 다음 단계까지 묶어 실행하지 않는다.

## 준비

- [x] T001 **2-1** 기존 조직 앱·키 소유자·도메인을 확인하고 키 값 없이 기록: `specs/010-session-location/quickstart.md`
- [ ] T002 **2-2** 주소 검색 개발용 키 신청 조건과 유효기간·발급 결과 기록: `specs/010-session-location/quickstart.md`
- [ ] T003 **2-3** 좌표 키 신청·본인 확인·사용 목적과 발급 결과 기록: `specs/010-session-location/quickstart.md`
- [ ] T004 **2-4** 카카오 JavaScript 키·Maps 활성화·허용 도메인 확인: `specs/010-session-location/quickstart.md`
- [ ] T005 **2-5** 환경 변수 예시와 검증을 준비하고 실제 조회·JSON 응답·CORS 계약 확인: `apps/admin/.env.example, apps/admin/src/pages/sessions/model/location/env.ts, specs/010-session-location/contracts/location.md`

## 공통 기반

- [x] T006 **3-1** 유형별 스키마·fixture·카드와 기존 테스트를 함께 전환: `apps/admin/src/pages/sessions/model/session.ts, apps/admin/src/pages/sessions/model/sessions.mock.ts, apps/admin/src/pages/sessions/ui/session-card.tsx`
- [x] T007 **3-2** 10초 타임아웃·AbortController 취소·정리 JSON 전송 구현 및 테스트: `apps/admin/src/pages/sessions/model/location/address-request.ts, apps/admin/src/pages/sessions/model/location/address-request.test.ts`
- [x] T008 **3-3** 검색·페이지·업무 오류·DTO 검증 및 ViewModel 매핑 구현·테스트: `apps/admin/src/pages/sessions/model/location/location-view-model.ts, apps/admin/src/pages/sessions/model/location/juso-search.ts, apps/admin/src/pages/sessions/model/location/juso-search.test.ts`
- [x] T009 **3-4** proj4 catalog 등록, 읽기 쉬운 식별 정보의 요청 역매핑·단일 좌표 응답 검증·좌표 ViewModel 변환·독립 기준점 검증: `pnpm-workspace.yaml, apps/admin/package.json, apps/admin/src/pages/sessions/model/location/coordinates.ts, apps/admin/src/pages/sessions/model/location/coordinates.test.ts`

## US1 — 생성

- [x] T010 [US1] **3-5** 검색 UI·페이지 이동·Enter 분리·주소 재선택·자동 검색·응답 분리 테스트: `apps/admin/src/pages/sessions/ui/address-search.tsx, apps/admin/src/pages/sessions/ui/address-search.test.tsx`
- [x] T011 [US1] **3-6** React 지도 SDK catalog 등록·기본 로더 훅·마커 드래그·읽기 전용 좌표·초기 복귀와 실패 복구 검증: `pnpm-workspace.yaml, apps/admin/package.json, apps/admin/src/pages/sessions/ui/session-location-map.tsx, apps/admin/src/pages/sessions/ui/session-location-map.test.tsx`
- [x] T012 [US1] **3-7** 공통 폼·유형 초안·단일 최종 좌표·검증·저장중 닫기 차단과 테스트: `apps/admin/src/pages/sessions/ui/session-form.tsx, apps/admin/src/pages/sessions/ui/session-form.test.tsx`
- [x] T013 [US1] **4-1** 목록 로딩·실패·재시도·전체/필터 빈 상태·배포 예시 목록 검증: `apps/admin/src/pages/sessions/ui/sessions-page.tsx, apps/admin/src/pages/sessions/ui/sessions-page.test.tsx`
- [ ] T014 [US1] **4-2** 생성 진입·Mutation·캐시·전체 필터·집계0·성공/취소 테스트: `apps/admin/src/pages/sessions/model/session-queries.ts, apps/admin/src/pages/sessions/ui/sessions-page.tsx, apps/admin/src/pages/sessions/ui/sessions-page.test.tsx`

## US2 — 수정

- [ ] T015 [US2] **4-3** 수정 서비스·없는ID·ID/집계 보존·중첩 복사와 테스트: `apps/admin/src/pages/sessions/model/sessions.ts, apps/admin/src/pages/sessions/model/sessions.mock.ts, apps/admin/src/pages/sessions/model/sessions.mock.test.ts`
- [ ] T016 [US2] **4-4** 정보 메뉴·초기값·수정 Mutation·현재 필터·포커스 복귀 검증: `apps/admin/src/pages/sessions/ui/session-card.tsx, apps/admin/src/pages/sessions/ui/sessions-page.tsx, apps/admin/src/pages/sessions/ui/sessions-page.test.tsx`

## 통합 검증

- [ ] T017 **5-1** LP/ST 전체 경계·경합 테스트 누락 보완과 결과 기록: `apps/admin/src/pages/sessions/model/location/, apps/admin/src/pages/sessions/ui/session-form.test.tsx, specs/010-session-location/quickstart.md`
- [ ] T018 **5-2** 실제키 검색·페이지·변환·지도·재시도와 수정 복원 검증: `specs/010-session-location/quickstart.md`
- [ ] T019 **5-3** 키보드·스크린리더·터치·좁은 화면 검증과 스크린샷, 재사용 UI 변경시 Storybook 사례 반영: `specs/010-session-location/quickstart.md, .context/`
- [ ] T020 **5-4** check/build·SSR 차단·배포 예시 목록·문서 및 복구 절차 최종 확인: `specs/010-session-location/quickstart.md, specs/010-session-location/tasks.md`

## 의존성과 독립 검증

준비 → 공통 기반 → US1 → US2 → 통합 검증 순서로 실행한다.
US1의 MVP는 두 유형 생성 후 장소가 목록에 보이는 상태다. US2는 기존 fixture를 수정해 독립 검증할 수 있지만 공통 폼과 모델에 의존한다.
FR-001~~003은 T007~~T014, FR-004는 T012·T015~~T016, FR-005는 T006~~T016,
FR-006은 T006·T012~~T016, FR-007은 T010~~T012·T016·T019,
FR-008은 T014~T016·T020, FR-009는 T013으로 연결한다.
각 구현 단계에 테스트를 포함하고 5-1은 빠진 교차 경계만 보완한다.

## 병렬 실행 가능성

이 계획에서는 단계별 리뷰 지시가 우선이므로 병렬 실행 표시를 붙이지 않았다.
US1의 응답 파싱 테스트와 검색 UI 사례, US2의 저장소 테스트와 수정 UI 사례는 계약 확정 후 이론상 분리 가능하지만
실제 실행은 해당 단계 승인 범위 안에서만 한다. 별도 에이전트 구현을 자동 시작하지 않는다.

## 검증 완료 기준

[quickstart.md](quickstart.md)의 자동 검사와 실제키·접근성 검증을 기록한다.
키가 없거나 실기기 검증을 못 했다면 해당 작업을 완료로 체크하지 않는다.
기존 008의 삭제·전체 검증을 완료로 바꾸지 않는다.

## 준비 단계 진행 상태

주소 검색 키 발급과 카카오 설정은 사용자 확인을 받았다. 2-5에서 주소 검색 페이지 이동·JSON 객체 응답과
카카오 지도 타일·마커 표시를 실제 브라우저로 확인했다. 좌표 키는 Doppler 설정 후 3-6에서 실제 JSON 조회와 지도 표시를 확인했다. T003·T005의 발급 메타데이터와 나머지 준비 문서 확인은 별도로 남긴다.
상세 증거와 미검증 항목은 quickstart.md에 기록했다.
