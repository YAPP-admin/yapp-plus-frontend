# 작업 목록: 관리자 회원 관리 화면

**입력**: [명세](spec.md), [계획](plan.md), [데이터](data-model.md), [화면 계약](contracts/member-ui.md)
**상태**: 1단계 리뷰 완료. 이슈 #182 생성·확인 완료. 2a단계 리뷰 완료. 2b단계 리뷰·커밋 완료. 3단계 리뷰·커밋 완료. 4a단계 리뷰·커밋 완료. 4b단계 리뷰·커밋 완료. 4c단계 리뷰·커밋 완료. 5a단계 리뷰·커밋 완료. 5b단계 리뷰·커밋 완료. 6a단계 리뷰·커밋 완료. 7a T037 파일 상태 훅 리뷰·커밋 완료. 6b단계 리뷰·커밋 완료. 7a T036·T038 리뷰·커밋 완료. 7b T039~T041 리뷰·커밋 완료. 8단계 T042 리뷰·커밋 완료. T043 리뷰·커밋 완료. T044 리뷰·커밋 완료. T045 구현·검증 완료, 사용자 리뷰 대기.

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

- [x] T019 [US1] apps/admin/src/pages/members/model/member-list.ts와 member-list.test.ts에 이름 부분 검색·이름/식별자 정렬·직군 필터·총원을 구현·검증한다.
- [x] T020 [US1] apps/admin/src/pages/members/ui/member-filters.tsx와 members-page.tsx에 실시간 검색·직군 선택·URL 연결·한글 입력 유지를 구현한다.
- [x] T021 [US1] apps/admin/src/router.test.tsx에 검색 replace·조건 history·새로고침 복원·잘못된 URL·이탈 회귀를 추가한다.

**독립 검증/중단점**: 검색·필터·URL·총원이 일치한다. 브라우저 한글 입력 근거와 리뷰를 제출한다.

## 4c단계 — 팀 표시·필터 (US1, P1)

- [x] T022 [US1] apps/admin/src/pages/members/ui/member-team-filter.tsx와 member-list.tsx에 매핑 전후 안내·팀 배지·팀장·필터를 추가한다.
- [x] T023 [US1] apps/admin/src/pages/members/model/member-list.ts와 member-list.test.ts에 팀 교집합·현재 기수 전체 기준 팀 인원·잘못된 팀 정리를 추가한다.
- [x] T024 [US1] apps/admin/src/pages/members/ui/members-page.test.tsx에 팀 미배정·매핑 전후·잘못된 team URL·팀 인원 불변을 검증한다.

**독립 검증/중단점**: 팀 조회 UI가 완성된다. 팀 매핑 경로·변경 동작이 없는지 함께 리뷰한다.

## 5a단계 — 수정 폼과 정정 제한 (US2, P2)

- [x] T025 [US2] apps/admin/src/pages/members/model/member-form.ts와 member-form.test.ts에 필수 입력·기수 중복·팀/출석 연결 제한을 구현·검증한다.
- [x] T026 [US2] apps/admin/src/pages/members/ui/member-edit-form.tsx와 member-edit-form.css.ts에 TanStack Form 필드·초안·기존 변경 이력·비활성 버튼·준비 중 안내를 구현한다.
- [x] T027 [US2] apps/admin/src/pages/members/ui/member-edit-form.test.tsx에 입력 오류·제한 안내·Enter 제출 차단·원본 불변 검증을 추가한다.

**독립 검증/중단점**: 폼 입력과 제한을 독립 검토할 수 있다. 저장·비활동은 실행되지 않는다.

## 5b단계 — 수정 모달 연결 (US2, P2)

- [x] T028 [US2] apps/admin/src/pages/members/ui/member-edit-dialog.tsx와 members-page.tsx에 클릭 기반 overlay.open·더보기·초안 폐기를 연결한다.
- [x] T029 [US2] apps/admin/src/pages/members/ui/member-edit-dialog.test.tsx에 초기값·취소·재진입·포커스 복귀를 검증한다.

