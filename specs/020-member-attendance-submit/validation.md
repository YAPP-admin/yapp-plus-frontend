# 1단계 검증: 코드 출석

먼저 구조 수정 전 결과를 기록하고, 마지막 절에 Suspense·Form·생성 키 적용 후 결과를 정리했다.

- 이슈: [#385](https://github.com/YAPP-admin/yapp-plus-frontend/issues/385). 사전 출결 보고는 리뷰 후 별도로 구현한다.
- Android 기준은 `develop`의 `2b837e3c`이며 2026-11-08 KST 커밋을 제외했다. 심사 빌드의 SHA는 확인되지 않았다.
- 회귀 검증: 구현 전 홈 테스트 4개 실패, 구현 후 통과했다.
- `mise exec -- node --run check`: 통과. 웹 lint·typecheck·테스트 314개를 새로 실행했다. 다른 패키지 lint 6개·typecheck 6개·test 4개 작업은 Turbo 캐시를 사용했다. 포맷 검사는 새로 실행했다.
- `mise exec -- node --run build`: 통과. 웹 빌드는 새로 실행했고 admin·storybook 2개 작업은 캐시를 사용했다. 웹 500 kB 청크 경고는 남아 있다.
- 입력·붙여넣기·Enter·오류 접근성 속성, 실제 요청 본문·인증, 실패 응답·401·응답 유실, 중복·오프라인·대상 변경·계정 변경·화면 이탈을 MSW/Vitest로 검증했다.
- 실제 브라우저 자동화는 연결 오류로 실행하지 못했다. 화면 캡처·VoiceOver·iOS 키패드/터치·safe-area·실서버 출석은 미검증이다. 실제 화면과 인증 만료 후 네이티브 토큰 갱신은 테스트 계정으로 추가 확인해야 한다.
- 완료 표시는 계정별 메모리 상태이므로 앱을 다시 시작하면 사라진다. 성공 후 조회 실패가 서버 출석을 취소하지는 않는다.
- 변경량: `origin/main`과의 merge-base `0ec55581` 대비 새 파일 포함 추가 759줄·삭제 38줄, 합계 797줄이다.
- 650줄에서 분리를 검토했다. 코드 출석까지 첫 리뷰 단위로 제한하고 사전 보고는 후속 PR로 분리한다. 커밋·푸시·PR 생성은 수행하지 않았다.
- 복구: 이 단계의 화면·API 연결을 되돌려 출석 버튼을 준비 중으로 복원한다. 이미 기록된 서버 출석은 삭제하지 않는다.
- 리뷰 반영: 제출 훅의 AbortController·useRef를 제거하고 mutation 상태·완료 콜백으로 대체했다. 화면 숨김 회귀를 추가했다. `confirmationOptions`를 제거하고 생성된 `verifyMutation` 성공 결과로 완료 상태를 관리한다. 화면 이탈 후 같은 계정의 성공 보존·계정 변경 격리·앱 재시작 초기화를 확인했다.

## 구조 수정 후 검증 및 로컬 분리

- `useSuspenseQuery`·인증 경계·Suspense/ErrorBoundary와 TanStack Form의 코드 필드·제출 후 수정 검증을 적용했다. 생성 `verifyMutationKey`에 계정 범위를 덧붙이며 수동 작업 식별 키를 제거했다.
- `mutationKeys: true`로 동일 OpenAPI 입력을 재생성했다. 설정과 생성 키·공개 export만 변경되며 SDK·조회 옵션·응답 계약 변경은 없다. API lint·typecheck를 새로 실행해 통과했다.
- 최종 `node --run check`: 통과. 포맷, 웹·관리자 lint, API·웹·관리자·모바일 typecheck, 웹 316개·관리자 658개·모바일 150개 테스트를 새로 실행했다. lint 5개·typecheck 3개·test 2개 작업은 Turbo 캐시를 사용했다. 첫 검사에서 발견한 lint 오류는 수정 후 재검증했다.
- 최종 `node --run build`: 통과. 웹은 새로 빌드했고 관리자·Storybook은 캐시를 사용했다. 관리자는 이번 작업의 직전 빌드에서도 새로 실행해 통과했다. 500 kB 청크 경고는 남아 있다.
- 최초 조회 대기·실패·재시도와 네 자리 Form 검증의 제출/수정 시점을 추가했다. 출석 인접 테스트 15개와 기존 계정 변경·화면 숨김·중복 제출 회귀가 통과했다.
- 브라우저 도구가 탭 생성 시 `Cannot read properties of undefined (reading 'timeoutMs')`로 실패했다. 화면 캡처·VoiceOver·실기기 키패드/터치·실서버 검증은 수행하지 못했다.
- 로컬 분리: `origin/main` → `DongjaJ/attendance-spec`(252줄) → `DongjaJ/attendance-api-keys`(252줄) → 기존 `DongjaJ/7al70`(추가 673줄·삭제 98줄, 합계 771줄). 각 화살표는 PR base/head를 나타낸다. 명세 PR의 merge-base는 `0ec55581`이며 최신 main의 공지 변경은 합치지 않았다. push·PR 생성은 하지 않는다.
- 완료 Activity의 접근 차단, 홈 성공 상태 공유, 제출 중 닫기·`useIsMutating`, 서버 오류별 복구 UI 제안은 보류했다. 사전 출결 보고는 첫 단계 리뷰 후 진행한다.
- 최신 리뷰 반영: 제출은 Activity의 `mutation.isPending`과 TanStack Form으로 관리하고 시트 닫기를 차단했다. 전역 pending 조회·닫힘 감시 Effect·초기 세션 ID state·출석 전용 계정 검사를 제거했다. `check`·`build` 통과: 웹 lint·typecheck·316개 테스트·빌드는 새 실행, 나머지 lint 6개·typecheck 6개·test 4개·build 2개 작업은 캐시 재사용이다. 실기기·실서버 검증은 미실행이며 홈 성공 결과 공유 방식은 후속 결정한다. 생성 키 브랜치 대비 추가 695줄·삭제 104줄, 합계 799줄이고 이번 수정은 아직 커밋·push하지 않았다.
- 조회 경계 리뷰 반영: QueryBoundary를 분리해 출석 시트·홈 카드에 적용했고 mutateAsync를 mutate로 바꿨다. 시트의 로그인 상태 중복 검사를 제거하되 일반 브라우저 제한은 유지한다. 웹 316개 테스트를 포함한 check와 build가 통과했고 웹 작업만 새로 실행했다. 이 추가 리팩터링은 800줄 제한에 따라 출석 PR 이후의 별도 리뷰 단위로 준비하며 아직 커밋·push하지 않는다.
- 제출 책임 리뷰 반영: 제출 직전 fetchQuery·세션 재검사·토큰 재조회는 제거하고 POST의 404·409 판정에 맡겼다. onSuccess는 조회 갱신, 제출 성공 콜백은 화면 이동, mutation.error는 오류 표시를 담당한다. onMutate에는 오프라인 차단과 홈 완료 표시용 대상 ID 전달만 남겼다. 최종 작업 트리의 check·build 통과: 웹 lint·typecheck·317개 테스트·빌드를 새로 실행했고 다른 작업은 캐시를 재사용했다. 실기기·실서버 검증과 커밋·push는 수행하지 않았다.
