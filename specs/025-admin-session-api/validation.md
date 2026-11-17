# 단계별 검증 기록

## 1단계 — 문서·이슈

- 기준: 2026-11-17, `origin/main`·HEAD `3420a854`, 브랜치 `DongjaJ/session-management-api-plan`.
- 시작 시 작업 트리는 깨끗했고 `git fetch origin` 후에도 base와 차이가 없었다.
- 이슈: [#462](https://github.com/YAPP-admin/yapp-plus-frontend/issues/462), OPEN, 담당자 DongjaJ.
  승인된 제목·본문으로 생성하고 재조회했다. GitHub 연결 도구의 403 이후 로컬 CLI로 생성했다.
- 문서 범위: 명세·계획·조사·모델·계약·실행 안내·작업 목록·품질 체크리스트·이 기록.
- Spec Kit: 별도 extension hook 없음. 기존 템플릿을 사용하고 현재 기능 경로만 로컬
  `.specify/feature.json`에 기록했다. Git 브랜치는 생성·전환·변경하지 않았다.
- 계약 대조: 생성 DTO와 폼의 유형별 장소 검증, 저장/재조회 분리, 삭제 상태, 출석 mock 분리를 읽기 전용 검토했다.
- 사용자 리뷰 반영: 기본 online 네트워크 모드를 유지하고, UI 변경은 `mutate` 콜백으로 연결한다. 과도한 ID 방어와 이전 데이터 보완 대응은 제외했다.
- 문서 링크·작업 형식: 9개 문서의 상대 링크·미해결 표시·43개 작업 ID와 경로 검증 통과.
  US1 6개·US2 9개·US3 5개·US4 6개, 공통·검토 17개다. 문서 작업 T001~004만 완료했다.
- Spec Kit prerequisite 검사 통과. 문서만 추가하며 제품·생성 코드·lockfile 변경은 없다.
- 변경량은 origin/main 대비 미추적 새 문서까지 포함해 9개 파일 +584/-0줄이다. 650줄 미만으로 이번 단계 분리는 필요 없다. 최종 문서 포맷·공백 검사도 통과했다.
- `node --run check`: 통과. format:check는 새 실행, lint 7/7·typecheck 7/7·test 5/5는
  모두 Turbo 캐시 재사용이다. 캐시 로그의 테스트 통과 수를 이번 신규 실행으로 보고하지 않는다.
- 실행 환경: mise 설정 경로를 해당 명령에서만 신뢰하도록 지정했다. 고정 pnpm이 로컬 store에서
  의존성을 준비했으며 다운로드·lockfile 변경은 없었다. 영구 mise 설정은 변경하지 않았다.
- `node --run build`: 미실행. 이번 단계는 문서만 변경해 실행 대상이 아니다.
- UI·브라우저·실서버: 미실행. 제품 코드가 아직 연결되지 않았다.
- 사용자 리뷰: 사용자 요청 “커밋하고 다음 진행해”로 1단계 리뷰와 2단계 진행을 확인했다.

## 2단계 — 공통 경계

- 기수 설정: `VITE_ADMIN_GENERATION_ID`를 숫자로만 변환하고, 누락·비숫자 값은 `null`로 반환한다.
  양수·정수·안전 정수 같은 추가 ID 방어는 두지 않았다.
- 조회 모델: `session-api-model.ts`에서 생성 `zAdminSessionResponse` 위에 REGULAR의 장소 필수와
  TEAM의 장소 전체 `null` 제약을 추가했다. 초 단위 시간은 원본 그대로 보존하고, 출석 시작 여부와
  API 집계를 화면 ViewModel에 옮긴다.
- 역할 분리: `session-form.ts`는 API 연결용 폼 입력 Zod를, `session-api-model.ts`는 API 응답↔ViewModel·
  API 요청 변환을 소유한다. 기존 모의 저장용 폼 흐름은 다음 폼 단계에서 교체한다.
- 입력 모델: 정규 세션은 도로명주소·좌표와 선택 상세주소를, 팀 세션은 장소 입력 없이 모든 장소 필드를
  `null`로 변환한다. `toCreateSessionRequest`가 폼 Zod를 다시 적용해 trim·유형별 제약을 보장한다.
- 오류 모델: `ApiError`의 HTTP 상태와 생성 `zErrorResponse`로 검증된 세션 코드만 UI와 분리된
  도메인 실패 코드로 바꾼다. 응답 원문·서버 메시지는 노출하지 않으며, UI 안내 문구는 화면 연결 단계에서
  해당 실패 코드를 기준으로 정한다.
- 테스트: 최초 실행에서 빈 기수 설정이 0으로 변환되는 문제와 변환 전 trim 누락을 확인했고 수정 후
  `pnpm --filter @yapp-plus/admin test -- session-config.test.ts session-api-model.test.ts session-error.test.ts`가
  74 파일·671 테스트 통과했다. Vitest의 파일 인자는 전체 admin 테스트를 실행했다.
- 품질 게이트: `node --run format`, `node --run check`, `node --run build`를 실행해 통과했다.
  check에서 admin lint·typecheck·test는 새 실행이고 나머지 6개 패키지는 Turbo 캐시 재사용이다.
  build에서 admin은 새 실행, web·storybook은 Turbo 캐시 재사용이며 API·bridge·UI·mobile에는 build 작업이 없다.
- UI·브라우저·실서버: 이 단계는 UI 연결 전이므로 미실행이다. 실제 기수 ID와 실서버 CRUD 검증은 후속이다.
- 사용자 리뷰: 공통 경계의 역할 분리·Faker 사용·오류 코드 계약을 반영한 뒤 사용자가 커밋과
  3단계 진행을 승인했다. 커밋 `309fcace`로 완료했다.

## 3단계 — 목록 API 연결

- 조회: 생성 `find1Options`를 별도 래퍼 없이 직접 사용해 설정된 기수와 `type=ALL`로 조회한다.
  Query의 기본 `online` 네트워크 모드와 생성 key·signal 전달을 유지했다.
- 화면: API 응답을 정규·팀 식별 유니언 ViewModel로 변환하고 초 단위 원본 시간은 보존한 채
  카드에는 시·분만 표시한다. 정규 장소는 주소를, 팀 장소는 입력 없이 `팀별 자율 장소`를 표시한다.
- 미연결 액션: 생성·수정 API 연결 전까지 세션 추가 버튼과 카드 수정 메뉴를 노출하지 않는다.
- 설정: 라우트가 공개 페이지 진입점의 `getSessionGenerationId`를 사용한다. 설정 누락 시 요청하지
  않고 기수 ID 설정 안내를 표시한다.
- 테스트: 생성 Faker 기반 응답과 MSW로 `/generations/25/sessions?type=ALL`, Bearer 인증 헤더,
  정상·빈 목록·404 후 재시도, 필터·정렬·설정 누락 무요청을 검증했다. 어드민 전체 74개 파일·
  657개 테스트가 통과했다.
- 품질 게이트: `node --run check`와 `node --run build` 통과. check에서 admin·api·web·mobile의
  변경 영향 작업은 새 실행되었고 app-bridge·ui·storybook 일부 작업은 Turbo 캐시를 재사용했다.
  build는 admin·web 새 실행, storybook 캐시 재사용으로 통과했다.
- UI·브라우저·실서버: MSW 합성 데이터의 DOM·키보드 필터·오류 재시도만 확인했다. 실제 브라우저
  화면 캡처와 실서버 검증은 실제 기수 ID 확보 후 후속으로 남긴다.
- 변경량: 3단계는 HEAD 대비 14개 파일 +316/-594줄이다. 기존 모의 CRUD 통합 테스트를 API 목록
  책임 테스트로 교체해 삭제가 커졌고 합계 910줄이다. 누적 origin/main 대비 1,908줄이므로 PR 생성
  전에는 독립적으로 검토 가능한 단계별 PR 분리가 필요하다.
- 사용자 리뷰: 사용자가 목록 테스트 교체·검증·커밋과 다음 단계 진행을 승인했다. 커밋
  `b1f91ba8`로 완료했고 T018을 확정했다.

## 4단계 — 공통 폼 준비

- 입력 모델: 기존 메모리 저장용 `CreateSessionInput` 의존을 제거하고 정규 장소 유무가 유형으로
  결정되는 `SessionInput`을 폼 계약으로 사용한다. 팀 세션은 장소 속성 자체를 제출하지 않으며
  API 변환 단계에서 다섯 장소 필드가 `null`이 된다.
- 시간: 폼에는 시·분만 표시한다. 수정 세션의 시·분이 바뀌지 않으면 조회의 초·소수부 원본을
  보존하고, 생성 또는 바뀐 시간은 `HH:mm:00`으로 만든 뒤 최종 시작·종료 순서를 검증한다.
- 장소: 정규 세션만 주소 검색·상세주소·지도를 표시한다. 도로명주소와 상세주소는 각각 255자,
  위도·경도 `0`은 유효하다. 정규→팀→정규 왕복 중 정규 장소 초안은 폼 수명 동안 유지한다.
- 폼 연결: 주소·좌표까지 TanStack Form 값으로 옮기고 Zod Standard Schema를 `onDynamic`에 직접
  연결했다. 수동 필드 오류 변환 함수는 제거했으며 제출 경계에서 같은 스키마의 transform 결과를
  사용한다. 범용 fieldset·legend도 제거하고 각 필드의 기존 label을 유지했다.
- 좌표 조회: 주소 선택·재시도 이벤트에서 `useMutation().mutate()`로 직접 실행하고 호출별 성공
  콜백에서 폼 좌표를 갱신한다. `useEffect`와 `queryClient.fetchQuery()`는 사용하지 않으며 연속 선택과
  폼 종료 뒤의 늦은 응답은 Mutation observer의 호출별 콜백 수명으로 격리한다.
- 구성: `session-form.tsx`에는 TanStack Form 상태·검증·제출 조정만 남겼다. 다이얼로그 셸은
  `session-form-dialog.tsx`, 이름·유형·주소·상세주소·좌표 화면은 `session-form-fields.tsx`의 제어형
  컴포넌트로 분리하고 본문은 children으로 조합한다.
- 화면·접근성: 팀 장소 안내 입력을 제거하고 이름을 필수로 표시했다. 오류는 최초 렌더가 아닌
  blur·제출 뒤에 표시하는 기존 동적 검증 흐름을 유지한다. 상세주소에는 `maxlength=255`와
  연결된 오류 문구를 제공한다.
- 정리: 아직 화면에 연결되지 않은 기존 모의 생성·수정 래퍼 `session-dialogs.tsx`를 제거했다.
  실제 생성·수정 다이얼로그는 각각 5·6단계에서 SDK Mutation으로 다시 연결한다.
- 테스트: 정규 필수 장소, 팀 무입력, 유형 왕복, 주소별 255자, 좌표 0, 저장 좌표 복원, 같은 분의
  초 단위 시간 보존, 변경 시간의 00초, 주소 조회 경합·장애·닫힌 폼의 늦은 응답을 검증했다.
  어드민 전체 74개 파일·661개 테스트가 통과했다.
- 품질 게이트: 최초 check에서 새 테스트의 불필요한 `async`에 lint 1건이 실패해 제거했다. 리뷰
  수정까지 반영한 `node --run check`와 `node --run build`가 통과했다. 최종 check는 admin이
  새 실행이고 나머지 패키지는 Turbo 캐시를 재사용했다. build는 admin 새 실행, web·storybook
  캐시 재사용으로 통과했다.
- UI·브라우저·실서버: 저장 액션을 아직 노출하지 않는 준비 단계라 브라우저 화면 캡처와 실서버
  저장은 미실행이다. 실제 폼 컴포넌트의 키보드 제출·취소·Escape·오류 DOM은 테스트로 확인했다.
- 변경량: 4단계는 HEAD 대비 14개 파일 +717/-472줄, 합계 1,189줄이다. 누적 origin/main 대비는
  +1,967/-1,096줄이므로 PR 생성 전에는 이미 기록한 단계별 분리가 필요하다.
- 사용자 리뷰: 대기. 리뷰 전에는 T022를 완료하거나 5단계 생성 연결을 시작하지 않는다.

## 5~8단계와 후속 조건

아직 착수하지 않았다. 각 단계에 새 실행·Turbo 캐시·실패·미실행·화면 근거·실제 base 대비
추가/삭제 줄 수와 리뷰 결과를 추가한다. 실제 기수 ID와 최신 서버 계약 확인, 실서버 테스트
데이터 생성·수정·삭제 검증은 후속이며 완료로 간주하지 않는다.