**독립 검증/중단점**: 조회→수정→취소가 완성되고 명단·이력이 바뀌지 않는다. 키보드와 화면을 리뷰받는다.

## 6a단계 — 파일 파서·양식 (US3, P2)

- [x] T030 [US3] pnpm-workspace.yaml, apps/admin/package.json, pnpm-lock.yaml에 Papa Parse 5.7.0과 `@types/papaparse`를 고정한다. 설치 변경량과 공급망 정책을 확인한다.
- [x] T031 [US3] apps/admin/src/pages/member-import/model/import-file.ts와 import-template.ts에 CSV 파일 경계·지연 로딩·헤더·문자열 전화번호 양식을 구현한다.
- [x] T032 [US3] apps/admin/src/pages/member-import/model/import-file.test.ts에 실제 CSV 인용부호·줄바꿈·손상/빈 파일·크기 경계·헤더·전화번호 앞자리를 검증한다.

**독립 검증/중단점**: 실제 CSV와 양식 다운로드 왕복을 확인한다. catalog·lockfile까지 리뷰받는다.

## 6b단계 — 행 검증·중복 분류 (US3, P2)

- [x] T033 [US3] apps/admin/src/pages/member-import/model/import-rows.ts에 원본 번호·빈 행 제외·필수 값·기수/직군/권한·전화번호 검증을 구현한다.
- [x] T034 [US3] apps/admin/src/pages/member-import/model/import-rows.ts에 첫 유효 행 우선·신규 회원/새 기수/기존 활동 분류·배타적 집계·예정 수 함수를 추가한다.
- [x] T035 [US3] apps/admin/src/pages/member-import/model/import-rows.test.ts에 오류 행 뒤 유효 중복·저장소 중복과 파일 중복 구분·합계·정규화를 검증한다.

**독립 검증/중단점**: readonly 명단과 실제 파일로 일관된 판정·집계를 얻는다. 실제 반영 함수는 없다.

## 7a단계 — 업로드 화면 (US3, P2)

- [x] T036 [US3] apps/admin/src/pages/member-import/ui/member-import-page.tsx와 member-import-page.css.ts에 개발 환경 진입점에서 명단 props를 전달하고 프로덕션 준비 안내·파일 선택·드롭·양식 안내·다운로드·읽기 상태를 구현한다.
- [x] T037 [US3] apps/admin/src/pages/member-import/model/use-import-file.ts에 파일 교체/다시 올리기/이탈 후 오래된 결과 무시와 화면 수명 정리를 구현한다.
- [x] T038 [US3] apps/admin/src/pages/member-import/ui/member-import-page.test.tsx에 파일 선택/드롭 공통 처리·실패·교체·다시 올리기·이탈을 검증한다.

**독립 검증/중단점**: 실제 파일 읽기까지 조작 가능하다. 오래된 결과·전화번호 로그·영속 저장이 없는지 리뷰한다.

## 7b단계 — 미리보기와 선택 (US3, P2)

- [x] T039 [US3] apps/admin/src/pages/member-import/ui/import-preview.tsx와 import-preview.css.ts에 전체 행·원본 번호·오류·집계·스크롤 영역을 구현한다.
- [x] T040 [US3] apps/admin/src/pages/member-import/ui/import-preview.tsx와 member-import-page.tsx에 기본 건너뛰기·덮어쓰기·예정 수·예시 명단 안내·반영 비활성을 연결한다.
- [x] T041 [US3] apps/admin/src/pages/member-import/ui/import-preview.test.tsx에 마지막 중복 행 접근·선택별 예정 수·반영 요청/성공 상태 부재를 검증한다.

**독립 검증/중단점**: 파일→오류/중복 검토→예정 수 확인까지 완성된다. 실제 저장은 하지 않고 화면을 리뷰받는다.

## 8단계 — 통합 인수 (공통 품질)

