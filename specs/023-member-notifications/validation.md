# 1단계 검증 기록

- 작성일: 2026-11-10. 실제 브랜치: `DongjaJ/android`.
- 승인된 main 반영: `7bd77d09` → `d8dfd4862bb2f739bba8bdc8d022304f5ce305cd`, fast-forward 완료.
- 기준 origin/main도 같은 SHA다. 브랜치 생성·전환·이름 변경·commit·push·PR·이슈 생성은 하지 않았다.
- 범위: Spec Kit 문서·이슈 초안. 제품 코드·의존성 선언·lockfile 변경은 없다.
- `.specify/feature.json`은 gitignored 로컬 포인터이며 023-member-notifications로 설정했다.
- setup-plan의 BRANCH 출력은 feature 이름을 추론한 값이다. 실제 git 브랜치는 변경하지 않았다.

## 수행한 검증

| 항목                            | 결과·실행 구분                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------- |
| main·작업 트리 확인             | 새 실행: fetch·fast-forward·HEAD 대조, 기존 사용자 변경 없음                     |
| Firebase 최신 안정 버전         | 새 조회: app/messaging/installations 모두 27.1.0; 설치 직전 재확인 정책          |
| 이슈 검색                       | 새 조회: 열린 알림/notification 전용 이슈 없음; #385·#178은 별도 범위            |
| Spec Kit 설정·템플릿            | 새 실행: spec-template 해석, setup-plan, setup-tasks, check-prerequisites 통과   |
| 전후 hooks                      | extensions.yml 없음: specify/plan/tasks hooks 해당 없음                          |
| 문서 포맷                       | 새 실행: 신규 문서 oxfmt 및 루트 format:check 통과                               |
| lint                            | Turbo 캐시 재사용: 7/7 성공                                                      |
| typecheck                       | Turbo 캐시 재사용: 7/7 성공                                                      |
| test                            | Turbo 캐시 재사용: 5/5 성공; 146개 파일·1,297개 테스트 로그, 이번 신규 실행 아님 |
| node --run check                | 통과; 세 하위 Turbo 작업의 결과는 위 캐시 구분을 따른다                          |
| 문서 링크·placeholder·작업 번호 | 새 실행: 내부 링크 유효, 미치환 템플릿 없음, T001~T042 연속·경로 포함            |
| 기본 diff 공백 검사             | 새 실행: git diff --check 통과; 신규 파일은 별도 포맷·줄 수 검사                 |

고정 pnpm 실행 시 기존 lockfile의 로컬 의존성이 캐시에서 복원되었다. 새 패키지를 추가하거나
버전을 바꾸지 않았다. check 로그는 gitignored `.context/notifications-stage1-check.log`에 있다.

## 계약 교차 검토

백엔드 조사 에이전트가 문서를 읽기 전용으로 검토했다. 성공 상태·FID/FCM·payload 식별자·날짜/커서는
일치한다. 이전 refresh token의 revoke 204 무동작 위험을 plan·계약·Q06·T027에 반영했다.
이는 이미 합의한 단계 5의 실행 순서를 구체화한 것이며 별도 기능 범위 추가가 아니다.

## 미실행과 남은 위험

