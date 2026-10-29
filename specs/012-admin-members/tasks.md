# 작업 목록: 관리자 회원 관리 화면

**입력**: [명세](spec.md), [계획](plan.md), [데이터](data-model.md), [화면 계약](contracts/member-ui.md)
**상태**: 1단계 리뷰 완료. 이슈 #182 생성·확인 완료. 2a단계 리뷰 완료. 2b단계 리뷰·커밋 완료. 3단계 리뷰·커밋 완료. 4a단계 구현·검증 완료, 사용자 리뷰 대기.

## 진행 규칙

각 단계·하위 단계가 끝나면 변경 파일·실제 base 대비 줄 수·검증·UI 근거를 보고하고 멈춘다.
사용자 리뷰와 다음 진행 확인 전 다음 단계를 시작하지 않는다. Git 작업 승인은 별도다.
테스트는 해당 모델·화면 작업에 포함한다. 파일 경로는 구현 예정 위치이며 아직 존재하지 않을 수 있다.
이번 작업은 개발용 읽기 전용 화면이다. 저장소·가짜 CRUD·SDK 경로·실제 저장은 구현하지 않는다.

## 1단계 — 명세와 작업 기준 (공통 준비)

- [x] T001 origin/main·현재 변경·열린 이슈·기존 API 범위를 specs/012-admin-members/research.md에 기록한다.
- [x] T002 specs/012-admin-members/spec.md와 checklists/requirements.md에 사용자 선택·FR·수용 기준을 작성한다.
- [x] T003 specs/012-admin-members/plan.md, data-model.md, contracts/member-ui.md, quickstart.md, tasks.md에 구현·리뷰·검증 경계를 작성한다.
- [x] T004 specs/012-admin-members/plan.md에 연결한 이슈 #182의 템플릿 기반 초안을 준비하고 사용자 승인 후 생성·내용을 확인했다.
- [x] T005 문서 링크·FR 대응·작업 ID·포맷·check 결과를 specs/012-admin-members/validation.md에 기록한다.

**완료 기준**: 문서와 검증 결과를 제출할 수 있다. 이슈 생성 승인과 문서 리뷰는 완료 체크와 구분한다.
**중단점**: 1단계 리뷰를 받는다. 다음 코드 작업 전 이슈 생성 또는 명시적 생략을 확인한다.

## 2a단계 — 최소 화면 모델 (공통 기반)

- [x] T006 apps/admin/src/features/member-management/model/member.ts와 index.ts에 readonly 화면 타입·직군·권한을 정의한다.
- [x] T007 apps/admin/src/features/member-management/model/phone-number.ts와 phone-number.test.ts에 전화번호 정규화·표시·앞자리 유실 오류를 구현·검증한다.
- [x] T008 apps/admin/src/features/member-management/model/member.test.ts에 기수별 입력 구조·읽기 전용 사용·허용값 검증을 추가한다.

**완료 기준/중단점**: 두 페이지의 최소 입력이 준비된다. 저장 서비스 없이 모델·변환을 리뷰받는다.

## 2b단계 — fixture와 개발 페이지 입력 (공통 기반)

- [x] T009 apps/admin/src/features/member-management/model/member-fixtures.ts에 정상·빈 명단·매핑 전후·과거 기수·비활동·점수 없음 합성 입력을 작성한다.
- [x] T010 apps/admin/src/features/member-management/fixtures.ts에 개발용 고정 입력의 별도 진입점을 제공한다. 공급 훅·공통 페이지 입력 타입·대기 상태·Query·타이머·저장소는 추가하지 않는다.
- [x] T011 apps/admin/src/features/member-management/model/member-fixtures.test.ts에서 빈 명단·매핑 전후·과거 기수·비활동·출석 사례를 검증한다.

**완료 기준/중단점**: 페이지별 필요한 값을 props로 전달할 고정 readonly 입력이 준비된다. 프로덕션 노출 제한은 페이지 연결 단계에서 구현·검증한다. 코드 리뷰 후 진행한다.

## 3단계 — 회원 탐색과 가입 대기 (US1, P1)