- [x] T042 apps/admin/src/router.test.tsx에 목록→모달→취소와 업로드→미리보기→복귀 대표 흐름을 검증한다.
- [x] T043 specs/012-admin-members/validation.md에 Figma·데스크톱/375px·키보드/스크린 리더/터치·SSR/프로덕션 확인 결과를 기록한다.
- [x] T044 packages/ui/src/와 apps/storybook/stories/에 이번 작업으로 변경한 재사용 UI가 있으면 관련 테스트·사례를 갱신한다. 없으면 validation.md에 해당 없음을 기록한다.
- [x] T045 node --run check와 node --run build의 새 실행·캐시·미실행을 specs/012-admin-members/validation.md에 기록한다.
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

| 단계 | 작업 상태                     | 사용자 리뷰           |
| ---- | ----------------------------- | --------------------- |
| 1    | 문서 작성·검증 완료           | 사용자 진행 확인 완료 |
| 2a   | 구현·검증 완료                | 사용자 진행 확인 완료 |
| 2b   | 구현·검증 완료                | 사용자 진행 확인 완료 |
| 3    | 구현·검증 완료                | 완료                  |
| 4a   | 구현·검증 완료                | 완료                  |
| 4b   | 구현·검증 완료                | 완료                  |
| 4c   | 구현·검증 완료                | 완료                  |
| 5a   | 구현·검증 완료                | 완료                  |
| 5b   | 커밋·검증 완료                | 완료                  |
| 6a   | 구현·검증·커밋 완료           | 완료                  |
| 6b   | T033~T035 구현·검증·커밋 완료 | 완료                  |
| 7a   | T036~T038 구현·검증·커밋 완료 | 완료                  |
| 7b   | T039~T041 구현·검증·커밋 완료 | 완료                  |
| 8    | T042~T045 구현·검증 완료      | 대기                  |

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

## 4b 진행 기록

- 4a는 9d00c02에 커밋했다. 사용자 승인으로 `brussels-v2/member-search`를 생성했으며 실제 PR base는 `brussels-v2/member-list`다.
- 이름 부분 검색·직군 교집합·이름/식별자 정렬·결과 총원·검색 빈 결과를 연결했다.
- 검색 입력과 직군 선택을 MemberFilters로 분리하고 기존 SEED 기반 FilterSelect를 재사용했다. 검색은 사용자 리뷰에 따라 입력 즉시 URL에 반영하고 비교 시 trim한다.
- URL replace/history·직접 접근·잘못된 조건·다른 메뉴 이탈 회귀를 검증한다.
- 4b는 6ac4a84에 커밋했다. 4c는 이 커밋을 base로 구현한다.

## 4c 진행 기록

- 4b 사용자 승인 후 4c 팀 표시·필터를 진행했다. 팀 매핑 변경·이동 동작은 추가하지 않았다.
- 매핑 전 안내에서는 팀 열·팀 필터를 숨기고, 매핑 후에는 팀 배지·팀장·미배정 상태와 팀 필터를 표시한다.
- 팀 인원은 검색·직군 필터 전 현재 기수 전체 활동을 기준으로 계산한다. 잘못된 team URL은 전체 팀으로 표시한다.
- 4c는 사용자 승인으로 `330a6b1`에 커밋했다. push·PR은 수행하지 않았고 5a는 해당 커밋에서 진행했다.

## 5a 진행 기록

- 4c를 사용자 승인으로 `330a6b1`에 커밋한 뒤 5a를 진행했다. 실제 작업 base는 `brussels-v2/member-search`(6ac4a84)다.
- `member-form.ts`에서 이름·기수·직군·권한의 입력 계약과 활동 조회를 정의했다. 기수 변경은 팀 연결·출석 기록·같은 회원의 중복 기수 활동이 있으면 제한한다.
- `MemberEditForm`은 TanStack Form과 SEED Field·TextField·FilterSelect로 초안을 원본과 분리한다. 변경 이력과 준비 중 안내를 표시하고 저장·비활동 처리는 비활성 상태로 둔다.
- Enter 제출은 `preventDefault`만 수행하며 저장 요청이나 토스트는 호출하지 않는다. 5b의 `overlay.open`·더보기 연결은 시작하지 않는다.
- 이번 단계는 미커밋이며 push·PR은 수행하지 않았다. 사용자 리뷰 후 다음 단계 진행 여부를 확인한다.

