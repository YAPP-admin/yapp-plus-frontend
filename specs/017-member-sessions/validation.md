# 검증 기록: 회원용 세션 확인

## 현재 출시 점검 상태 — 2026-11-07

- **출시 검증 미완료**. 사용자가 개발 API·테스트 계정 미준비로 실제 WebView 검증 보류를 명시했다. 기능·자동 테스트 완료를 실환경 통과로 대체하지 않는다.
- 구현·자동 검증: 홈/일정 정상·빈 결과·오류·재시도, 401 갱신, 계정 경계·늦은 결과 차단, focus 복귀, 네트워크 복구, 키보드 재시도. 최신 web 테스트는 220개다.
- 시각 근거: iOS 17.5 Safari의 일정 오류·정상 화면 및 실제 앱의 로그인 화면. 로그인 후 홈·일정의 실제 API 연동, 당김·스크롤 tone, VoiceOver/TalkBack·터치는 미완료다.
- 최종 check 성공: format 신규 실행, lint 7/7·typecheck 7/7·test 5/5는 Turbo 캐시 재사용. 직전 offline-accessibility-check에서 web 220개 테스트를 신규 실행했다. 최종 build 성공: web 신규 실행, admin·Storybook 캐시 재사용. 로그 .context/session-release-{check,build}.log. 기존 web 번들 크기 경고는 남아 있다.
- main #329의 업무 cache 제거·인증 제어 cache 유지와 동시 복귀 조회 정책을 spec·plan·contract에 일치시켰다. queryClient.clear() 전체 제거 또는 BFCache 이전 화면 비노출을 보장한다고 쓰지 않는다.
- 롤백: 서버 명세·데이터·native 브리지 계약 변경은 없다. 배포 후 문제가 발생하면 마지막으로 검증된 main 배포 산출물로 웹을 복구한다. 현재 작업 브랜치 HEAD를 배포 기준으로 삼지 않는다. 인증 연동만 되돌릴 경우 계정 경계·기존 native 인증은 보존하고 HTTP 401 Provider 반영 변경 범위를 함께 검토한다.
- PR 준비: origin/main bba7ca3 대비 약 4,260줄로 800줄 상한을 초과한다. 사용자 요청에 따라 현재 브랜치 작업을 유지했으며, PR 생성 전 독립 단위로 분리해야 한다. 이번 단계는 문서 정합성·최종 점검만 수행했고 commit·push·PR·배포는 하지 않았다.
- 재개 조건: 테스트 API origin과 로그인 가능한 개발 앱·테스트 계정을 준비한 뒤 quickstart의 실제 WebView 시나리오를 실행한다. MSW를 끈 별도 검증 환경에서 실제 API 호출임을 확인하고, 자격 값은 기록하지 않는다.

## 1단계 결과

