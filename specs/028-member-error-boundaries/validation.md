# 검증 기록

## 1단계 공식 등록 — 2026-11-25

- 이슈 [#581](https://github.com/YAPP-admin/yapp-plus-frontend/issues/581) 생성·조회 완료. 담당자 DongjaJ, 상태 OPEN. 연결 도구 403 뒤 gh 사용.
- 사용자 요청으로 이슈·등록·2단계 진행 승인 확인. 체크리스트 미체크 2개는 당시 승인 대기 기록이며 이번 승인·이슈 연결로 충족; 마커는 보존.
- HEAD ef237145, origin/main b066fd5d. 시작 시 clean, 0 ahead/103 behind, 회원 웹·공용 UI 차이 없음. 브랜치·이력·commit·push·PR 변경 없음.
- setup-plan·setup-tasks·check-prerequisites 성공. feature.json은 로컬 연결 상태다. 문서 11개 링크·T001~T050 ID·diff 공백 검사 통과.

## 2단계 구현·자동 검증 완료 — 수동 검증·리뷰 대기

- ErrorState·개발 미리보기·Storybook 사례 추가. 구현 전 신규 모듈 부재 실패 확인 후 신규 4개 테스트 통과. lint 규칙 및 위치 테스트의 status 조회 범위 오류 수정.
- `node --run check` 통과(exit 0). 마지막 실행: lint·typecheck 각 7개 중 웹만 신규/6개 캐시, 테스트 웹 574·관리자 718개 신규/공용 UI·브리지·모바일 3개 작업 캐시.
- `node --run build` 통과(exit 0), 웹·관리자·Storybook 3개 모두 신규 실행. chunk 크기 경고 있음. 운영 웹 번들에서 미리보기 문구 제외 확인.
- Chrome에서 그림·안내·액션 렌더링과 접근성 트리 확인. 브라우저 host unavailable 및 사용자 조작 충돌로 320px·실제 키보드/터치·스크린 리더·WebView 확인과 화면 파일 저장은 미완료.
- origin/main merge-base 대비 untracked 포함 +795/-4, 합계 799줄. 650줄 분리 검토: 명세 등록 574줄·UI/테스트 225줄을 별도 PR 단위로 유지. PR 생성 전 base·크기 재확인.
- 로그는 `.context/member-error-boundaries/{check,build,dev}.log`, 초안 검증 이력은 같은 디렉터리 validation.md에 보존. T008 수동 검증·리뷰 후 3-A 진행; 현재 3-A 미착수.

## 3-A 구현·자동 검증 완료 — 사용자 리뷰 승인

- `LocalErrorBoundary`가 수동 Query reset을 공통화하고, 앱의 오류 판별 Context가 위임을 결정한다. 화면 복귀는 fallback을 유지하며, 3-B 전에는 기본 정책이 모든 오류를 지역 처리하므로 인증 전파는 활성화하지 않는다.
- 기존 `QueryBoundary`·`ScreenQueryBoundary`는 같은 public props를 유지하는 호환 래퍼로 바꿨다. `AppErrorBoundary`는 Provider 바깥에서 새로고침·홈 링크만 제공한다.
- 구현 전후 웹 경계 테스트 73개 파일·578개 테스트 통과. `node --run check` 통과(exit 0): 웹 lint·typecheck·test는 신규 실행, 다른 작업은 Turbo 캐시를 재사용했다.
- `node --run build` 통과(exit 0): 웹 build는 신규 실행, admin·storybook build는 캐시 재사용했다. 기존 500kB 이상 chunk 경고는 유지된다. 사용자 리뷰 뒤 `e68c4604 feat(web): 지역·앱 오류 경계를 추가`로 커밋했다.

## 3-B 구현·자동 검증 완료 — 사용자 리뷰 승인

- `ApiError`의 최종 401과 브리지 `ERROR/AUTH_REQUIRED`만 재인증 필요로 정규화했다. 일반 403·네트워크·서버 오류는 제외하며, 이전 계정의 늦은 오류는 별도로 판별하지 않는다.
- GET 갱신이 성공하면 기존처럼 한 번만 재전송한다. 재전송 뒤 401은 QueryCache에서 업무 cache를 정리하고 `AUTH_REQUIRED` 상태로 전환한다. native 자격 삭제·자동 로그인·자동 제출은 수행하지 않는다.
- 모든 Local 경계는 Provider의 인증 판별 정책으로 상위 AuthErrorBoundary에 위임하며, 보호 Activity는 콘텐츠를 먼저 숨긴 뒤 최상단에서 Login으로 한 번 교체한다.
- 집중 회귀: auth 오류 분류·최종 401·브리지 AUTH_REQUIRED·Stackflow 로그인 이동 4개 파일 52개 테스트 통과. `node --run check` 통과(exit 0): 웹 lint·typecheck·test 74 파일 588개는 신규 실행, 나머지 4개 작업은 Turbo 캐시를 재사용했다.
- `node --run build` 통과(exit 0): 웹 build는 신규 실행, admin·storybook build는 캐시 재사용했다. 기존 500kB 이상 chunk 경고는 유지된다.
- `node --run build` 통과(exit 0): 웹 build는 신규 실행, admin·storybook build는 캐시 재사용했다. 기존 500kB 이상 chunk 경고는 유지된다. 실제 WebView·동시 요청 수동 확인과 단계 리뷰는 대기한다.

## 4-A 구현·집중 검증 완료 — 리뷰 대기

- 완료된 일반 조회 오류만 `useThrowQueryError`가 Local 경계로 전달한다. 재시도 요청 중 및 무한 목록의 다음 페이지 오류는 보존해 이후 목록 단계가 처리한다. Query reset 직후에는 TanStack Query의 reset 상태를 존중해 이전 오류를 즉시 다시 던지지 않는다.
- 일정은 성공 cache의 재조회 실패 때 이전 목록을 함께 제거하고 page `ErrorState`로 교체한다. 재시도 성공 시 목록으로 돌아온다.
- 공지 상세는 헤더를 경계 밖에 유지하고, 일반 재조회 실패 때 본문을 page `ErrorState`로 교체한다. 읽음 저장이 이미 성공한 뒤의 후속 상세 재조회 실패는 성공 결과와 별개로 기존 본문을 유지한다.
- 집중 회귀: query 정책·일정·공지 상세 3개 파일 26개 테스트 통과. `node --run check` 통과(exit 0): 웹 lint·typecheck·test 75개 파일 592개 테스트는 신규 실행했고, 나머지 작업은 Turbo 캐시를 재사용했다. 이어진 확인 실행은 전체 5개 test 작업의 캐시를 재사용했다.
- `node --run build` 통과(exit 0): 웹 build는 신규 실행, admin·storybook build는 캐시를 재사용했다. 기존 500kB 이상 chunk 경고는 유지된다. 실제 좁은 화면·키보드·스크린 리더·WebView 확인은 대기한다.
- 현재 4-A 작업 트리는 신규 파일을 포함해 +139/-128, 합계 267줄이다. 다만 현재 HEAD의 `origin/main...HEAD`는 이미 +1327/-70, 합계 1397줄이며, 이 변경을 커밋하면 예상 PR 범위는 +1466/-198, 합계 1664줄이다. 800줄 제한을 충족하려면 PR 생성 전 기존 커밋을 독립 검토 단위로 분리해야 한다.
- 수동 화면 확인과 4-A 사용자 리뷰 뒤에만 4-B를 진행한다.

## 4-B 구현·집중 검증 완료 — 사용자 리뷰 승인

- 홈의 주간 세션·주간 공지는 성공 cache 재조회 실패 때 각각 `ErrorState(section)`로 교체해 서로와 바로가기를 유지한다. 사진 상태의 원시 ErrorBoundary는 Local 경계로 바꿔 일반 오류를 section UI로 표시하고 인증 오류는 상위로 전달한다.
- 프로필과 출석 현황은 각자의 query 오류만 교체한다. 출석 규칙 다이얼로그·메뉴와 정상 형제 영역은 경계 밖에 유지한다. 결석 경고 실패도 출석 내역과 독립된 section 오류로 표시한다.
- Stackflow 회귀는 성공 cache의 출석 현황 재조회 실패 뒤 상세 왕복으로 요청을 추가하지 않고, 수동 재시도로만 복구하는 경로를 확인한다. 집중 회귀 5개 파일 109개 테스트가 통과했다.
- `node --run check`가 통과했다(exit 0). 웹 lint·typecheck·test는 신규 실행했고, 나머지 패키지 작업은 Turbo 캐시를 재사용했다. `node --run build`도 통과했다(exit 0): 웹 build만 신규 실행, admin·Storybook은 캐시 재사용. 기존 500kB 이상 웹 chunk 경고는 유지된다.
- 이번 4-B 작업 트리는 +184/-149, 합계 333줄이다. 현재 커밋 기준 `origin/main...HEAD`는 +1463/-194, 합계 1657줄이므로 4-B를 커밋하면 누적 PR은 약 1990줄이 된다. 800줄 제한을 충족하려면 PR 생성 전에 기존 커밋을 독립 검토 단위로 분리해야 한다.
- 성공 cache 재조회 실패의 이전 DOM 교체와 복귀 중 자동 재요청 방지는 화면 수동 확인으로 재현할 수 없는 흐름이므로, 집중 회귀로 검증했다. 사용자는 그 자동 검증을 정책 근거로 승인했다.
- 실제 320px 화면·키보드·스크린 리더·터치·WebView 수동 확인은 대기한다. 4-C는 별도 사용자 진행 승인 뒤에만 시작한다.

## 4-C 구현·자동 검증 완료 — 리뷰 대기

- 코드 출석·사전 출결 보고는 `BottomSheet` 셸 안에 Local 경계를 둔다. 완료된 주간 조회 오류는 공통 `ErrorState(section)`로 내부 폼을 교체하고, 수동 재시도 뒤 새 폼으로 열어 입력을 초기화한다. 제출 Mutation·위치·입력 검증 오류는 경계 밖 정책으로 유지한다.
- 팀 사진은 선택한 사진 Provider를 경계 밖에 유지하고, 팀원 조회·선택 폼만 `ActivityScreen` 안의 Local/page 경계로 교체한다. 재시도는 기존 사진으로 새 팀원 선택 폼을 연다.
- 알림 설정의 일반 조회 오류는 항목 전체를 `ErrorState(section)`로 교체한다. `UNSUPPORTED`·`PERMISSION_REQUIRED` 브리지 결과와 OS 권한 거부, 변경 Mutation 실패·재시도는 기존 전용 안내를 유지한다.
- 집중 회귀: 코드 출석·출결 보고·알림 설정 3개 파일 48개, Stackflow 팀 사진 1개 파일 37개 테스트가 통과했다. 성공 cache 재조회 실패의 이전 선택 제거와 수동 재시도, 일반 제출 실패의 입력 보존, 미지원 예외를 확인했다.
- `node --run check`와 `node --run build`가 통과했다(exit 0). 최초 check에서 웹·관리자·모바일 lint/typecheck/test와 API lint/typecheck, build에서 웹·관리자는 새로 실행했고 UI·브리지·Storybook 작업은 Turbo 캐시를 재사용했다. 기존 500kB 이상 chunk 경고는 유지된다.
- 실제 320px 화면·키보드·스크린 리더·터치·WebView 수동 확인은 대기하며, 4-C 사용자 리뷰 후에만 5단계를 진행한다.

## 5단계 구현·자동 검증 완료 — 리뷰 대기

- 공지·알림·출석 목록은 첫 조회와 성공 cache 재조회의 일반 실패를 가까운 `ErrorState`로 교체한다. 다음 페이지의 일반 실패만 기존 항목을 유지하고 observer를 해제해 자동 재요청하지 않으며, 사용자의 `다시 시도`로만 복구한다.
- `useThrowQueryError`는 다음 페이지 오류 중에서도 상위 정책이 위임 대상으로 판별한 오류를 다시 던진다. 따라서 최종 401은 목록 안의 안내로 남지 않고 `AuthErrorBoundary`·계정 가드로 전달된다.
- 집중 회귀: query 정책·공지·알림·출석·Stackflow 계정 경계 5개 파일 52개 테스트와 웹 타입 검사가 통과했다. 공지·알림의 재조회 교체, 다음 페이지 실패 뒤 항목 유지·observer 중단·수동 복구, 출석의 동일 흐름, 다음 페이지 최종 401 뒤 Login 한 번 이동을 확인했다.
- `node --run check`와 `node --run build`는 모두 exit 0으로 통과했다. check에서는 웹 lint·typecheck·test가 새로 실행되고 나머지 패키지 작업은 Turbo 캐시를 재사용했다. build에서는 웹 build가 새로 실행되고 admin·Storybook은 캐시를 재사용했다. 기존 500kB 이상 웹 chunk 경고는 유지된다.
- 전체 check 중 기존 홈의 TEAM APPROVED 사진 상태 테스트가 한 번 일시적으로 실패한 로그가 있었으나, 명령은 exit 0이었고 같은 테스트 단독 재실행 및 웹 전체 테스트 재실행은 exit 0으로 통과했다. 이번 목록 오류 변경과 직접 관련 없는 기존 비결정성 가능성으로 기록한다.
- 현재 `origin/main` 대비 작업 트리는 문서 포함 800줄 제한을 초과한다. PR 생성 전 4-C와 5단계를 독립 검토 단위로 분리해야 한다. 실제 좁은 화면·키보드·스크린 리더·터치·WebView 수동 확인은 다음 리뷰에서 대기한다.