## 5b 진행 기록

- 5a를 사용자 승인으로 `aa19898`에 커밋한 뒤 5b를 진행했다. 실제 작업 base는 `brussels-v2/member-search`(aa19898)다.
- 회원 행의 더보기 버튼에서 `overlay.open`으로 수정 모달을 연다. 모달은 SEED `ContentDialog`와 `MemberEditForm`을 재사용하며 취소·닫기 시 초안을 폐기한다.
- 모달은 회원 행의 더보기 클릭으로만 열고, 취소·닫기 시 컨트롤러의 `unmount`로 제거한다. 페이지 경계를 넘는 경우에는 기존 `AdminOverlayProvider`의 페이지 수명 정리를 따른다.
- 저장·비활동 처리는 계속 준비 중 비활성 상태이며 실제 mutation·토스트·팀 매핑 동작은 추가하지 않는다.
- `b5beecf`에 커밋했다. push·PR은 수행하지 않았다. 사용자 리뷰 후 6a 진행 여부를 확인했다.

## 6a 진행 기록

- 5b를 `b5beecf`에 커밋한 뒤 6a 파일 파서·양식을 진행했다. 6a는 `acc4f48`에 구현·검증·커밋했다.
- Papa Parse 5.7.0과 `@types/papaparse`를 workspace catalog와 admin 의존성에 고정하고 lockfile을 갱신했다. `pnpm install --lockfile-only`의 공급망 정책 검사를 통과했다.
- CSV만 읽고 지정된 한글 헤더를 정확히 확인하며, 10MB 초과·빈 파일·손상 CSV를 구분한다. 인용부호·줄바꿈을 보존하고 빈 행과 원본 행 번호를 6b 검증 단계에 전달한다.
- CSV 양식은 UTF-8 BOM과 `이름,전화번호,기수,직군,권한` 헤더를 제공해 전화번호 앞자리 유실을 막는다. 실제 저장·중복 판정·행별 정정은 추가하지 않았다.
- `import-file.test.ts`에서 CSV 인용부호·줄바꿈·빈 행·손상/빈 파일·10MB 경계·잘못된 헤더·양식 BOM을 검증했다.
- 6a 구현·검증·커밋 완료. 다음 단계로 6b를 진행했다.

## 7a 진행 기록 — 파일 상태 훅

- 6a를 `acc4f48`에 커밋한 뒤 파일 선택 상태 훅의 첫 하위 작업(T037)을 진행했다. UI 연결(T036)과 화면 테스트(T038)는 아직 시작하지 않았다.
- `useImportFileMutation`은 순수 CSV 파서를 `useMutation`의 `mutationFn`으로 호출하고, 로컬 작업이므로 `networkMode: 'always'`, `retry: false`를 사용한다. `useImportFile`은 파일 선택과 mutation 상태만 조합하며 별도 파일 상태를 두지 않는다.
- 파일을 바꾸면 새 mutation을 실행한다. 최신 mutation observer 상태만 화면에 노출해 이전 파일 결과를 별도로 추적하지 않는다.
- 다시 올리기는 `reset()`으로 결과·오류·상태를 초기화한다. 파일은 별도 상태나 URL에 저장하지 않으며, 화면 이탈 시 React Query mutation observer가 정리된다.
- `use-import-file.test.tsx`에서 성공·교체·다시 올리기 상태를 검증했다.
- T037은 `e9728f0`에 구현·검증·커밋 완료했다. T036/T038은 아직 시작하지 않았고, 사용자 승인으로 6b를 진행했다.

## 6b 진행 기록 — 행 검증·중복 분류