- [x] T012 [US1] apps/admin/src/pages/members/model/member-search.ts와 member-search.test.ts에 team·과거 role/status 무시·기본값을 반영한다.
- [x] T013 [US1] apps/admin/src/app/ui/admin-navigation.ts, admin-sidebar.tsx, admin-shell.tsx, admin-mobile-navigation.tsx에 회원 하위 메뉴·현재 상태를 연결한다.
- [x] T014 [US1] apps/admin/src/routes/_dashboard/members/index.tsx와 apps/admin/src/pages/members/ui/pending-members.tsx에 URL 어댑터·가입 대기 빈 화면을 연결하고 상단 탭을 제거한다.
- [x] T015 [US1] apps/admin/src/router.test.tsx와 app/ui/admin-shell.test.tsx에 탭·직접 접근·모바일 메뉴·업로드 복귀·다른 메뉴 회귀를 반영한다.

**독립 검증/중단점**: 가입 대기 0건과 세 경로 탐색을 실제 route tree로 확인하고 리뷰받는다. 생성 라우트 수정이 필요하면 도구로 재생성한다.

## 4a단계 — 회원 행 목록과 상태 (US1, P1)

- [x] T016 [US1] apps/admin/src/pages/members/ui/member-list.tsx와 member-list.css.ts에 행·기수 이력·권한·점수·가입일·더보기를 구현한다.
- [x] T017 [US1] apps/admin/src/pages/members/ui/members-page.tsx와 members-page.css.ts에 개발 환경 진입점의 고정 fixture props·프로덕션 준비 안내·빈 명단을 연결한다. 검색 빈 결과는 실제 필터 연결 단계인 T020에서 구현하고, 고정 입력에는 가짜 로딩·오류·재시도를 추가하지 않는다.
- [x] T018 [US1] apps/admin/src/pages/members/ui/members-page.test.tsx에 긴 이름·이력·미제공 점수·비활동·프로덕션 fixture 비노출·표 의미 구조 검증을 추가한다.

**독립 검증/중단점**: Figma 행 목록과 상태를 props 기반으로 확인하고 리뷰받는다. 가짜 요청은 만들지 않는다.

## 4b단계 — 검색·직군·URL (US1, P1)

- [ ] T019 [US1] apps/admin/src/pages/members/model/member-list.ts와 member-list.test.ts에 이름 부분 검색·이름/식별자 정렬·직군 필터·총원을 구현·검증한다.
- [ ] T020 [US1] apps/admin/src/pages/members/ui/member-filters.tsx와 members-page.tsx에 Enter 제출·직군 선택·URL 연결·한글 조합 처리를 구현한다.
- [ ] T021 [US1] apps/admin/src/router.test.tsx에 검색 replace·조건 history·새로고침 복원·잘못된 URL·이탈 회귀를 추가한다.

**독립 검증/중단점**: 검색·필터·URL·총원이 일치한다. 브라우저 한글 입력 근거와 리뷰를 제출한다.

## 4c단계 — 팀 표시·필터 (US1, P1)

- [ ] T022 [US1] apps/admin/src/pages/members/ui/member-team-filter.tsx와 member-list.tsx에 매핑 전후 안내·팀 배지·팀장·필터를 추가한다.
- [ ] T023 [US1] apps/admin/src/pages/members/model/member-list.ts와 member-list.test.ts에 팀 교집합·현재 기수 전체 기준 팀 인원·잘못된 팀 정리를 추가한다.
- [ ] T024 [US1] apps/admin/src/pages/members/ui/members-page.test.tsx에 팀 미배정·매핑 전후·잘못된 team URL·팀 인원 불변을 검증한다.

**독립 검증/중단점**: 팀 조회 UI가 완성된다. 팀 매핑 경로·변경 동작이 없는지 함께 리뷰한다.

## 5a단계 — 수정 폼과 정정 제한 (US2, P2)

- [ ] T025 [US2] apps/admin/src/pages/members/model/member-form.ts와 member-form.test.ts에 필수 입력·기수 중복·팀/출석 연결 제한을 구현·검증한다.
- [ ] T026 [US2] apps/admin/src/pages/members/ui/member-edit-form.tsx와 member-edit-form.css.ts에 TanStack Form 필드·초안·기존 변경 이력·비활성 버튼·준비 중 안내를 구현한다.
- [ ] T027 [US2] apps/admin/src/pages/members/ui/member-edit-form.test.tsx에 입력 오류·제한 안내·Enter 제출 차단·원본 불변 검증을 추가한다.

**독립 검증/중단점**: 폼 입력과 제한을 독립 검토할 수 있다. 저장·비활동은 실행되지 않는다.

## 5b단계 — 수정 모달 연결 (US2, P2)