- build·expo:doctor·iOS 빌드: 문서만 변경한 단계이므로 미실행. 제품 구현 단계에서 필수 항목을 실행한다.
- 실제 회원 API·기기 PUT/DELETE·푸시 발송·TestFlight·VoiceOver: 미실행. 단위 캐시 통과로 대체하지 않는다.
- Firebase iOS·APNs·서버 환경 연결은 아직 준비되지 않았다. 실제 수신 가능성을 확인하지 않았다.
- GitHub 이슈 [#417](https://github.com/YAPP-admin/yapp-plus-frontend/issues/417)을 생성했고 사용자가 1단계 검토와 다음 진행을 승인했다.

## 변경량과 리뷰

기준은 origin/main `d8dfd486`이다. 신규 문서 10개 전체를 포함해 추가 569줄·삭제 0줄이다. 합계 650줄 미만으로 1단계 분리는 필요 없다.
main fast-forward로 들어온 기존 48개 파일은 이번 알림 변경량에 중복 합산하지 않는다.
리뷰 대상: 범위·로그아웃 합의·최신 버전 정책·기기/계정 수명·단계별 검증과 외부 준비 조건.

# 2단계 검증 기록

- 범위: `find3InfiniteOptions` 기반 알림함 query 모델과 개발/테스트용 MSW 핸들러다. 알림함 UI·Stackflow
  탐색·Firebase·의존성은 변경하지 않았다. ID·postId는 백엔드 OpenAPI와 생성 SDK 계약을 신뢰한다.
- 계정 경계: query는 기존 QueryClient의 `AbortSignal`을 그대로 생성 SDK에 전달한다. 확정된
  계정 변경 시 기존 `applyAccountBoundary`가 모든 업무 query를 취소·제거하므로, 별도 계정 상태나
  중복 취소기를 추가하지 않았다.

## 수행한 검증

| 항목               | 결과·실행 구분                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| alerts query 회귀  | 새 실행: 웹 Vitest 57개 파일·415개 테스트 통과. 날짜, cursor 생략/null 종료, 401/503의 마지막 성공 목록 보존을 포함한다. |
| 웹 typecheck       | 새 실행: `pnpm --filter @yapp-plus/web typecheck` 통과.                                                                  |
| 포맷·공백          | 새 실행: 변경 파일 oxfmt 통과 및 `git diff --check` 통과.                                                                |
| `node --run check` | 통과: web lint·typecheck·test는 새 실행, 나머지 작업은 Turbo 캐시 재사용이다.                                            |

## 미실행과 남은 위험

- 화면·빌드 설정을 아직 바꾸지 않아 build는 3단계 화면 연결에서 실행한다.
- 실제 인증 토큰을 동반한 401 갱신·계정 전환 취소는 기존 인증 계층의 회귀 범위이며, 알림 query는
  그 취소 신호를 재구현하지 않는다. 실제 회원 API는 아직 검증하지 않았다.

## 변경량과 리뷰

기준은 origin/main `d8dfd486`이다. 2단계 변경량은 추가 199줄·삭제 11줄(합계 210줄)이며 650줄
미만이다. 다음 단계는 실제 알림함 UI와 Stackflow 탐색 연결이며, 이 단계의 리뷰 승인 전에는
시작하지 않는다.

# 3단계 검증 기록

- 범위: 시연용 알림 배열과 `showEmpty` URL 상태를 제거하고, 실제 알림 목록·초기 오류 재시도·빈 상태·
  무한 조회·POST 공지 상세 이동을 연결했다. GENERAL 및 postId 없는 POST는 이동 요소가 아니다.
- 접근성: 목록은 `ul`/`li`와 `알림 목록` 이름을 제공한다. 상세로 이동하는 항목만 링크 접근성 이름을
  제공하며, 일반 알림은 링크가 아니다. 로딩·추가 로딩·초기 오류는 각각 상태 이름 또는 alert를 제공한다.
- SEED UI 정비: 목록을 `List.Root`·`List.Item`·`List.Content`·`List.Title`·`List.Detail`로 구성했다.
  공지 링크는 `List.Content asChild`로 렌더링해 SEED의 키보드 focus와 터치 pressed 피드백을 사용한다.
  화면 전용 색상·타이포그래피·간격은 `@seed-design/css/vars`의 공개 토큰으로 바꿨다. 피그마 고정 치수인
  헤더 높이와 빈 상태 일러스트 크기는 그대로 유지한다.
- 브라우저 육안 확인은 개발 서버를 `http://localhost:5175`에 열었지만, 자동화 브라우저가 새 로컬 탭을
  만들지 못해 실행하지 못했다. 단위·통합 테스트의 DOM 접근성 검증으로 대체하지 않으며, 실제 브라우저
  확인은 다음 UI 검토에서 다시 수행한다.

## 수행한 검증

| 항목                     | 결과·실행 구분                                                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 알림 화면·Stackflow 회귀 | 새 실행: 웹 Vitest 57개 파일·418개 테스트 통과. 목록, 빈 상태, 초기 오류 재시도, 추가 조회, GENERAL/POST 링크, `?empty=true` 무시를 포함한다.                                |
| 웹 typecheck             | 새 실행: `pnpm --filter @yapp-plus/web typecheck` 통과.                                                                                                                      |
| build                    | 통과: web build는 새 실행, admin·storybook build는 Turbo 캐시 재사용이다. web bundle의 기존 500 kB 초과 경고는 실패가 아니다.                                                |
| `node --run check`       | 통과: web lint·typecheck·test는 새 실행, 나머지 작업은 Turbo 캐시 재사용이다.                                                                                                |
| SEED List·토큰 전환 회귀 | 새 실행: 웹 Vitest 57개 파일·418개 테스트, `node --run check`, `node --run build` 모두 통과. web lint·typecheck·test·build만 새 실행이고, 다른 작업은 Turbo 캐시 재사용이다. |

## 변경량과 리뷰

기준은 3단계 시작 시점의 `HEAD`다. 새 `alerts-list-boundary.tsx`를 포함한 3단계 변경량은
추가 327줄·삭제 121줄(합계 448줄)이며 650줄
미만이다. 다음 단계는 Firebase 기반 단계 4-A이며, 이 단계 리뷰 승인 전에는 시작하지 않는다.