- `validateMemberImportRows`에서 빈 행을 제외하고 값을 trim한 뒤 열 수·필수 값·전화번호·기수·직군·권한을 검증한다. 전화번호는 기존 정규화 규칙을 재사용한다.
- 유효한 전화번호·기수 조합만 내부 중복 집합에 넣어 오류 행 뒤의 유효 행을 보존하고, 이후 동일 조합은 원본 행을 가리키는 파일 중복 오류로 표시한다.
- `classifyMemberImportRows`에서 읽기 전용 회원 명단과 비교해 신규 회원·새 기수·기존 활동 중복을 구분하고 기존 활동 ID를 보존한다.
- `summarizeMemberImportRows`는 정상·오류·중복을 배타적으로 집계하고 선택한 덮어쓰기 중복만 반영 예정 수에 포함한다. 실제 저장은 구현하지 않았다.
- `import-rows.test.ts`에서 필드 오류·공백 정리·오류 행 뒤 중복·전화번호 정규화·회원 분류·집계를 검증했다.
- T033~T035 구현·검증 완료 후 `e5388f3`에 커밋했다. 사용자 리뷰 대기.

## 7a 진행 기록 — 업로드 화면

- 6b 변경을 `e5388f3`에 커밋한 뒤 T036·T038을 진행했다. 파일 선택과 드롭은 SEED `AttachmentInput`으로 같은 파서 mutation 경로를 사용한다.
- CSV 안내·10MB 제한·전화번호 형식 설명·양식 다운로드·읽기 중/성공/실패 상태를 구현했다. 파일 교체는 기존 파일을 `다시 올리기`로 초기화한 뒤 최신 파일만 읽는 흐름으로 제한한다.
- 개발 환경에서만 `memberPreviewAfterMapping`을 props로 전달해 6b의 정상·오류·중복 집계를 표시하고, 운영 환경에서는 API 연결 준비 안내만 표시한다. 저장·실제 반영·전화번호 로그는 추가하지 않았다.
- T038에서 파일 선택·드롭·파싱 실패·다시 올리기·파일 교체와 목록 복귀 키보드 흐름을 검증했다.
- Admin lint·typecheck 통과. Admin 전체 테스트는 52개 파일·542개 테스트를 새로 실행했다.
- `node --run check`와 `node --run build` 통과. 포맷·admin 작업은 새 실행했고 다른 패키지는 Turbo 캐시를 재사용했으며, 기존 청크 크기 경고가 남아 있다.
- 페이지에 모여 있던 파일 입력·mutation 상태를 `useMemberImportUpload`로 이동하고, 업로드 입력·결과 집계·양식 다운로드를 각각 컴포넌트로 분리했다. `selectedFile`은 `entries`에서 파생하도록 중복 상태를 제거했다.
- 파일 선택·교체 테스트는 `userEvent.upload`를 사용한다. 드롭 테스트의 `fireEvent.drop`은 `userEvent`에 파일 드롭 API가 없어 실제 드롭 이벤트를 검증하기 위해 유지했다.
- T036·T038 구현·검증 완료, 사용자 리뷰 대기. 7b는 리뷰 후 진행한다.

## 7b 진행 기록 — 미리보기와 선택

- 업로드 결과를 `ImportPreview`로 분리하고, 원본 행 번호·이름·전화번호·기수·직군·권한·검토 결과를 의미 있는 `<table>`로 표시했다. 전체 행은 오류와 중복을 포함하며, 긴 명단은 제한된 높이의 스크롤 영역에서 확인한다.
- 오류 행은 메시지와 연결된 중복 원본 행을 함께 표시한다. 중복 행은 SEED `RadioGroupField`로 기본 건너뛰기·덮어쓰기를 선택하며, 선택하지 않은 중복은 예정 수에 포함하지 않는다.
- 예시 회원 명단을 비교 입력으로 사용하는 개발 화면임을 안내하고, 실제 반영 요청은 연결하지 않은 채 `회원 명단 반영 준비 중` 비활성 버튼만 표시한다.
- 파일 이름이 바뀌거나 결과가 초기화되면 미리보기 컴포넌트가 새 상태로 시작하도록 연결했다. 별도 전역 상태·저장소·반영 API는 추가하지 않았다.
- `import-preview.test.tsx`에서 마지막 중복 행의 라디오 접근, 건너뛰기/덮어쓰기별 예정 수, 반영 요청·성공 상태 부재를 `userEvent`로 검증했다.
- T039~T041 구현·검증은 완료했으며, 사용자 리뷰 전까지 7b 변경은 커밋하지 않는다.