- [ ] T028 [US2] apps/admin/src/pages/members/ui/member-edit-dialog.tsx와 members-page.tsx에 overlay.open·더보기·초안 폐기·목록 조건 변경 시 닫기를 연결한다.
- [ ] T029 [US2] apps/admin/src/pages/members/ui/member-edit-dialog.test.tsx에 초기값·취소·재진입·URL 조건 변경·포커스 복귀를 검증한다.

**독립 검증/중단점**: 조회→수정→취소가 완성되고 명단·이력이 바뀌지 않는다. 키보드와 화면을 리뷰받는다.

## 6a단계 — 파일 파서·양식 (US3, P2)

- [ ] T030 [US3] pnpm-workspace.yaml, apps/admin/package.json, pnpm-lock.yaml에 SheetJS CE 0.20.3 공식 tarball을 고정한다. 설치 변경량과 공급망 정책을 확인한다.
- [ ] T031 [US3] apps/admin/src/pages/member-import/model/import-file.ts와 import-template.ts에 파일 경계·지연 로딩·첫 시트·헤더·문자열 전화번호 양식을 구현한다.
- [ ] T032 [US3] apps/admin/src/pages/member-import/model/import-file.test.ts에 실제 XLSX·XLS·CSV·다중 시트·손상/빈 파일·크기 경계·헤더·전화번호 앞자리를 검증한다.

**독립 검증/중단점**: 실제 세 파일 형식과 양식 다운로드 왕복을 확인한다. catalog·lockfile까지 리뷰받는다.

## 6b단계 — 행 검증·중복 분류 (US3, P2)

- [ ] T033 [US3] apps/admin/src/pages/member-import/model/import-rows.ts에 원본 번호·빈 행 제외·필수 값·기수/직군/권한·전화번호 검증을 구현한다.
- [ ] T034 [US3] apps/admin/src/pages/member-import/model/import-rows.ts에 첫 유효 행 우선·신규 회원/새 기수/기존 활동 분류·배타적 집계·예정 수 함수를 추가한다.
- [ ] T035 [US3] apps/admin/src/pages/member-import/model/import-rows.test.ts에 오류 행 뒤 유효 중복·저장소 중복과 파일 중복 구분·합계·정규화를 검증한다.

**독립 검증/중단점**: readonly 명단과 실제 파일로 일관된 판정·집계를 얻는다. 실제 반영 함수는 없다.

## 7a단계 — 업로드 화면 (US3, P2)

- [ ] T036 [US3] apps/admin/src/pages/member-import/ui/member-import-page.tsx와 member-import-page.css.ts에 개발 환경 진입점에서 명단 props를 전달하고 프로덕션 준비 안내·파일 선택·드롭·양식 안내·다운로드·읽기 상태를 구현한다.
- [ ] T037 [US3] apps/admin/src/pages/member-import/model/use-import-file.ts에 파일 교체/다시 올리기/이탈 후 오래된 결과 무시와 화면 수명 정리를 구현한다.
- [ ] T038 [US3] apps/admin/src/pages/member-import/ui/member-import-page.test.tsx에 파일 선택/드롭 공통 처리·실패·교체·다시 올리기·이탈을 검증한다.

**독립 검증/중단점**: 실제 파일 읽기까지 조작 가능하다. 오래된 결과·전화번호 로그·영속 저장이 없는지 리뷰한다.

## 7b단계 — 미리보기와 선택 (US3, P2)

- [ ] T039 [US3] apps/admin/src/pages/member-import/ui/import-preview.tsx와 import-preview.css.ts에 전체 행·원본 번호·오류·집계·스크롤 영역을 구현한다.
- [ ] T040 [US3] apps/admin/src/pages/member-import/ui/import-preview.tsx와 member-import-page.tsx에 기본 건너뛰기·덮어쓰기·예정 수·예시 명단 안내·반영 비활성을 연결한다.
- [ ] T041 [US3] apps/admin/src/pages/member-import/ui/import-preview.test.tsx에 마지막 중복 행 접근·선택별 예정 수·반영 요청/성공 상태 부재를 검증한다.

**독립 검증/중단점**: 파일→오류/중복 검토→예정 수 확인까지 완성된다. 실제 저장은 하지 않고 화면을 리뷰받는다.

## 8단계 — 통합 인수 (공통 품질)