- 브랜치: `DongjaJ/nsu85`. 이름·이력·원격 상태 변경 없음.
- HEAD: `7629bcf` (`docs(sessions): 회원 세션 조회 명세 추가`).
- origin/main: `9186dc6b0883003f7a025cd3a6cd04899eddfb3a`.
- fetch 후 ahead/behind: 0/1. 차이는 설정 약관 링크 2파일이며 이번 초안과 충돌하지 않는다.
- 기능 이슈: [#328](https://github.com/YAPP-admin/yapp-plus-frontend/issues/328). 담당자 `DongjaJ`, 라벨·마일스톤 없음.
- 정식 위치: `specs/017-member-sessions/`.
- 준비한 문서: spec·plan·research·data-model·contracts·tasks·quickstart·checklists·validation.
- `.specify/extensions.yml`이 없어 specify/plan/tasks 전후 확장 훅은 없다.
- `SPECIFY_FEATURE_DIRECTORY=specs/017-member-sessions`로 Spec Kit setup-plan/setup-tasks를 실행했다. plan은 기존 정식 문서를 보존했고, setup-tasks는 research·data-model·contracts·quickstart를 인식했다.
- `check-prerequisites --paths-only`와 문서 검사는 이 단계 결과로 아래에 기록한다.

## 검증 결과

아래는 이번 초안 준비 중 실행한 결과다. 캐시 재생 로그의 과거 테스트 시간·실행 경로는 신규 실행 증거가 아니다.

| 항목                     | 상태           | 근거                                                           |
| ------------------------ | -------------- | -------------------------------------------------------------- |
| 도구 버전                | 성공·신규 확인 | Node.js v24.20.0, pnpm 12.3.4                                  |
| 문서 형식·참조·작업 추적 | 성공·신규 확인 | Markdown 9개, 작업 T001~T037, 상대 링크·요구사항 연결 검사     |
| node --run check         | 성공·exit 0    | format 신규 실행, lint 7/7·typecheck 7/7·test 5/5는 Turbo 캐시 |
| node --run build         | 미실행·비대상  | 제품 코드·빌드 설정 변경 없음                                  |
| node --run expo:doctor   | 미실행·비대상  | 모바일 설정·의존성 변경 없음                                   |
| 실제 API·WebView·접근성  | 미실행         | 구현 전이며 5~7단계 검증 대상                                  |

Spec Kit 전제조건은 spec·plan·tasks와 research·data-model·contracts·quickstart를 모두 인식했다.
정식 문서 9개를 명시해 oxfmt 형식 검사를 실행했다.
검증 도구 실행 시 pnpm이 고정 lockfile의 누락된 로컬 의존성을 자동 복원했다. manifest·lockfile 변경은 없다.

## 변경량과 후속 작업

정식 문서는 542줄 추가·삭제 0줄이며, 현재 base 대비 문서 변경은 650줄 분리 검토 기준 아래다.
기능 이슈 생성과 정식 반영을 완료했다. 이후 제품 코드 단계는 이 문서 변경과 분리해 검토한다.
1단계 리뷰 및 다음 단계 진행 승인 전에는 인증·조회·화면 코드를 수정하지 않는다.

## 2단계 — 2026-11-06 범위 축소

사용자 리뷰에 따라 미커밋 인증 재설계를 제거했다. provider·mutation·로그인/가입/설정·Stackflow는
현재 HEAD의 기존 구현으로 복원했다. 추가한 인증 테스트와 탐색 경계도 제거했다.
이전 재설계의 테스트 통과 기록은 현재 구현의 완료 증거로 사용하지 않는다.
홈·일정 조회는 아직 미구현이며 다음 단계부터 기존 인증과 native 401 갱신을 사용해 연결한다.
전체 캐시 clear·계정 격리·복귀 복구는 인증 작업과의 연결 및 통합 검증이 남아 있다.
롤백은 이번 문서 변경을 되돌리는 것으로 가능하며 서버·브리지·저장 형식 변경은 없다.

- check: exit 0. format 신규 실행, lint 7/7·typecheck 7/7·test 5/5는 Turbo 캐시 재사용.
- build: exit 0. web 신규 실행, admin·storybook 2개는 Turbo 캐시 재사용.
- git diff --check: 통과. 실제 API·WebView·접근성은 미실행이며 조회 구현 후 검증한다.
- expo:doctor: 모바일 설정·의존성 변경이 없어 미실행.
- 제품 코드의 HEAD 대비 변경은 없다. PR의 merge-base 대비 변경은 문서만이며 650줄 미만이다.
- 이번 범위 정리의 리뷰 후 3단계 조회 연결을 진행한다. commit·push·이슈 변경은 실행하지 않았다.

## 3단계 — HTTP client의 native 인증 interceptor

- runAuthenticatedQuery를 제거했다. Provider가 apiOptions를 제공하고 화면은 생성 queryOptions + useSuspenseQuery를 사용한다.
- HTTP client의 afterResponse에서 GET 401만 native 갱신 후 ky.retry로 한 번 재전송한다. 일반 네트워크 재시도는 막는다. 요청 헤더·취소 신호를 유지하고 다른 세션·낮은 토큰 버전은 거부한다.
- 생성 SDK의 오류 본문 처리를 위해 ky의 throwHttpErrors만 false로 지정한다. SDK throwOnError는 유지한다. 생성 코드는 변경하지 않았다.
- 인증 전환 시 요청 취소·전체 clear와 Provider 토큰 동기화는 인증 작업에 남아 있다. 화면·스키마·목업 연결은 4단계 이후다.
- SDK/MSW 테스트 13개가 통과했다. 생성 queryOptions의 401 → 갱신 → 성공 데이터 저장과 최종 오류 전달을 검증했다.
- check 통과: format·web lint/typecheck/test(115개) 신규 실행, 나머지는 Turbo 캐시. build 통과: web 신규 실행, 나머지 2개 캐시. git diff --check 통과. 실제 API·WebView는 미실행이며 UI·모바일 설정 변경이 없어 화면 검증·expo:doctor는 미실행.
- main merge-base 기준 추가 789줄·삭제 1줄, 총 790줄이다. 문서와 구현은 다음 단계 전에 PR 분리가 필요하다. 브랜치·커밋·push는 변경하지 않았다.
- 실패 시 client 옵션과 Provider 연결을 제거하면 기존 동작으로 복구된다. 다음 단계는 이번 단계 리뷰 후 진행한다.

## 4단계 — 생성 코드 중심의 조회 데이터 기반

- 사용자 승인에 따라 현재 브랜치에서 작업하고 브랜치·PR 분리는 이후로 미뤘다.
- currentWeekQueryOptions·scheduleQueryOptions·parseCurrentWeek를 제거했다. 생성 find3Options/find4Options를 직접 사용하며 SDK responseValidator에 확장 Zod 스키마의 parseAsync를 연결한다.
- 생성 Zod에 regex/refine만 추가해 안전 정수 ID·시간·주간 범위를 검증한다. 장소 대체 문구·ID 문자열 변환 등 화면 표시는 다음 화면 단계로 옮겼다.
- 생성 faker·MSW 핸들러를 재사용하고 날짜·시간 관계만 보정한다. 빈 결과·순서·잘못된 응답은 테스트에서 필요한 필드만 덮어쓴다. 생성 파일·공용 패키지·의존성은 변경하지 않았다.
- 데이터·시간 테스트 28개가 통과했다. 생성 queryOptions의 원본 응답 보존과 Zod 실패 시 성공 캐시 저장 방지를 검증했다.
- 화면 연결·Suspense/오류 경계·인증별 렌더링·주 경계 stale/refetch·종료 시각 표시 갱신은 다음 단계다. 한국 시간 유틸리티는 유지했다.
- 인증 전환의 전체 clear·요청 취소·Provider 토큰 동기화는 기존 연동 과제다. 실제 API·WebView·접근성은 미실행이며 모바일 변경이 없어 expo:doctor는 실행하지 않았다.
- 복구는 이번 스키마·시간 유틸리티·MSW 등록을 되돌리면 된다. 커밋·push·브랜치 변경은 하지 않았다.
- check 통과: format·web lint/typecheck/test(31파일 143개) 신규 실행, 나머지 Turbo 캐시. build 통과: web 신규 실행, admin/storybook 캐시. git diff --check 통과.

## 5단계 — 일정 화면 조회 연결

- 4단계 데이터 기반 변경은 사용자 승인으로 80dca25에 커밋했다. 이후 일정 화면 변경은 아직 커밋하지 않았다.
- DEFAULT_SCHEDULES와 props 기반 예시 목록을 제거하고 화면에서 생성 find4Options + useSuspenseQuery를 직접 사용한다. Provider의 apiOptions와 생성 Zod 확장 검증을 연결했다.
- 로그인된 WebView 또는 DEV+MSW 브라우저에서만 조회 컴포넌트를 렌더링한다. 일반 브라우저에는 앱 로그인 안내를 표시한다.
- 페이지 안의 Suspense·오류 경계로 최초 로딩/실패와 재시도를 처리한다. 재조회 실패 시 기존 목록을 유지하고 연속 재시도는 진행 중인 요청을 공유한다. 인증/권한 오류에는 현재 공통 로그인·접근 권한 확인 안내를 제공하며, HTTP 상태별 상세 안내는 인증 연동 검증에 남아 있다.
- 서버 순서·한국 시각·분·REGULAR 칩·null 장소를 표시한다. 빈 목록 문구는 등록된 세션 일정이 없어요로 변경했다. 조회 성공 시각을 기준으로 종료 여부를 계산하고 별도 타이머는 두지 않는다. 종료 여부는 접근성 이름에도 반영한다.
- 일정 화면 7개 사례와 Stackflow 직접 진입·탭 복귀를 검증했다. check 통과: format·web lint/typecheck/test(31파일 147개) 신규 실행, 나머지 Turbo 캐시. build 통과: web 신규 실행, admin/storybook 캐시. git diff --check 통과.
- Chrome 탭 제어는 timeoutMs 오류, native 대체 캡처는 검은 이미지로 반환돼 시각 검증 근거를 확보하지 못했다. 키보드 재시도는 자동 테스트로 확인했으며 실제 WebView·터치·스크린 리더·작은 화면은 미검증이다. 공용 UI·모바일 설정 변경이 없어 Storybook·expo:doctor는 비대상이다.
- 롤백은 이 단계의 일정 화면·탐색 테스트 변경을 되돌리는 것으로 가능하다. 홈 API 연결·캐시 초기화·Provider 토큰 동기화는 이번 단계에 포함하지 않았다. 사용자 요청대로 브랜치 분리는 이후에 진행한다.

- 개발 미리보기: scheduleState=loading(5초 지연)·error(첫 조회 실패 후 재시도 성공)·empty를 MSW 시작 시 선택한다. DEV+MSW에서만 적용한다. 오류 복구·빈 화면 테스트를 추가했다.
- 미리보기 추가 후 check 통과: format·web lint/typecheck/test(149개) 신규 실행, 나머지 캐시. build 통과: web 신규 실행, 나머지 캐시. 시각·실기기 검증의 기존 미완료 상태는 유지한다.

- 리뷰 반영: SEED List.Root/Item/Prefix/Content/Title/Detail/Suffix로 목록을 구성했다. 직접 작성한 ScheduleErrorBoundary는 제거하고 react-error-boundary의 ErrorBoundary와 QueryErrorResetBoundary를 연결했다.
- Query 재시도는 앱 Provider 기본값에서 끄고 HTTP 재시도는 인증 Provider의 client 옵션으로 모았다. 401 갱신 후 한 번 재시도하는 기존 동작은 유지했다. 화면의 중복 staleTime과 isFetching 표시를 제거했다.
- Android ScheduleViewModel과 SessionScheduleUiMapper도 조회 결과를 변환할 때 현재 시각으로 종료 여부를 계산하며 반복 타이머를 두지 않는다.
- 참고: [SEED List](https://seed-design.io/react/components/list), [react-error-boundary](https://github.com/bvaughn/react-error-boundary), [Android 일정 mapper](https://github.com/YAPP-admin/yapp-plus-android/blob/main/feature/main/schedule/src/main/java/com/yapp/plus/feature/main/schedule/model/SessionScheduleUiMapper.kt).

- 최초 전체 검증은 기존 Stackflow 첫 탐색 테스트의 5초 제한으로 두 번 실패했다. 내부 화면 대기 제한(10초)보다 짧아 다른 탐색 사례와 같은 15초로 맞췄으며 화면 검증은 유지했다.
- 리뷰 반영 후 check 통과: format·web lint/typecheck/test(149개)를 신규 실행했고 나머지는 Turbo 캐시를 사용했다. build 통과: web 신규 실행, admin/storybook 캐시. 실제 화면·터치·스크린 리더 검증은 기존 도구 오류로 미완료다.

- 추가 리뷰 반영: ScheduleErrorBoundary를 별도 파일로 분리하되 라이브러리 ErrorBoundary와 QueryErrorResetBoundary의 조합만 유지했다. ScheduleLoading은 SEED List와 Skeleton으로 날짜·제목·장소·시간 윤곽을 4행 표시한다. 반복 애니메이션 없이 표시하며 윤곽은 접근성 트리에서 숨기고 로딩 안내를 한 번 제공한다.
- 공식 구현 참고: [SEED Skeleton](https://seed-design.io/react/components/skeleton).
- 분리·스켈레톤 적용 후 check 통과: web lint/typecheck/test(149개) 신규 실행, 나머지 캐시. build 통과: web 신규 실행, 나머지 2개 캐시. git diff --check 통과. 실제 화면·터치·스크린 리더는 미검증이며 브랜치 분리는 사용자 요청대로 유예한다.
- 오류 fallback을 공용 ResultSection의 제목·설명·primaryActionProps로 교체했다. 오류 알림과 키보드 재시도는 유지한다. check(web 테스트 149개)·build 통과: web 신규 실행, 다른 패키지 캐시. 실제 화면 검증은 미실행이다.

- 피그마 59:28487의 오류 UI를 반영했다. 원본 59:28493 일러스트는 SVG 내보내기에서 일부 도형이 누락되어 PNG 2배 해상도로 다시 내보내고 육안으로 대조했다. 일정 전용 로컬 에셋과 ResultSection을 사용하며 두 줄 안내 아래에 재시도를 추가했다. 기존 목록을 유지하는 재조회 실패 안내는 유지한다.
- check(web 테스트 149개)·build 통과: web 신규 실행, 나머지 캐시. 브라우저 제어가 timeoutMs 오류로 실패하여 실제 렌더링·터치·스크린 리더는 미검증이다. 참조 화면은 .context/schedule-error-figma.png에 보관했다.
- 사용자가 오류 미리보기를 직접 확인했다. 확인 후 scheduleState 없는 /schedule로 정상 조회 화면을 다시 열었다. 상태별 개발 미리보기는 명시적인 URL에서만 유지한다. Provider 설정·개발 미리보기·일정 화면 구현을 목적별 커밋으로 분리하며, 실기기 접근성 검증과 PR 분리는 계속 남아 있다.

## 6단계 — 홈 이번 주 세션 조회

- CurrentWeekCard에서 생성 find3Options와 useSuspenseQuery를 직접 사용하고 Provider apiOptions·currentWeekSchema 검증을 연결했다. 전체 일정 조회나 이름으로 세션 종류를 추측하는 조인은 하지 않는다.
- 서버의 주간 시작일부터 7일 달력을 구성하고 조회 성공 시점의 한국 날짜로 오늘 문구·밑줄을 표시한다. 세션 날짜는 기존 배경색으로 구분한다. 서버 이름·분 단위 시작 시각·null 장소 대체 문구·빈 주간 안내를 표시한다.
- 최초 로딩·오류를 카드 내부로 제한하고 기존 홈 바로가기·공지 영역은 유지한다. 재조회 실패 시 이전 카드와 재시도를 제공한다.
- 리뷰 후 자정 타이머를 제거했다. 지난 주 캐시로 화면에 진입하거나 복귀하면 refetchOnMount/refetchOnWindowFocus에서 새 주를 조회한다. 화면을 켜둔 상태에서는 시간 경과만으로 요청하지 않는다.
- 실서비스 출석·출결 보고는 비활성화하고 준비 중 안내를 제공한다. 초기 session/attendance URL 상태·팀 세션 토글·모의 성공·유도 tooltip은 DEV+MSW에서만 활성화한다. 개발 홈의 기본값은 API 카드이며 기존 시연은 팀 세션 시연 버튼으로 진입한다.
- 홈 테스트 17개와 Stackflow 탐색 테스트를 포함해 check 통과: web lint/typecheck/test(158개) 신규 실행, 다른 패키지 Turbo 캐시. build 통과: web 신규 실행, admin/storybook 캐시. git diff --check 통과.
- 브라우저 도구의 기존 timeoutMs/화면 캡처 오류로 시각·터치·스크린 리더 검증은 미실행이다. 키보드 및 모의 성공 차단은 자동 테스트 범위에서 검증했다.
- 인증 전환의 전체 캐시 초기화·Provider 토큰 동기화와 복귀 세션 확인은 7단계 연동 검증으로 남아 있다. 복구는 이번 단계 홈 카드·모의 동작 제한·테스트 변경을 되돌리면 된다. 커밋·push·브랜치 변경은 하지 않았다.

- 추가 리뷰 반영: 홈 바텀시트 3개를 Stackflow Activity로 등록했다. 열기 push, 닫기 pop, 다음 화면 replace를 사용하며 입력은 각 시트 state에 유지한다. SEED의 useActivityZIndexBase로 시트 레이어를 맞췄다. 웹 overlay-kit 의존성·Provider·홈 정리 Effect는 제거했다.
- isReportTooltipOpen/isTeamTooltipOpen·4초 자동 닫기·전역 pointerdown 리스너를 제거했다. 앵커가 있는 안내는 SEED HelpBubble의 defaultOpen/CloseButton/외부 클릭·Escape 처리에 맡긴다. 일반 button은 ActionButton, 출결 유형은 RadioGroup으로 교체하고 수동 라디오 스타일을 제거했다.
- 탐색 테스트에서 뒤로가기·Escape 닫기, 다시 열 때 입력 초기화, 보고 완료 후 홈 복귀, 안내 시트를 업로드 화면으로 교체한 뒤 홈 복귀, 모의 API를 끈 직접 진입 차단을 검증한다. 타이머 기반 주간 테스트는 화면 복귀 시 갱신 검증으로 바꿨다.
- 리뷰 반영 최종 check 통과: web lint/typecheck/test(161개) 신규 실행, 나머지 Turbo 캐시. build 통과: web 신규 실행, 나머지 2개 캐시. git diff --check 통과. 실제 브라우저·터치·스크린 리더 검증은 기존 도구 오류로 미실행이다.

- 바텀시트 Activity 전환 검증: check 통과. web lint·typecheck·테스트 162개는 신규 실행, 다른 워크스페이스는 Turbo 캐시를 재사용했다. build 통과: web 신규 실행, 나머지 2개 캐시 재사용. 로그는 .context/sheet-check.log와 .context/sheet-build.log에 있다.
- 브라우저 화면 캡처와 실기기 Android 뒤로가기·터치·스크린 리더 확인은 미실행이다. 개발 미리보기에서 출석 코드 입력 후 뒤로가기, 재진입 시 입력 초기화, 팀 안내에서 업로드로 이동 후 뒤로가기, 보고 완료 알림을 확인해야 한다. 브랜치 분리는 사용자 요청대로 보류한다.

- 사용자 리뷰: 바텀시트 Activity 전환 후 화면 동작이 정상임을 확인받았다. 이 확인을 실기기 접근성·스크린 리더 검증으로 대체하지 않는다.

## 7단계 사전 검증 — 인증 연동 대기

- 기준: b619e6a, origin/main 9186dc6. #329는 열려 있고 bujumbura 작업 공간의 웹 인증 변경은 미커밋 상태다. 다른 작업 공간은 읽기만 했으며 복사·수정·병합하지 않았다.
- #329의 T051a는 구현됐지만 리뷰 전이고, 계정 경계 cache·화면 수명 T051b와 브리지 복구 T052–T054는 미완료다. 본 작업의 범위 조정에 따라 인증 상태 관리 구현을 중복 추가하지 않는다.
- 생성 find3Options·find4Options와 실제 ky 클라이언트에 4개 회귀 사례를 추가했다. 401 갱신 대기 중 clear 후 이전 조회가 취소되고, 새 계정으로 조회한 데이터가 늦은 갱신 결과로 덮어써지지 않는지 검증한다. 같은 세션의 새 토큰 옵션에서는 query key·캐시를 유지하고 다음 HTTP 요청이 새 토큰을 사용하는지도 검증한다.
- 이 테스트는 인증 전환이 clear를 호출하고 Provider가 새 토큰을 제공한다는 전제다. 실제 로그아웃 mutation이나 계정 전환 화면을 검증한 것으로 해석하지 않는다.

| 연동 항목                             | 현재 근거                                                         | 후속 검증                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 로그아웃·탈퇴·계정 변경의 전체 초기화 | 현재 mutations.ts는 세션 query에 setQueryData만 호출한다          | #329의 전환 지점에서 query·mutation 캐시를 모두 비운 뒤 두 화면에 이전 데이터가 없는지 확인 |
| 늦은 인증 응답·화면 이동              | #329의 작업 무효화 변경이 미커밋·리뷰 대기다                      | 이전 로그인·가입·갱신 결과가 로그아웃/계정 변경을 되돌리지 않는지 확인                      |
| 401 이후 Provider 토큰 동기화         | native-auth-client.ts는 갱신 토큰을 해당 요청 재시도에만 사용한다 | 공통 인증 결과 반영 지점에 연결한 뒤 다음 홈·일정 요청이 갱신 토큰을 쓰는지 확인            |
| 앱 복귀 확인 순서                     | 세션 query staleTime은 Infinity이고 복귀 확인 경계가 없다         | #329의 복구 경계에서 확인 전 조회 차단·동일 세션 조회 재개·실패 안내를 확인                 |

T034·T035는 완료 처리하지 않는다. 실제 WebView·서버·접근성 검증 T036도 대기다.
이번 변경은 테스트·문서만 되돌리면 복구되며 런타임 인증 동작은 바꾸지 않는다.

- 검증 결과: node --run check 통과. web lint·typecheck·테스트 166개 신규 실행, 다른 워크스페이스는 Turbo 캐시 재사용. 로그: .context/session-integration-check.log. git diff --check 통과. 테스트·문서만 변경하여 build는 재실행하지 않았다. 최초 검사에서 테스트의 Promise.withResolvers 지원 범위와 생성 queryOptions의 서로 다른 응답 타입 합성 오류를 확인하고, 기존 Promise 생성자와 조회별 타입 추론을 유지하는 테스트 사례로 수정했다.
- 이번 변경 122줄, origin/main 대비 누적 3,639줄(추가·삭제 합계, 바이너리 별도)이다. 요청대로 브랜치 분리는 보류했고 커밋·push는 하지 않았다.

## main 병합 후 인증 조회 연동 — 2026-11-06

- 사용자 승인에 따라 origin/main bba7ca3b를 7f2b8e5로 병합했다. 시작 HEAD는 50dfa2d다. 재작성·브랜치 변경·push 없이 기존 커밋을 보존했고 main이 HEAD의 조상임을 확인했다.
- 공유 QueryClient·인증 복구·계정별 화면 경계와 기존 retry:false·apiOptions·홈 조회를 함께 보존했다. 시트의 Stackflow 2 import와 initialHistory를 맞췄고 테스트는 전환 완료 후 뒤로가기를 실행하도록 수정했다.
- 병합 검증: frozen-lockfile 설치, check, build, Expo Doctor 20/20 통과. check의 web lint·typecheck·203개 테스트 신규 실행, 다른 워크스페이스는 캐시 재사용. build는 admin·web 신규 실행, Storybook 캐시 재사용. 기록: .context/main-integration-{install,check,build,doctor}.log.
- HTTP 401 갱신을 main의 readAuthSession에 연결했다. 인증 작업 세대·취소·tokenVersion 검사를 통과한 같은 세션 토큰을 native 세션 query에 저장해 Provider와 다음 요청이 새 토큰을 사용한다. 확정 SIGNED_OUT은 기존 계정 경계로 조회 데이터를 정리하고 로그인 상태를 갱신한다. 일시 오류와 다른 계정 응답은 기존 세션을 덮어쓰지 않는다.
- 신규 session-queries.test.ts는 실제 인증 MutationObserver와 생성 find3Options·find4Options·ky·MSW를 함께 실행한다. 갱신 토큰 미반영 회귀는 수정 전 실패, 수정 후 통과했다. 로그아웃·탈퇴·계정 전환의 조회 cache 정리와 늦은 401 결과 차단, 새 토큰 후속 요청, 일시 실패·다른 계정 응답 보존을 검증한다.
- 계정 경계는 main 정책을 따른다. 모든 업무 query와 업무 mutation은 제거하고, 인증 제어 query 및 진행 중 인증 mutation은 lifecycle을 위해 유지한다. 이를 문자 그대로 queryClient.clear()로 전체 항목을 제거한 것으로 보고하지 않는다.
- 새 시트 3개의 로그아웃 직접 진입을 실제 Stackflow 가드로 검증한다. 기존 main의 로그인·가입·탈퇴·화면 초기화 회귀도 유지했다.
- T034·T035의 복귀 검증은 미완료다. main의 SIGNED_IN 세션 query는 staleTime Infinity이고, 일반 복귀·BFCache에서 세션 확인을 선행시켜 두 업무 query를 재개하는 흐름은 아직 없다. 실패 복구 polling을 이 흐름의 구현으로 간주하지 않는다. 다음 리뷰 단위는 이 복귀 순서의 연결과 검증이다.
- 실기기 native/서버·BFCache·VoiceOver/TalkBack·터치는 미실행이며 자동 테스트로 대체하지 않는다. 복구 시 main 병합은 보존하고 후속 native-auth-client/session 연동 변경만 되돌린다.
- 최종 후속 검증: check 통과(web lint·typecheck·213개 테스트 신규 실행, 다른 워크스페이스 캐시 재사용). build 통과(web 신규 실행, admin·Storybook 캐시 재사용). build 이후 변경은 테스트·문서뿐이다. 로그: .context/auth-integration-check.log, .context/auth-integration-build.log. git diff --check 통과.
- 후속 변경은 245줄이며 origin/main 대비 누적 3,826줄(신규 테스트 포함, 바이너리 별도)이다. 브랜치 분리는 사용자 요청대로 보류했다. main 병합만 커밋했으며 후속 연동 변경은 미커밋이다.

## 복귀 재조회 단순화와 상단 safe area — 2026-11-06

- 직전 토큰 연동은 c7ba556으로 커밋했다. 이후 작성 중이던 복귀 Effect·gate Promise·flushSync·수동 query 취소는 사용자 리뷰에 따라 제거했다.
- 업무 조회는 기존 QueryClient의 mount/focus/reconnect 기본값을 유지한다. native의 확정 세션만 focus에서 always로 재확인한다. 인증 진행·가입 대기·미지원 예외 및 진행 요청 공유를 테스트했다. native single-flight를 중복 구현하지 않는다. 이전 기록의 선행 확인 대기는 이 리뷰로 범위에서 제외한다.
- SEED AppScreen 공식 문서 https://seed-design.io/react/stackflow/app-screen 에 따라 공통 ActivityScreen을 분리하고 layerOffsetTop을 safeArea로 변경했다. 기존 화면별 헤더를 유지하고, 상태바 높이만 차지하는 AppBar가 스크롤 내용 위에 놓인다.
- IntersectionObserver의 root는 실제 AppScreenContent이며 scrollTop 시작점을 관찰한다. 맨 위 transparent, 스크롤 시 layer로 변경하고 이전 Activity·unmount 시 observer를 해제한다. 밝은 화면에 불필요한 그라디언트는 끈다.
- safe-area 전달 브리지·native 설정은 변경하지 않았다. viewport-fit=cover와 native contentInsetAdjustmentBehavior=never가 이미 설정돼 있음을 확인했다. 공용 packages/ui는 변경하지 않았으므로 Storybook 변경은 비대상이다.
- 부팅된 iPhone 15 Pro 시뮬레이터의 기존 화면에서 상태바와 로고 겹침을 확인했다(.context/safe-area-simulator.png). 해당 화면은 현재 로컬 수정본과 다르므로 수정 후 시뮬레이터 검증으로 보고하지 않는다. Chrome에서 localhost:3000의 수정본 렌더링을 확인했다. 브라우저 탭 제어는 timeoutMs 오류가 있어 native Chrome 접근성 경로를 사용했다.
- 검증: check 통과, web lint·typecheck·217개 테스트 신규 실행·다른 워크스페이스 캐시 재사용. build 통과, web 신규 실행·다른 2개 캐시 재사용. 로그 .context/focus-safe-area-{check,build}.log. 타입 검사 중 가입 대기 fixture를 생성 브리지 계약의 expiresAt으로 수정했다. git diff --check 통과.
- 수정본 WebView에서 상단 inset, 스크롤 왕복 tone, 가로 회전, VoiceOver·터치를 확인해야 한다. UI 코드를 되돌리면 기존 상단 배치로 복구된다. 커밋·push는 하지 않았고 브랜치 분리는 보류한다.

## 상단 tone·당김 배경 리뷰 — 2026-11-07

- Safari 시뮬레이터에서 일시 진단 표시로 AppBar 높이 0px, 당김 중 scrollTop -37px를 확인했다. Safari의 safe area가 0인 상태에서는 상태바 전용 AppBar의 tone 변화가 보이지 않는다. Safari 바깥의 상태바를 WebView 검증 근거로 사용하지 않는다. 진단 표시는 제거했다.
- 시작점이 관찰 영역 위로 올라갔는지로 tone을 판단한다. 아래로 당기는 바운스는 transparent를 유지하며, 아래쪽 콘텐츠로 스크롤할 때만 layer가 된다.
- 홈의 layerBasement와 다른 탭의 layerDefault를 ActivityScreen 배경·스크롤 영역·AppBar에 함께 전달한다. 당길 때 노출되는 바탕과 화면 상단의 색을 일치시킨다.
- 회귀 테스트에 당김 방향과 탭 배경 전환을 추가했다. check 통과: web 217개 테스트 신규 실행, 최종 실행의 lint·typecheck 및 다른 워크스페이스는 캐시 재사용(이 수정의 앞선 check에서 web lint·typecheck 신규 실행). build 통과: web 신규 실행, admin·Storybook 캐시 재사용. 로그: .context/tone-fix-{check,build}.log.
- 수정 후 시뮬레이터에서 진단 표시 제거와 렌더링을 확인했다. 입력 도구 오류로 수정 후 당김·스크롤 왕복을 직접 재현하지 못했으며, 실제 WebView에서의 육안 검증은 남아 있다. 커밋하지 않았다.

## 복귀 시 계정 경계 통합 검증 — 2026-11-07

- 22ddbad(복귀 인증 조회), f35d5a0(safe area·tone·배경), 415ad96(검증 기록)으로 앞선 작업을 커밋했다. push와 브랜치 분리는 하지 않았다.
- T034의 자동 검증에 실제 nativeSessionQueryOptions·focusManager와 생성 홈/일정 query를 함께 사용한 복귀 계정 전환 사례를 추가했다. 이전 계정 홈 요청의 401 갱신이 진행 중일 때 복귀 확인으로 다른 계정이 확정되면 홈·일정 cache와 업무 mutation이 제거되고, 늦게 완료한 이전 갱신이 새 인증 결과를 덮지 않음을 검증한다.
- quickstart의 직렬 복귀 조회·전체 clear 설명을 확정된 동시 조회·업무 cache 경계 정책으로 정정했다. T035 완료와 실제 WebView·BFCache 미완료를 구분했다.
- 검증: 대상 파일 8개 테스트 통과 후 전체 check 통과(web lint·typecheck·218개 테스트 신규 실행, 다른 워크스페이스 캐시 재사용). 로그 .context/resume-integration-{test,check}.log. 앱 실행 코드 변경이 없어 build는 재실행하지 않았으며 직전 tone-fix-build의 성공 결과를 유지한다.
- 실제 WebView 오프라인 복구·계정 전환·VoiceOver/TalkBack·당김·스크롤 육안 검증은 여전히 남아 있다. 테스트 대역을 실환경 검증으로 보고하지 않는다. 이번 변경은 테스트·문서만 포함하며 런타임 롤백 대상은 없다.
- origin/main 대비 전체 변경량은 약 4,200줄로 PR 상한을 초과한다. 사용자가 앞서 요청한 대로 브랜치 분리는 보류하고, PR 작성 전에 독립 단위로 분리한다. 이번 통합 검증 변경은 리뷰 전이므로 커밋하지 않았다.

## 네트워크 복구·키보드 재시도 검증 — 2026-11-07

- 홈·일정 화면 테스트가 실제 createAppQueryClient 설정을 사용하도록 맞췄다. 네트워크 오류(HttpResponse.error) 후 기존 내용을 유지하고, offline→online 복구 시 최신 응답으로 교체하면서 오류 안내를 제거하는 사례를 각각 추가했다. 실제 기기의 네트워크 차단이 아닌 MSW·onlineManager 기반 자동 검증이다.
- 홈의 최초 오류 재시도 테스트를 Tab으로 버튼에 진입한 뒤 Enter로 실행하도록 변경했다. 일정의 기존 키보드 재시도·로딩 상태 안내·목록 접근성 이름 검증도 함께 통과했다. VoiceOver/TalkBack 직접 검증을 대신하지 않는다.
- iPhone 15 Pro / iOS 17.5 Safari에서 DEV+MSW 일정 오류·정상 목록을 육안 확인했다. 오류 그래픽·설명·다시 시도 버튼이 화면에 표시된다. 근거: .context/member-sessions-evidence/schedule-error-safari.png. 확인 후 정상 /schedule로 복원했다. 앱 WebView 증거로 사용하지 않는다.
- check 통과: web lint·typecheck·220개 테스트 신규 실행, 다른 워크스페이스 캐시 재사용. 로그 .context/offline-accessibility-check.log. 테스트·문서 변경만 있어 build·expo:doctor는 재실행하지 않았다. git diff --check 통과.
- T027의 시각 근거는 보완했지만 실기기 접근성은 남아 있다. T033·T034·T036의 실제 WebView·계정 전환·네트워크·터치·스크린 리더 검증도 미완료로 유지한다. 누적 변경 약 4,240줄, 브랜치 분리 보류·미커밋 상태다.