## 8단계 진행 기록 — 통합 대표 흐름(T042)

- 7b를 `49bca5b`에 커밋한 뒤 통합 라우터 회귀 테스트를 진행했다.
- 회원 목록에서 예시 회원의 수정 모달을 열고, 초안을 변경하지 않은 상태로 취소해 모달 제거·회원 목록 복귀·트리거 포커스 복귀를 확인했다.
- 명단 업로드 경로에서 실제 CSV 파일을 `userEvent.upload`로 선택하고, 미리보기 표가 표시된 뒤 회원 목록으로 복귀하는 경로와 최종 URL을 확인했다.
- T042 구현·검증을 완료했으며, 사용자 리뷰 전까지 8단계 변경은 커밋하지 않는다.

## 8단계 진행 기록 — 화면·접근성 인수(T043)

- 375px 뷰포트에서 `AttachmentInput.Trigger`가 드롭존 고정 높이를 벗어나 하단 액션과 겹치는 문제를 확인했다. SEED 구조에 맞게 트리거를 `AttachmentInput.Container`로 분리하고 좁은 화면에서도 세로로 배치되도록 수정했다.
- 기본 데스크톱 뷰포트와 375px×800px 뷰포트에서 업로드 화면을 확인했다. CSV 안내·파일 선택·양식 다운로드·목록 복귀 링크가 화면 안에 표시되고 버튼이 겹치지 않는다.
- 브라우저 접근성 트리에서 메뉴→CSV 파일 선택→양식 다운로드→목록 복귀 순서와 각 컨트롤의 이름을 확인했다. 실제 VoiceOver·터치 실기기 검증은 실행 환경 제약으로 남겨 두었다.
- 제공된 Figma Admin 화면을 열어 다크 테마 셸·회원 관리 계층·빈 상태 방향을 대조했다. 업로드 화면의 실제 Figma 프레임과 픽셀 단위 비교는 후속 디자인 검토에서 보완한다.
- 운영 빌드 서버를 별도 포트에서 실행해 `/members/import`의 API 준비 안내와 `/members`의 회원 목록 준비 안내가 SSR HTML에 포함되고 개발 예시 회원이 노출되지 않음을 확인했다.
- T043 결과를 validation.md에 기록했으며, 스타일·테스트 변경은 사용자 리뷰 전까지 커밋하지 않는다.

## 8단계 진행 기록 — 재사용 UI 인수(T044)

- 회원 목록에서 사용하는 공용 `ResultSection`은 이미 `packages/ui` 공개 진입점과 Storybook `UI/결과 안내` 사례가 있어 기존 사례를 유지했다.
- 공용 컴포넌트의 제목 계층(`titleAs`)과 기본·보조 액션 클릭 계약을 `packages/ui/src/seed-design/ui/result-section.test.tsx`에 추가했다.
- T044 구현·검증을 완료했으며, 사용자 리뷰 전까지 8단계 변경은 커밋하지 않는다.

## 8단계 진행 기록 — 최종 품질 게이트(T045)

- T044를 `f0002c6`에 커밋한 뒤 최종 `node --run build`를 새로 실행했다.
- `node --run check`와 `node --run build`가 모두 통과했다. 테스트에서 의도적으로 출력하는 기존 오류 로그와 기존 번들 경고는 validation.md에 구분해 기록했다.
- T045 구현·검증을 완료했으며, T046 API 계약 대조 전 사용자 리뷰를 기다린다.