- [ ] T042 apps/admin/src/router.test.tsx에 목록→모달→취소와 업로드→미리보기→복귀 대표 흐름을 검증한다.
- [ ] T043 specs/012-admin-members/validation.md에 Figma·데스크톱/375px·키보드/스크린 리더/터치·SSR/프로덕션 확인 결과를 기록한다.
- [ ] T044 packages/ui/src/와 apps/storybook/stories/에 이번 작업으로 변경한 재사용 UI가 있으면 관련 테스트·사례를 갱신한다. 없으면 validation.md에 해당 없음을 기록한다.
- [ ] T045 node --run check와 node --run build의 새 실행·캐시·미실행을 specs/012-admin-members/validation.md에 기록한다.
- [ ] T046 specs/012-admin-members/contracts/member-ui.md의 후속 API 정보와 실제 화면 입력을 대조하고 quickstart.md에 인수 결과를 연결한다.

**완료 기준/중단점**: 수용 기준별 근거와 미연결 저장 범위가 명확하다. 최종 사용자 리뷰를 받는다.

## 요구사항 대응

| 요구사항                       | 주요 작업                         |
| ------------------------------ | --------------------------------- |
| FR-001, FR-005                 | T012~T015                         |
| FR-002                         | T016~T018                         |
| FR-003                         | T012, T019~T021                   |
| FR-004                         | T022~T024                         |
| FR-006                         | T025~T029                         |
| FR-007                         | T026~~T029, T040~~T041            |
| FR-008, FR-009                 | T030~~T032, T036~~T038            |
| FR-010, FR-011, FR-012, FR-013 | T007, T033~T035                   |
| FR-014                         | T034~~T035, T039~~T041            |
| FR-015                         | T037~T038                         |
| FR-016                         | T015, T018, T029, T041, T043~T044 |
| FR-017                         | T009~T011, T038, T043             |
| FR-018                         | T002~T004, T046                   |

## 의존성과 병렬 가능성

순서는 plan.md 표를 따른다. US1은 목록 MVP, US2는 그 목록의 모달, US3은 같은 읽기 전용 입력을 받는 독립 업로드 화면이다.
US3의 모델은 US2에 기술적으로 의존하지 않지만 사용자 리뷰 순서를 위해 5b 승인 후 시작한다.
같은 리뷰 단위에서 US1의 순수 필터/표 스타일, US2의 폼 규칙/모달 스타일, US3의 파서 fixture/업로드 스타일 조사는 병렬 가능하다.
이번에는 순차 수행하며 단계 간 선행 구현·자동 에이전트 병렬 실행은 하지 않는다.

## 리뷰 기록

| 단계 | 작업 상태           | 사용자 리뷰           |
| ---- | ------------------- | --------------------- |
| 1    | 문서 작성·검증 완료 | 사용자 진행 확인 완료 |
| 2a   | 구현·검증 완료      | 사용자 진행 확인 완료 |
| 2b   | 구현·검증 완료      | 사용자 진행 확인 완료 |
| 3    | 구현·검증 완료      | 대기                  |
| 4~8  | 미착수              | 미요청                |

사용자 “작업 진행해”로 1단계 리뷰·2a 진행을 확인했고 “이슈 생성해”로 [#182](https://github.com/YAPP-admin/yapp-plus-frontend/issues/182)를 생성했다.
사용자 “커밋하고 다음 진행해”로 2a 리뷰를 확인하고 문서 bf3055d·모델 9ca4901을 커밋했다.
후속 승인으로 brussels-v2/member-management-fixtures를 생성·전환해 2b를 진행했다.
사용자 승인으로 2b를 7af086c에 커밋하고 3단계를 진행했다. 3단계는 미커밋 상태이며 push·PR은 수행하지 않았다. 4a는 3단계 리뷰 후 진행한다.

## 4a 진행 기록

- 사용자 승인으로 3단계를 873029a에 커밋했다.
- 승인된 분리에 따라 2b의 base 브랜치 `brussels-v2/member-management-data`와 4a 작업 브랜치 `brussels-v2/member-list`를 생성했다.
- 4a의 실제 PR base는 `brussels-v2/member-management-fixtures`(873029a)다.
- T016~T018을 완료했다. 검색 결과 없음은 T020의 실제 검색과 함께 구현한다.
- 사용자 리뷰 전 4b에 착수하지 않는다. 이번 단계는 미커밋이며 push·PR은 수행하지 않았다.
