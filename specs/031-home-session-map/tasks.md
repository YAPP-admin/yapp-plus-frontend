# 작업 목록: 홈 세션 카드와 카카오맵

**입력**: [명세](spec.md), [계획](plan.md), [계약](contracts/home-map.md)

## 1단계 — 문서와 구현 전 조건

- [x] T001 `specs/031-home-session-map/spec.md`와 설계·계약·체크리스트·검증 문서를 작성한다.
- [x] T002 `specs/031-home-session-map/issue-draft.md`에 기존 이슈 검색 결과를 반영한 초안을 준비한다.
- [ ] T003 `specs/031-home-session-map/validation.md`에 1단계 리뷰와 이슈 생성·연결 결과를 기록한다.
- [ ] T004 `apps/mobile/app/index.tsx`·홈 로딩 변경을 포함한 최신 main을 승인 후 같은 브랜치에 fast-forward하고 보존 여부를 기록한다.

문서 단계가 끝나면 리뷰받는다. 이슈 번호·리뷰·main 반영이 준비되기 전에는 제품 코드를 변경하지 않는다.

## 2단계 — US1 모바일 지도 실행 경계

목표: HTTPS 목적지를 기존 셸에서 앱 우선·웹 대체로 실행한다.
독립 검증: 테스트 입력 URL과 모의 Linking으로 성공·대체·실패 안내를 검증한다.

- [ ] T005 [US1] `apps/mobile/src/external-navigation.test.ts`에 URL 판정·좌표 순서·앱 성공·웹 대체·최종 실패·일반 링크·중복 실행 테스트를 먼저 작성한다.
- [ ] T006 [US1] `apps/mobile/src/external-navigation.ts`에 URL 검증과 실행 의존성을 주입받는 외부 탐색 처리를 구현한다.
- [ ] T007 [US1] `apps/mobile/app/index.tsx`에 처리기를 연결하고 trusted origin·링크 미리보기 비활성화를 보존한다.
- [ ] T008 [US1] 모바일 관련 테스트와 `node --run check` 결과를 `specs/031-home-session-map/validation.md`에 기록하고 2단계 리뷰를 받는다.

리뷰 전 웹 구현을 시작하지 않는다. 이 단계만으로 홈 지도 링크가 추가된 것은 아니다.

## 3단계 — US1 웹 지도 연결

목표: 실제 홈의 장소 행에서 지도 목적지를 전달한다.
독립 검증: 유효 좌표의 링크 클릭과 좌표가 없는 장소 표시를 확인한다.

- [ ] T009 [US1] `apps/web/src/pages/home/model/session-map.test.ts`에 좌표 유효성·경계·0·순서 테스트를 작성한다.
- [ ] T010 [US1] `apps/web/src/pages/home/model/session-map.ts`에 기존 응답 좌표를 HTTPS URL 또는 null로 변환하는 함수를 구현한다.
- [ ] T011 [US1] `apps/web/src/pages/home/ui/current-week-card.tsx`에 장소 링크·핀·누락 장소명을 연결하고 `home-page.test.tsx`에 접근성 이름·href·정적 표시를 검증한다.

## 3단계 — US2 홈 카드 표시

목표: 기존 정책을 보존하면서 안드로이드 기준으로 제목·달력·정규 버튼을 맞춘다.
독립 검증: 모의 날짜·상태별 렌더링과 화면 비교로 정합성을 확인한다.

- [ ] T012 [US2] `apps/web/src/pages/home/ui/home-page.test.tsx`에 오늘/다른 날·이름 중복·빈 이름·예정일·완료 및 기존 출석 안내 회귀 사례를 작성한다.
- [ ] T013 [US2] `apps/web/src/pages/home/ui/current-week-card.tsx`에 한국 날짜 제목과 정규 시작 시간 줄 제거를 적용한다.
- [ ] T014 [US2] `apps/web/src/pages/home/ui/home-page.css.ts`와 카드에 달력·정규 버튼·장소 링크의 스타일을 적용하고 팀 사진 영역·최신 로딩 화면을 보존한다.

## 3단계 마무리 — 전체 검증과 리뷰

- [ ] T015 `specs/031-home-session-map/quickstart.md`에 따라 관련 테스트·check·build를 실행하고 새 실행·캐시를 `validation.md`에 구분한다.
- [ ] T016 브라우저·iPhone·접근성 수용 사례를 검증하고 화면 증거를 `.context/`에, 결과·미실행 위험을 `specs/031-home-session-map/validation.md`에 기록한다.
- [ ] T017 실제 base 대비 모든 변경량과 새 파일·공개 계약 주석을 검토하고 3단계 결과를 `specs/031-home-session-map/validation.md`에 기록해 사용자 리뷰를 받는다.

## 의존성과 실행 전략

T001–T004 → T005–T008 → 사용자 리뷰 → T009–T014 → T015–T017 순서다.
최소 사용자 가치는 US1의 모바일 처리와 홈 장소 링크가 모두 연결된 상태다.
US2는 지도 실행 실패와 독립적으로 화면 테스트할 수 있지만 같은 카드 파일을 변경하므로 순차 구현한다.
US1의 모바일·웹 모델 테스트는 파일상 독립적이고 US2의 화면 검증과 iPhone 지도 실행 확인도
별도 검증할 수 있으나, 이 작업은 승인된 단계 리뷰 순서 때문에 병렬 에이전트를 사용하지 않는다.
