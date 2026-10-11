# 관리자 라우팅 계약과 단계별 계획

관리자 앱은 TanStack Start/Router로 페이지와 URL 상태를 관리합니다.
[ADR 0001](./adr/0001-admin-frontend-architecture.md)을 유지하며 nuqs는 추가하지 않습니다.
구조는 [관리자 개발 가이드](./admin-development.md)를 따릅니다.

## 현재 적용 범위

- PR 1 관련 이슈: [#46](https://github.com/YAPP-admin/yapp-plus-frontend/issues/46).
- PR 1 공통 셸과 PR 2 세션 목록 구현을 완료했습니다. PR 3 이후는 미착수 상태입니다.
- 검증 기록: [PR 1](./admin-routing-validation.md), [PR 2](./admin-sessions-routing-validation.md).
- PR 2 관련 이슈: [#49](https://github.com/YAPP-admin/yapp-plus-frontend/issues/49).
- 현재 제공하는 경로는 `/` 대시보드, `/login`, `/sessions`입니다. 로그인 성공 후 `/` 이동을 유지합니다.
- 대시보드는 공통 셸과 현재 메뉴 표시를 사용합니다. 로그인에는 관리자 메뉴가 없습니다.
- 알 수 없는 경로는 404 안내와 대시보드 복귀 링크를 제공합니다.
- 아래 후속 경로와 쿼리는 합의한 계약이며 각 단계에서 구현합니다. 미구현 메뉴는 노출하지 않습니다.
- 실제 업무 UI·API·인증·권한 검사·기수 선택은 별도 작업입니다.

## 페이지와 쿼리 계약

`:id` 표기는 파일 기반 라우트에서 `$id`로 작성합니다.

| 경로                      | 화면           | 쿼리                                 | 단계      |
| ------------------------- | -------------- | ------------------------------------ | --------- |
| `/`                       | 대시보드       | 없음                                 | 기존 유지 |
| `/login`                  | 로그인         | 없음                                 | 기존 유지 |
| `/sessions`               | 세션 목록      | `part`                               | PR 2      |
| `/attendance/:sessionId`  | 세션별 출석부  | `part`                               | PR 3      |
| `/attendance/scores`      | 출석 총점      | `part`                               | PR 3      |
| `/members`                | 회원 목록      | `tab`, `q`, `part`, `role`, `status` | PR 4      |
| `/members/import`         | 명단 업로드    | 없음                                 | PR 5      |
| `/notices`                | 공지 목록      | `category`                           | PR 6      |
| `/notices/:noticeId`      | 공지 상세      | `tab`                                | PR 7      |
| `/notices/new`            | 공지 작성      | 없음                                 | PR 8      |
| `/notices/:noticeId/edit` | 공지 수정      | 없음                                 | PR 8      |
| `/notifications`          | 알림 발송 내역 | 없음                                 | PR 9      |

## 쿼리 값과 탐색 규칙

- 회원 `tab`: `all | pending`, 기본값 `all`.
- 공지 상세 `tab`: `readers | questions`, 기본값 `readers`.
- `part`: `all | pm | design | android | ios | web | server`. 세션 목록만 `common`을 추가해
  전체 직군 대상 세션을 구분합니다.
- 회원 `role`: `all | admin | active-member | regular-member`.
- 회원 `status`: `all | active | inactive`.
- 공지 `category`: `all | session | submission | operation`.
- 필터 기본값은 `all`, 이름 검색 `q`의 기본값은 빈 문자열입니다.
- 각 라우트의 `validateSearch`에서 Zod 4로 검증합니다. Zod 4.5.4는 catalog에서 관리하며
  관리자와 API 패키지가 같은 버전을 사용합니다.
- 누락·잘못된 값은 필드별 기본값으로 처리하고 앱이 생성하는 URL에서는 기본값을 생략합니다.
- 화면·탭·선택형 필터 변경은 history에 추가합니다. 검색은 300ms debounce 후 `replace`합니다.
- 같은 페이지의 쿼리 변경은 스크롤을 유지합니다. 다른 메뉴에는 이전 페이지 필터를 전달하지 않습니다.
- 브라우저 뒤로가기는 이전 URL을 복원합니다. 명시적인 목록 복귀 링크는 목록 기본 상태로 이동합니다.
- 입력 중인 검색어 외에는 쿼리를 React 상태로 복제하지 않습니다. 이동이나 history 복원 후 대기 중인
  검색 갱신이 새 URL을 덮어쓰지 않도록 취소합니다.
- 값은 프런트엔드 URL 계약이며 실제 API 연결 시 API 명세와 경계에서 변환합니다.
- 이번 단계별 작업에는 페이지네이션·가변 정렬을 추가하지 않습니다.

출석부 메뉴는 `/sessions`에서 세션을 고른 뒤 `/attendance/:sessionId`로 이동합니다.
별도 선택 화면이나 최근 세션 자동 선택은 추가하지 않습니다. 실제 세션 행의 링크는 데이터 화면
구현 시 연결하고, 라우팅 단계에서는 typed 탐색을 테스트합니다.

세션 만들기·정보 보기, 회원 수정·가입 승인·거절, 알림 보내기 등의 모달은 로컬 상태입니다.
명단 업로드·미리보기 단계와 파일, 폼 입력, 출석 코드, 승인 사유와 행 선택은 URL에 넣지 않습니다.

## 단계별 완료 조건

각 단계는 제목·준비 중 안내·필요한 탭과 필터까지 제공합니다. 가짜 업무 데이터와 동작하지 않는
제출 버튼은 만들지 않습니다. 최소 화면의 컨트롤은 URL 상태를 실제로 변경할 수 있어야 합니다.

| 단계 | 작업                       | 완료 조건                                             |
| ---- | -------------------------- | ----------------------------------------------------- |
| PR 1 | 공통 셸 분리·현재 메뉴·404 | 기존 화면 유지, 잘못된 URL에서 키보드로 대시보드 복귀 |
| PR 2 | 세션 목록·직군 필터·Zod    | 직접 접근·새로고침·history에서 필터 복원              |
| PR 3 | 출석부·출석 총점·메뉴 연결 | typed 탐색·복귀, `scores`와 동적 ID 충돌 방지         |
| PR 4 | 회원 목록·탭·검색·필터     | 복합 필터 보존, 검색 debounce와 이동 중 갱신 취소     |
| PR 5 | 명단 업로드 진입점         | 목록에서 업로드 화면 이동·복귀                        |
| PR 6 | 공지 목록·종류 필터        | `category` 검증·기본값 생략·history 복원              |
| PR 7 | 공지 상세·읽음/질문 탭     | ID와 탭 직접 접근·복귀                                |
| PR 8 | 공지 작성·수정 진입점      | 목록→작성·상세→수정 및 복귀, `new` 경로 충돌 방지     |
| PR 9 | 알림 내역·전체 검증        | 직접 접근·메뉴 표시, 전체 경로·문서 최종 확인         |

명단 파일 처리, 공지 편집기·첨부·저장, 알림 발송·예약·취소는 후속 범위입니다.

## 검증과 진행 규칙

- 실제 라우트 트리를 사용해 직접 접근, 이동, 404, 쿼리 복원을 검증합니다.
- 페이지 로직과 스키마는 해당 슬라이스에 두고 프레임워크 연결은 route 파일에서 처리합니다.
- 각 구현 단계에서 관련 테스트 후 `mise exec -- node --run check`와
  `mise exec -- node --run build`를 실행합니다. 브라우저의 키보드·좁은 화면도 확인합니다.
- 단계 종료 시 완료 동작·검증·변경 줄 수·남은 질문·다음 작업을 보고하고 멈춥니다.
  사용자 허락 전에는 다음 단계에 착수하지 않습니다.
- Stacked PR의 첫 base는 `main`, 다음 base는 직전 단계 브랜치입니다.
- PR별 고유 diff의 추가·삭제 합계에 문서·테스트·생성 파일·lockfile을 모두 포함합니다.
  800줄 이상이면 기능과 관련 테스트를 함께 분리합니다. 앞 PR 변경을 중복 계산하지 않습니다.
- 회원 목록이 기준을 넘으면 선택형 필터와 이름 검색·debounce를 우선 분리합니다.
- 앞 PR merge 후 다음 PR의 base와 diff를 다시 확인합니다.
- 제품 정책·API·범위의 불확실성이 생기면 해당 작업 전에 사용자에게 확인합니다.

## 참고

- [Figma 관리자 화면](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=217-11960)
- [세션별 출석부](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=221-19916)
