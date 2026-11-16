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

# 4-A 단계 검증 기록

- 범위: React Native Firebase `app`·`messaging`·`installations` 27.1.1과 Expo iOS config plugin만
  추가했다. 자동 등록·권한 요청·수신 리스너·설정 UI는 아직 연결하지 않았다.
- Firebase 서비스 파일은 `FIREBASE_IOS_GOOGLE_SERVICES_FILE` EAS file 환경 변수로만 공급하며,
  저장소와 빌드 산출물에서 제외했다. TestFlight config는 파일 값이 없으면 즉시 실패한다.
- app version은 native 변경에 맞춰 1.0.2에서 1.0.3으로 올렸다. `appVersion` runtime policy에 따라
  새 native build가 필요하다.

## 수행한 검증

| 항목               | 결과·실행 구분                                                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Firebase 버전      | 새 조회: app/messaging/installations 최신 안정 버전은 모두 27.1.1이며 서로 같은 peer 버전이다.                                                                             |
| Expo config        | 새 실행: 일반·TestFlight(임시 파일) config에서 static frameworks, APNs environment, service file 경로와 1.0.3을 확인했다. 파일 누락 TestFlight config는 의도대로 실패한다. |
| `expo:doctor`      | 새 실행: 20/20 통과.                                                                                                                                                       |
| 모바일 typecheck   | 새 실행: mobile·api·app-bridge 3개 작업 통과.                                                                                                                              |
| build              | 새 실행: web·admin·storybook build 3/3 통과.                                                                                                                               |
| `node --run check` | 포맷·lint는 새 실행으로 통과했다. typecheck는 기존 `@yapp-plus/ui`의 React ref 타입 충돌로 실패했으며, 모바일 변경에서 발생한 오류는 아니다.                               |
| diff 공백          | 새 실행: `git diff --check` 통과.                                                                                                                                          |

## 미실행과 남은 위험

- Firebase 프로젝트 설정 파일·APNs 인증 키가 제공되지 않아 iOS prebuild/EAS build·실기기 수신은 실행하지 않았다.
- 실제 iOS build는 Apple 서명과 Firebase 외부 설정이 필요한 별도 운영 작업이다. 현재 단계에서는
  `expo config` 검증으로만 config plugin 계약을 확인했다.

## 변경량과 리뷰

4-A 변경량은 추가 880줄·삭제 2줄(합계 882줄)이다. Firebase 세 패키지가 Firebase JavaScript
전이 의존성을 함께 lockfile에 기록해 lockfile만 791줄이며, 안전하게 더 나눌 수 없는 최소 변경이다.
PR 800줄 제한을 초과하므로 commit·PR 전에 사용자와 분리 전략을 확인해야 한다. 다음 단계는 4-B
기기 선택·등록 조율이며, 이 단계의 리뷰 승인 전에는 시작하지 않는다.

# 4-B 단계 검증 기록

- 범위: Firebase project·FID별 알림 선택 SecureStore, 생성 OpenAPI의 기기 등록/해제 어댑터,
  등록 직렬화와 세션 경계 처리만 추가했다. Firebase SDK 호출, 권한 요청, 앱 시작 연결과 브리지/UI는
  다음 단계 범위다.
- 등록은 204만 성공으로 판정하고 401일 때 최신 access token으로 한 번만 재시도한다. 같은
  세션·FID·FCM token의 PUT은 생략하지만 OFF의 DELETE는 매번 보낸다. 저장 실패는 이전 선택의
  서버 상태를 다시 맞추며, 늦은 응답은 세션 경계 뒤 캐시에 반영하지 않는다.

## 수행한 검증

| 항목               | 결과·실행 구분                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 알림 단위 테스트   | 새 실행: storage·registration·notification-api를 포함한 mobile Vitest 12 파일·174 테스트 통과.                                                                      |
| 모바일 typecheck   | 새 실행: `pnpm --filter @yapp-plus/mobile typecheck` 통과.                                                                                                          |
| `node --run check` | 포맷과 lint는 통과했다. mobile typecheck는 새 실행으로 통과했으나, 기존 `@yapp-plus/ui` React ref 타입 충돌로 전체 typecheck가 실패해 Turbo test는 실행되지 않았다. |
| `node --run build` | Turbo build 3개(web·admin·storybook) 모두 캐시 재사용으로 통과했다. mobile은 build 작업을 정의하지 않는다.                                                          |
| diff 공백          | 새 실행: `git diff --check` 통과.                                                                                                                                   |

## 미실행과 남은 위험

- Firebase/권한/앱 수명 연결은 4-C에서 추가한다. 따라서 이 단계만으로는 실제 기기 등록이나 해제가 발생하지 않는다.
- Firebase 설정 파일·APNs 인증 키가 아직 제공되지 않아 iOS prebuild/EAS build와 실기기 수신은 미실행이다.

## 변경량과 리뷰

새 알림 저장·등록 코드와 테스트는 추가 635줄이다. 검증 기록·작업 목록을 더한 4-B 리뷰 단위는
650줄 검토 기준을 넘지만, 저장·API·조율과 각 회귀 테스트가 하나의 상태 전이를 함께 검증하므로
추가 분리하면 검토 가능성이 낮아진다. 다만 아직 작업 트리에 남은 4-A(882줄)와 합치면 PR 제한을
초과하므로 둘은 별도 PR로 분리해야 한다. commit·PR을 만들기 전 사용자 승인과 분리 방법 확인이
필요하다. 다음 단계는 4-C 런타임 연결이며, 이 단계 리뷰 승인 전에는 시작하지 않는다.

# 4-C — 인증·FCM·권한 수명 연결 (2026-11-12)

사용자가 React 타입 수정의 단일 커밋과 다음 단계 진행을 승인했다. React catalog 통일은
`ea78c0d7`로 커밋했으며 아래 4-C 변경은 아직 커밋하지 않았다. 사용자 리뷰 대기 상태다.

- 루트 effect에서 Firebase가 구성된 iOS 앱만 시작하고 리스너를 정리한다. 인증 확정·복원,
  FCM 토큰 변경·active 복귀에서 동기화한다. 토큰 갱신 알림만으로 다시 동기화하지 않아 순환을 막는다.
- ON·허용은 PUT, OFF·권한 차단은 DELETE한다. OS 차단이 저장 선택을 덮지 않으며,
  미결정 권한만 인증 후 요청한다. 자동 동기화 오류는 인증 결과로 전파하지 않는다.
- 요청의 userId/sessionId/tokenVersion으로 기존 SessionManager.refresh를 호출한다.
  동시 브리지/알림 401은 한 갱신을 공유하고, 늦은 이전 버전의 401은 최신 세션을 재사용한다.
  다른 계정·세션 또는 더 오래된 갱신 결과와 종료된 런타임 작업은 폐기한다.
- 손상된 설정은 삭제 대신 OFF로 복구해 연속 조회에서도 기본 ON으로 바뀌지 않게 했다.
- 기존 static 설정을 계획 및 [Firebase v27 요구사항](https://rnfirebase.io/migrating-to-v27)에
  맞게 dynamic으로 수정했다. 권한 API는 v27에서 deprecated이지만 현재 지원되는 기존 API를
  사용하며 추가 권한 패키지는 도입하지 않았다.

## 검증과 남은 확인

- `node --run check`: 통과. mobile lint/typecheck/test는 새 실행, 나머지 lint/typecheck 각 6개와
  test 4개는 캐시 재사용. 인증 재시도 분리 후 mobile 14파일 199테스트 통과. 포맷은 새 실행으로 통과했다.
- `node --run build`: web/admin/storybook 3개 모두 캐시 재사용으로 통과. iOS 빌드가 아니다.
- `node --run expo:doctor`: 새 실행 19/20 통과. 기존 Expo 패키지 12개 패치 버전 불일치가 남았다.
- Firebase 서비스 파일·APNs 설정을 사용한 네이티브 빌드와 실기기 권한/수신은 미실행이다.
  Firebase 13 SPM과 기존 Google Sign-In의 실제 네이티브 의존성 해결도 빌드에서 확인해야 한다.
- 복구는 루트의 알림 시작 연결을 제거한 검증 빌드로 수행한다. 서버에 이미 등록된 기기와
  발송 정책은 별도로 해제해야 하며 단순 코드 복구가 서버 데이터를 지우지는 않는다.
- 4-C는 단일 동기화 흐름과 회귀를 함께 검토한다. 기존 누적 브랜치는 main 대비 PR 제한을
  초과하므로 PR 구성은 별도 분리가 필요하다. 다음 5단계 로그아웃 정책은 구현하지 않았다.

## 리뷰 반영 — 동기화 책임 통합

런타임의 별도 큐·설정 조회·권한 요청 이력을 제거했다. 런타임은 인증·설치 정보를 준비하고
이벤트를 조율기에 전달한다. 조율기의 단일 큐가 설정 조회 한 번 → 권한 확인/요청 → 토큰 조회 →
서버 반영 → 수동 변경이면 저장을 처리한다. 자동 동기화와 수동 선택 변경도 같은 경로를 사용한다.
동시 이벤트의 권한 요청 직렬화와 OFF 저장 직후 자동 동기화가 최신 선택을 읽는 회귀를 추가했다.
4-C 누적 변경은 800줄을 넘어, PR 작성 시 설정 손상 복구·네이티브 설정 수정 등 독립 수정과
런타임 연결을 별도로 구성해야 한다. 이번 리뷰에서는 커밋·PR을 추가하지 않았다.

세션별 권한 요청 이력도 제거했다. ON이고 OS 권한이 미결정일 때 요청하며, 실패 후 다음
동기화에서 재시도할 수 있다. 같은 세션에서 권한 요청 실패 → 앱 복귀 → 요청 성공 회귀는
수정 전 실패를 확인했다. 권한 조회·요청은 기존 단일 큐 안에서 실행해 동시 호출을 막는다.

## 리뷰 반영 — 해제와 갱신 실패 처리

- DELETE 시작 시 등록 캐시를 지운다. 서버에서 삭제 후 응답이 유실돼도 다음 ON 동기화에서
  같은 토큰의 PUT을 생략하지 않는다. OFF와 OS 권한 차단은 같은 해제 함수를 사용한다.
- OFF는 권한 SDK를 조회하지 않고 바로 해제한다. 권한 조회 실패가 OFF 처리를 막지 않는다.
- 인증 갱신의 NETWORK/TIMEOUT은 NETWORK, 서버/응답 오류는 SERVER, 저장소 오류는 STORAGE로
  전달한다. 취소는 CANCELLED, 로그아웃 등 인증이 필요한 결과는 AUTH_REQUIRED로 구분한다.
- 캐시·OFF 회귀와 갱신 실패 결과 테스트를 추가했다. 수정 전 8개 실패를 확인했고,
  수정 후 전체 check가 통과했다. build 3개는 캐시 재사용이며 네이티브 실기기 검증은 여전히 남았다.

## 리뷰 반영 — 인증 요청 소유와 로그인 수명

401 재시도·세션 유효성·갱신 오류 변환은 auth/authenticated-request.ts로 옮겼다.
알림 API 어댑터는 생성 SDK 요청과 204/409 등 HTTP 업무 응답 변환을 맡는다.
기기 등록 이벤트 연결부는 registration-sync.ts의 startNotificationRegistrationSync,
운영 연결은 native-registration-sync.ts의 startNativeNotificationRegistrationSync로 명명했다.
푸시 수신·탭 이동은 이 연결부의 책임에 포함하지 않는다.

Android 기본 브랜치 855e111을 다시 확인했다. PushRegistration은 storageKey로 요청 수명과
등록 캐시를 구분하며 Tokens는 새 로그인에서 UUID를 만들고 갱신 시 같은 키를 유지한다.
RefreshCoordinator는 같은 sessionId에서만 갱신 결과를 반환하고, ApiHttpClientFactory의
공통 interceptor가 401을 한 번 재시도한다. iOS도 계정별 알림 소유와 로그인 수명 검사를
구분한다. 같은 계정 재로그인 중 이전 401 폐기 회귀를 추가했고, 세션 검사는 유지했다.

## 5단계 — 서버 성공 후 로그아웃 (사용자 리뷰 대기)

2026-11-12 사용자의 현재 변경 커밋·다음 단계 진행 요청에 따라 T027~T030을 구현했다.
4-C는 fccddd51, 별도 설정 수정은 170d0053, 저장값 복구는 8f1a3bd7로 커밋했다.
React 통일은 main 기반 Draft PR #429로 분리했고, 그 PR만 lockfile 포함 크기 예외를 승인받았다.
Conductor 기본 폴더는 React PR 브랜치이며, 이번 단계는 .context/notification-followup의
DongjaJ/android worktree에 미커밋 상태로 보존했다. 6단계는 시작하지 않았다.

- SessionManager가 진행 중 서버 요청을 추적한다. 로그아웃 시작 후 새 요청·일반 갱신·로그인·탈퇴는
  보류하고, 이미 시작한 등록의 401 복구는 허용한다. 등록 요청과 진행 중 갱신을 마친 뒤 최신
  refresh token을 읽는다. 중복 로그아웃은 같은 작업을 공유한다.
- revoke 어댑터는 204만 성공으로 인정한다. 400/401/503·전송 실패는 로그인 상태를 유지하며
  종료 보류를 해제해 재시도할 수 있다. 별도 기기 DELETE는 추가하지 않았다.
- 메모리 복원 전에는 저장된 자격을 읽어 서버 해제를 먼저 확인한다. 대기 중 갱신이 세션 만료를
  확정했다면 SIGNED_OUT을 전달하며, 새 세션이 확정된 경우에는 이전 종료 응답을 폐기한다.
- 서버 성공 후 로컬 삭제 실패는 메모리 자격을 무효화하고 기존 삭제 재시도 경로로 복구한다.
  웹의 서버 실패는 로그인·업무 cache를 유지하고, 로컬 삭제 실패는 STORAGE 결과로 복구 화면에
  연결한다. 진행 상태는 React Query mutation이 소유한다.
- 새 worktree 검증에서 발견한 Firebase 설정 환경 변수의 무검증 trim 호출도 기존 웹 URL 설정과
  동일한 typeof 검사로 수정했다.

검증: 전체 check 통과. 모바일 207개와 웹 426개 테스트를 이번 작업에서 새로 실행했다.
최종 check에서는 모바일 lint·typecheck·테스트를 새로 실행하고, 다른 lint/typecheck 6개씩과
테스트 4개는 캐시를 재사용했다. build는 웹을 새로 실행하고 관리자·Storybook 2개는 캐시를
재사용했다. format·diff 검사도 통과했다. expo:doctor는 기존 Expo 패치 불일치 12개로 19/20이다.
이 결과는 최신 main 기반 React PR의 expo:doctor 20/20과 구분한다.

실기기·실제 서버 로그아웃·네이티브 빌드는 실행하지 않았다. 응답 유실은 서버에서 이미 처리됐을
가능성이 있으므로 다음 인증 조회의 기존 만료 확인 경로를 따른다. 이 변경을 되돌릴 때는 native
종료 정책과 웹 cache 정책을 함께 복구해 서로 다른 로그아웃 정책이 섞이지 않게 한다.
변경 범위는 4-C 커밋 fccddd51 대비 +419/-100, 합계 519줄이며, 누적 알림 브랜치 전체를
하나의 PR로 게시하지 않는다. 5단계는 사용자 리뷰 대기이며 아직 커밋하지 않았다.

## 6-A단계 — 설정 브리지·네이티브 연결 (사용자 리뷰 대기)

사용자의 다음 작업 진행 요청으로 5단계 다음 구현을 시작했다. 설정 브리지와 화면은 각각
독립적으로 검토하도록 6-A/T031~~T032, 6-B/T033~~T035로 분리했다. 기존 5단계 변경은
별도 patch로 보존했으며 이번 단계에서도 commit·push·PR 작업은 수행하지 않았다.

- 설정 조회는 저장된 선택과 상세 OS 권한을 구분하고 권한 팝업이나 기기 등록을 시작하지 않는다.
- 수동 ON에서 권한이 거부되면 PERMISSION_REQUIRED를 반환하고 이전 선택을 유지한다.
  권한 전용 요청은 자동 동기화와 같은 큐를 사용하지만 선택·서버 등록은 변경하지 않는다.
- 웹 공개 진입점은 브라우저·구버전 앱을 UNSUPPORTED로 처리하고 Zod로 응답을 검증한다.
  입력 boolean 검증, 계약 외 토큰 필드 제거, 전송 실패·잘못된 응답 구분을 테스트했다.
- 네이티브는 기존 조율기·인증 요청 경계를 재사용한다. 로그아웃 중 요청은 BUSY이며
  다른 로그인 수명으로 바뀐 뒤 도착한 서버 응답은 저장하지 않는다.

check 통과: 모바일·웹 lint 새 실행, 나머지 5개 캐시. app-bridge·모바일·웹 typecheck 새 실행,
나머지 4개 캐시. app-bridge 71개·모바일 215개·웹 426개 테스트 새 실행, 관리자·UI 테스트는
캐시를 재사용했다. 새 회귀는 브리지 10개·네이티브 8개다. build는 웹 새 실행,
관리자·Storybook 2개 캐시로 통과했다. format·diff 검사 통과.

설정·의존성 변경이 없어 expo:doctor는 이번 단계에서 재실행하지 않았다. 이 브랜치의 기존
결과는 Expo 패치 불일치로 19/20이며 실기기 권한 팝업·실제 서버·네이티브 빌드는 미검증이다.
Modern Web Guidance 1.0.0의 switch·accessibility 가이드를 조회했으나 이번 단위에는 웹 UI를
변경하지 않아 새 UI 패턴을 적용하지 않았다. 웹 설정 화면은 6-B에서 연결한다.

복구는 이 단계의 브리지 계약·네이티브 연결·웹 도우미를 함께 되돌린다. 저장 키·데이터 형식은
변경하지 않았으며, 기존 네이티브 앱에는 웹 지원 여부 확인을 유지한다. 5단계와 이번 단계를
하나의 PR로 합치지 않고 각각의 검증된 목적에 따라 분리한다.

## 단계 5·6-A 커밋 분리와 6-B 설정 화면 (2026-11-12)

- 사용자 승인에 따라 기존 변경을 목적별로 분리했다.
  - `b23656a6`: 서버 해제 성공 후 로그아웃 처리, 12파일 +419/-100(519줄).
  - `36da09ff`: 네이티브 알림 설정 브리지와 흐름 문서, 14파일 +649/-13(662줄).
  - 각 커밋의 format/lint/commitlint hook 통과. push하지 않았다.
- 6-B는 웹 설정 화면만 변경한다. 임시 `useState(true)`를 제거하고 설정 Query·Mutation으로
  저장값/권한·실패 재시도·시스템 설정 열기·화면 활성화 및 focus 재조회를 연결했다.
- 사용자 피드백으로 미지원 환경의 최신 앱 안내 문구를 제거했다. 스위치 비활성은 유지한다.
  명세·계약·계획·quickstart에도 같은 정책을 반영했다.
- [변경 전후 흐름](./implementation-flow.md)에 단계 5, 6-A, 6-B의 비교와 Mermaid를 기록했다.
- 설정 테스트 16개: 기존 페이지 9개 + 새 경계/UI 7개. 미지원 문구 없음, 조회 재시도,
  변경 실패 후 같은 선택 재시도, 키보드 입력/중복 방지, 권한과 저장 선택 분리,
  앱 focus/화면 복귀, 계정 경계 이후 늦은 응답 폐기를 확인한다.
- 빌드: 웹 새 실행 성공, admin/storybook 2개는 Turbo 캐시 재사용.
  기존 500kB chunk 경고는 남아 있다. 로그: `.context/notification-6b-build.log`.
- 브라우저에서 문구 제거 전 설정 화면과 미지원 스위치 비활성을 확인했다. 문구 제거 후에는
  사용자 브라우저 조작과 겹쳐 캡처를 중단했다. 이전 캡처는 최종 화면 근거로 사용하지 않는다.
- 실제 iOS 권한 팝업·설정 복귀·터치·VoiceOver·APNs/FCM은 미검증이다.
  모바일 설정/의존성 변경이 없어 이번 6-B에서 expo:doctor는 재실행하지 않았다.
- 6-B는 커밋 전 사용자 리뷰 상태다. T035의 최종 화면 캡처·실기기 확인은 남겨 둔다.
  다음 단계 7(수신·탭 이동)은 시작하지 않았다.
- 최종 `mise exec -- node --run check` 통과: 웹 lint/typecheck/test 새 실행(58파일 433테스트),
  나머지 lint 6개/typecheck 6개/test 4개는 Turbo 캐시 재사용.
  로그: `.context/notification-6b-check.log`. `git diff --check` 통과.
- 6-B 변경량은 직전 6-A 커밋 대비 신규 파일·문서를 포함해 463줄이다.
  origin/main 대비 누적 변경은 별도 PR 분리가 필요하며 커밋 분리만으로 크기 예외를 적용하지 않는다.

## 6-B 리뷰 반영: 설정 실행 훅 분리 (2026-11-16)

- `useOpenAppSettingsMutation`을 분리하고 설정 실행 성공 시 ON/OFF mutation을 reset하던
  연결을 제거했다. 조회·변경 조율은 `useNotificationSettings`에 유지한다.
- 권한 안내는 최신 조회 결과를 사용한다. 과거 PERMISSION_REQUIRED가 권한 허용 후에도
  거부 안내를 유지하지 않으며, 설정 실행만으로 저장된 선택이나 변경 실패를 지우지 않는다.
- 해당 흐름 회귀 1개 추가. `node --run check` 통과: 웹 lint/typecheck와 434테스트 새 실행,
  나머지 lint 6개/typecheck 6개/test 4개는 Turbo 캐시 재사용.
- `node --run build` 통과: 웹 새 실행, admin/storybook 2개 캐시 재사용.
  기존 chunk 크기 경고 유지. `git diff --check` 통과.
- 실기기 OS 설정·권한 복귀는 이번에도 미검증이다. 커밋·push는 하지 않았다.

## 6-B 커밋·7-A 푸시 대상과 대기 모델 (2026-11-16)

- 사용자 승인으로 6-B를 `99966c72`에 커밋했다(+513/-34, 547줄).
  format/lint/commitlint hook 통과. push하지 않았다.
- 단계 7은 변경량과 책임에 따라 7-A 모델/스키마, 7-B 네이티브 수명/브리지,
  7-C 웹 탐색/목록 갱신으로 나눴다. 이번 리뷰는 7-A다.
- payload는 source=POST와 안전한 양의 정수 문자열 postId만 공지 대상으로 사용한다.
  나머지는 ALERTS로 제한하고 본문·URL을 브리지 대상으로 전달하지 않는다.
- POST 발송 ID·일반 알림 ID·FCM messageId 순서로 종류에 맞게 중복을 구분한다.
  수신/탭 이력은 별개이고 최신 탭 한 건만 대기한다. 오래된 ack·반복 ack는 새 대기를 지우지 않는다.
- `clearPendingNotificationOpen()`의 계정 경계 호출, 실제 SDK 리스너·AppBridgeState·웹 이동은 아직 연결하지 않았다.
  이 모델 추가만으로 실제 푸시 수신이나 탭 이동이 작동하지 않는다.
- 최종 `node --run check` 통과: app-bridge 78개/mobile 238개/web 434개 테스트 새 실행,
  admin/UI 테스트 2개 작업은 캐시 재사용. lint/typecheck는 app-bridge/mobile/web 새 실행,
  나머지 각 4개 작업은 캐시 재사용. 로그: `.context/notification-7a-final-check.log`.
- `node --run build` 통과: 웹 새 실행, admin/storybook 2개 캐시 재사용.
  기존 chunk 크기 경고 유지. 로그: `.context/notification-7a-build.log`.
- `git diff --check` 통과. 모바일 설정/의존성 변경이 없어 expo:doctor는 재실행하지 않았다.
  실기기 APNs/FCM·콜드 스타트는 미검증이며 7-B/7-C 이후 통합 검증한다.
- 7-A는 직전 커밋 대비 342줄이며 미커밋 리뷰 상태다. 공개 스키마는 추가만 했고 아직 운영
  소비자가 없어 복구 시 7-A 추가 파일/스키마를 함께 되돌릴 수 있다.

## 7-A 리뷰 반영: 역할 이름·Zod 입력 경계

- PushNotificationState와 recordReceivedPush/setPendingNotificationOpen 등으로 상태·행동 이름을 명확히 했다.
- parsePushTarget의 수동 객체/필드 검사와 대상 재검증을 제거했다. 모바일 내부 스키마에서
  한 번 파싱하고 대상 선택·발송 ID 우선순위만 계산한다. 잘못된 공지 ID와 유효한 발송 ID가
  함께 온 경우의 회귀를 추가했다. 기존 Zod catalog 4.5.4를 모바일 직접 의존성으로 선언했다.
- 최종 check 통과: 모바일 lint/typecheck 및 239테스트 새 실행, 다른 작업은 캐시 재사용.
  build 3개 작업은 모두 캐시 재사용. diff 검사 통과.
- expo:doctor는 19/20 통과. 기존 Expo 계열 12개 패키지 버전 불일치가 남아 있으며 이번 범위에서
  업그레이드하지 않았다. 실기기 검증·커밋·push는 하지 않았다.
- 로그: `.context/notification-schema-check.log`, `.context/notification-schema-build.log`,
  `.context/notification-schema-doctor.log`.

## 등록 조율 Mutex 통일

- NotificationRegistration의 pending Promise/enqueue를 제거하고 기존 p-mutex의
  registrationMutex.withLock으로 자동 동기화·선택 변경·권한 요청을 직렬화했다.
- 선택 조회·서버 반영·저장·저장 실패 복구까지 같은 잠금을 사용하며 세션 검사·등록 캐시는 유지한다.
- 권한 요청 예외 뒤에도 대기 중인 OFF 변경이 저장까지 완료되는 회귀 테스트를 추가했다.
- check 통과: 모바일 lint/typecheck 및 240테스트 새 실행, 나머지는 캐시 재사용.
  build는 3개 작업 모두 캐시 재사용. diff 검사 통과. 의존성 변경은 없다.
- 실기기 검증·커밋·push는 하지 않았다. 로그는 `.context/notification-mutex-check.log`와
  `.context/notification-mutex-build.log`에 남겼다.

## 등록 실패 복구·세션 경계 캐시 정리

- 설정 변경 실패/예외 시 원래 잠금을 해제하고 저장된 최신 선택으로 한 번 재동기화한다.
  복구도 실패하면 캐시를 비운 채 종료하고 원래 오류를 유지한다. 중첩 잠금·재귀 재시도는 없다.
- 저장 실패만 별도로 복구하던 경로를 같은 복구 처리로 통합했고 불필요해진 force 인자를 제거했다.
- 세션 종료·교체 구독과 세션 없는 런타임 시작에서 캐시를 명시적으로 비운다.
  별도 서버 DELETE는 추가하지 않았다. 복구 전 세션이 바뀌었다면 이전 계정 요청은 보내지 않는다.
- 응답 유실 후 OFF 복구, 복구 실패 후 다음 동기화, 서버 예외 보존, 세션 변경 시 복구 폐기,
  세션 종료 캐시 초기화의 회귀 5개를 추가했다.
- check 통과: 모바일 lint/typecheck 및 245테스트 새 실행, 나머지는 캐시 재사용.
  build 3개 작업 모두 캐시 재사용. git diff --check 통과.
- 실기기 검증·커밋·push는 하지 않았다. 로그: `.context/notification-reconcile-final-check.log`,
  `.context/notification-reconcile-build.log`.

## 푸시 계약 용어·이벤트 메서드 이름 정리

- revision 주석을 목록 갱신 번호로 명확히 하고 destination의 웹 이동 역할을 설명했다.
- 이동 대상은 notificationDestinationTypeSchema.enum을 사용한다. 서버 source는 POST만
  명시하고, source 없는 일반 알림의 notificationId 처리 회귀를 추가했다.
- 브리지 상태 조회·최신 탭 대기 설정·처리 확인·대기 폐기·새 발송 기록의 메서드 이름을
  역할에 맞게 통일했다. 기존 소비 테스트와 문서를 함께 갱신했다.
- check 통과: app-bridge 78/mobile 246/web 434테스트와 해당 lint/typecheck 새 실행,
  다른 검사 작업은 캐시 재사용. build는 웹 새 실행, admin/storybook 캐시 재사용.
- 실기기 검증·커밋·push는 하지 않았다. git diff --check 통과.
  로그: `.context/notification-contract-check.log`, `.context/notification-contract-build.log`.

## 2026-11-16 iOS 시뮬레이터 검증과 설정 안내 정리

- iPhone 15 / iOS 17.5에 Firebase 개발 프로젝트 `yappplus-dev`를 포함한 앱 1.0.3을
  새로 빌드·설치했다. Bundle ID는 `org.yapp.yappplus`이다. 설정 파일은 저장소 밖의
  `~/.config/yapp-plus/firebase/dev/GoogleService-Info.plist`에서 환경 변수로 공급했다.
- 최초 서명 없는 빌드는 Keychain 권한 오류를 일으켰다. 시뮬레이터용 ad-hoc 서명으로
  다시 빌드해 세션 복구와 Google 로그인 성공을 확인했다. 제품 인증 코드는 변경하지 않았다.
- 웹 조회는 `http://127.0.0.1:3000`의 CORS 사전 요청이 403으로 거절됐다.
  허용된 `http://localhost:3000`은 200이었다. Metro 실행에
  `REACT_NATIVE_PACKAGER_HOSTNAME=localhost`를 지정한 뒤 홈 세션·공지 조회가 정상화됐다.
- 좌표 클릭 자동화 오류 때문에 사용자가 설정 이동과 토글을 조작하고 에이전트가 화면·로그를
  확인했다. 설정 조회, ON에서 OFF 변경 완료, 화면 재진입 후 OFF 유지가 확인됐다.
- OFF에서 ON으로 변경하면 `getToken`이 `messaging/unregistered`로 실패했다.
  설치된 RNFirebase 27.1.1 소스는 ARM64 Simulator에서 UIKit의 APNs 등록을 생략한다.
  ON 성공으로 처리하지 않고 OFF를 유지하며 오류·재시도 버튼을 표시하는 동작을 확인했다.
  재시도도 같은 SDK 제한에 막혔다. 최종 저장 선택은 OFF이다.
- OS 권한 팝업·거부·설정 이동/복귀, 실기기 ON 등록 성공, 실제 FCM 발송·수신은 미검증이다.
  푸시 SDK 수신/탭 연결과 웹 탐색은 아직 7-B/7-C 구현 범위이므로 완료로 간주하지 않는다.
- 모바일 246개, app-bridge 78개, 웹 설정 17개 테스트를 캐시 없이 새로 실행해 통과했다.
  로그는 `.context/notification-simulator-{mobile,bridge,settings}-tests.log`에 있다.
- 화면 근거는 `.context/notification-settings-off-verified.png`와
  `.context/notification-settings-on-failure-verified.png`이다. 이 스크린샷은 아래 문구 정리 전
  화면이며 저장소에 포함하지 않는다. 임시 진단 코드는 모두 제거했다.
- 사용자 리뷰 후 평상시·조회 중·저장 중 설명을 제거했다. 변경 실패는
  “변경하지 못했어요. 다시 시도해 주세요.”로 줄였다. 최초 조회 실패의 다시 불러오기,
  권한 차단 안내·시스템 설정 열기는 유지한다. 설명이 없으면 aria-describedby도 생략한다.
  문구 정리 후 화면 캡처는 도구의 ScreenCaptureKit 오류로 수행하지 못했다.
- 문구 정리 후 전체 check 재실행 통과: 웹 435개 테스트 새 실행, 나머지 테스트는 Turbo 캐시
  재사용. 최초 check의 웹 lint/typecheck는 새 실행 후 통과했고 재실행에서는 캐시를 재사용했다.
  최초 전체 실행에서 기존 공지 상세 연속 클릭 테스트가 1회 실패했으나, 해당 파일 12개 단독
  테스트와 전체 재실행이 통과했다. 이 테스트의 50ms 응답 지연 의존성은 별도 개선 여지로 남긴다.
- build 통과: 웹 빌드 새 실행, admin/storybook 캐시 재사용. 기존 청크 크기 경고는 유지한다.
  로그: `.context/notification-final-commit-check.log`,
  `.context/notification-final-commit-check-retry.log`, `.context/notification-notice-recheck.log`,
  `.context/notification-final-commit-build.log`. 이번 문구 변경에는 모바일 설정·의존성 변경이 없어
  expo:doctor를 추가 실행하지 않았다. 앞선 zod 추가 시 doctor의 기존 Expo 패치 불일치 12건은
  여전히 미해결이며 의존성 일괄 업그레이드는 이번 범위에서 제외했다.

## 2026-11-16 7-B — Firebase 수신·탭과 브리지 연결

- 루트 effect에 수신·탭 런타임을 연결했다. onMessage는 revision만 갱신하고,
  onNotificationOpenedApp/getInitialNotification은 기존 인증 복원 성공 후 최신 탭을 보관한다.
  로그아웃·계정 교체 중 완료된 요청은 폐기하며 같은 세션의 토큰 갱신은 대기를 유지한다.
- 실제 브리지 초기값과 ack RPC를 연결했다. 잘못된 입력·오래된 eventId는 최신 대기를
  지우지 않는다. 인증 구현과 웹 화면 이동 코드는 변경하지 않았다.
- check 통과: 모바일 256개(신규 10개), app-bridge 78개, 웹 435개 테스트 새 실행.
  admin 658개와 UI 10개 테스트는 Turbo 캐시 재사용. 모바일·웹 lint와
  모바일·웹·app-bridge typecheck는 새 실행, 나머지는 캐시 재사용이다.
  최초 lint 실패는 중괄호·mock 타입·Promise 반환 규칙 등을 수정한 후 해소했다.
- build 통과: 웹 새 실행, admin/storybook 캐시 재사용.
- firebase.json에 iOS 포그라운드 banner/list를 설정하고 ad-hoc 서명으로 iPhone 15 대상
  xcodebuild를 새 실행해 성공했다. 빌드 로그에서 Info.plist의 firebase_json_raw에
  해당 옵션이 포함된 것을 확인했다. 새 빌드를 설치하거나 실제 배너를 확인한 것은 아니다.
- expo:doctor는 20개 중 19개 통과했다. 기존 Expo 패치 버전 불일치 12건은 그대로이며,
  이번 단계에서 의존성을 변경하지 않았다.
- ARM64 시뮬레이터의 messaging/unregistered 제한 때문에 실제 FCM 등록·수신·탭은
  실기기 검증에 남긴다. SDK 콜백을 대체한 회귀 테스트가 실제 APNs 전달을 검증하지는 않는다.
  웹 이동·ack 호출·목록 갱신 소비자는 다음 7-C 범위다.
- 로그: .context/notification-7b-check-retry.log, .context/notification-7b-build.log,
  .context/notification-7b-doctor.log, .context/notification-7b-native-build.log.
  커밋·push·PR은 수행하지 않았다.

### 7-B 리뷰 — 런타임 처리 함수 분리

- 익명 구독 콜백을 세션 변경·수신·탭 처리 함수로 분리하고, 초기 알림 조회 재사용과 결과
  소비를 분리했다. 구독 연결·정리는 함수 하단에 모았다. 변경되는 값 네 개는 기존 수명
  범위의 let으로 유지했으며 처리 정책과 공개 계약은 변경하지 않았다.
- check 통과: 모바일 lint·typecheck·256개 테스트 새 실행, 나머지 Turbo 작업은 캐시
  재사용. build는 세 작업 모두 캐시 재사용이다. 마지막 문서·개행 수정 후 format:check와
  git diff --check도 통과했다. 설정·의존성 변경이 없어 doctor·네이티브 빌드는 반복하지 않았다.
- 로그: .context/notification-runtime-refactor-check.log,
  .context/notification-runtime-refactor-build.log. 실기기 FCM 검증은 여전히 남아 있다.

### 7-B 리뷰 — 비동기 처리를 런타임 밖으로 추출

- acceptOpen과 consumeInitialNotification을 파일 범위 비공개 함수로 추출했다.
  현재 작업 유효성은 콜백으로 조회하므로 비동기 대기 이후에도 최신 상태를 확인한다.
  초기 조회 재사용·세션 경계·중복 처리·구독 정리 정책은 유지한다.
- check 통과: 모바일 lint·typecheck·256개 테스트 새 실행, 나머지 Turbo 작업은 캐시 재사용.
  build 세 작업은 모두 캐시 재사용이다. 문서 수정 후 format:check·diff 검사도 통과했다.
  실기기 검증과 네이티브 빌드는 반복하지 않았다. 설정·의존성 변경은 없다.
- 로그: .context/notification-runtime-extract-check.log,
  .context/notification-runtime-extract-build.log. 커밋·push는 수행하지 않았다.

## 2026-11-16 7-C — 웹 탐색·목록 갱신

- 사용자 승인으로 7-B를 37632ca0으로 커밋한 뒤 7-C를 진행했다. 이번 웹 변경은 아직
  커밋·push하지 않았다.
- Stackflow 플러그인이 로그인 완료·브리지 지원 여부를 확인하고 상태를 구독한다.
  수신은 탐색하지 않으며, 탭은 전환이 끝난 후 typed 탐색으로 처리한다. 같은 대상은
  중복 push 없이 해당 eventId만 ack한다. 로그인 경로는 기존 Tabs 복원을 기다린다.
- 실제 Stackflow를 사용하는 신규 탐색 테스트 8개로 수신/탭 구분, 인증 준비 대기,
  동일 대상·뒤로가기, 이전 ack 대기 중 새 탭, 구버전, 숨겨진 목록 stale·진입 재조회,
  잘못된 대상·로그아웃 구독 해제, 로그인 경로 콜드 스타트 부모 복원을 검증했다.
- 목록 계층의 신규 테스트 2개로 활성 화면의 즉시 재조회와 비활성 화면의 stale 보존을
  검증했다. 기존 화면 복귀 훅과 생성 SDK query key를 재사용한다.
- 최종 check 통과: 웹 lint·typecheck·445개 테스트 새 실행. 모바일 256개,
  app-bridge 78개, admin 658개, UI 10개 테스트와 나머지 Turbo 검사는 캐시 재사용.
  최초 lint의 타입 import·조건부 assertion·Promise 처리 규칙은 수정 후 통과했다.
- build 통과: 웹 새 실행, admin/storybook 캐시 재사용. 기존 청크 크기 경고는 유지된다.
  마지막 문서 변경 뒤 format:check·git diff --check를 별도 확인했다.
- 로그: .context/notification-7c-final-check.log, .context/notification-7c-final-build.log,
  .context/notification-7c-navigation.log.
- 이번 단계는 웹 연결만 변경했다. 모바일 설정·의존성이 같아 expo:doctor·iOS 빌드를
  반복하지 않았다. 실제 FCM 전달, WebView 내 수신·탭·복귀, 실기기 터치·접근성 및
  TestFlight는 미검증이다. 자동 테스트의 브리지 대체가 해당 실기기 검증을 대신하지 않는다.
  화면 스타일 변경과 새 화면 캡처는 없다. T041/T042는 미완료로 유지한다.

### 7-C 리뷰 — 목록 갱신에 useEffectEvent 적용

- usePushAlertsRefresh로 목록 갱신을 분리하고 receivedRevision ref를 제거했다.
  수신 번호만 effect의 실행 계기이며 화면 활성 여부는 Effect Event에서 최신 값을 읽는다.
  탐색 effect의 화면 준비 의존성과 이동·ack 기록은 유지한다.
- 신규 회귀 테스트에서 초기 0 무시, 비활성 수신의 stale 처리, 같은 번호의 화면 전환에서
  추가 무효화 없음, 새 수신의 최신 활성 상태 반영, 잘못된 번호 무시를 확인했다.
- check 통과: 웹 lint·typecheck·446개 테스트 새 실행, 나머지 Turbo 작업은 캐시 재사용.
  build는 웹 새 실행, admin/storybook 캐시 재사용이다. 마지막 문서 수정 후 format:check와
  git diff --check도 통과했다. 네이티브 설정 변경이 없어 doctor·iOS 빌드는 반복하지 않았다.
- 로그: .context/notification-effect-event-check.log,
  .context/notification-effect-event-build.log. 실기기 FCM 검증은 남아 있으며 커밋하지 않았다.

### 7-C 리뷰 — 탐색 effect의 판단·실행 분리

- 준비 조건은 isNavigationReady로 명명하고 동일 대상 판단·typed 이동·ack 처리는
  파일 범위 함수로 분리했다. effect에는 처리 순서만 남겼으며 기존 두 ref와
  반응해야 할 탐색 의존성을 유지했다.
- check 통과: 웹 lint·typecheck·446개 테스트 새 실행, 나머지 Turbo 작업은 캐시 재사용.
  build는 웹 새 실행, admin/storybook 캐시 재사용이다. 최종 개행·문서 변경 후
  format:check·git diff --check도 통과했다.
- 로그: .context/notification-navigation-refactor-check.log,
  .context/notification-navigation-refactor-build.log. 네이티브 설정 변경은 없으며,
  실기기 푸시 검증은 남아 있다. 커밋·push는 하지 않았다.

### 7-C 사용자 리뷰 반영·커밋 준비

- safe-area·수신 번호·푸시 탭 상태의 역할과 직접 구독 대신 기존 React 구독·effect를
  유지한 이유를 구현 흐름 문서와 훅 주석에 기록했다.
- check 통과: 웹 lint·typecheck·446개 테스트 새 실행, 나머지 Turbo 작업 캐시 재사용.
  이번 수정은 설명·주석뿐이므로 직전 웹 빌드 통과 결과를 사용했다.
  로그: .context/notification-7c-commit-check.log.

## 2026-11-16 통합·운영 검증 준비

- 7-C를 사용자 승인으로 0c4fe34e에 커밋했다(+594/-4, 598줄). push는 하지 않았다.
- Xcode 기기 목록의 hardwareProperties.reality를 확인했다. 표시된 기기 4개는 모두
  simulated이며 physical 기기는 없었다. 기기 이름만으로 실기기로 판단하지 않았다.
- 사용자 결정에 따라 실제 푸시 검증은 나중에 TestFlight에서 진행한다. 이번에는
  네이티브 빌드·TestFlight 업로드·웹 배포·시험 발송을 실행하지 않았다.
- 모바일 README와 quickstart에 TestFlight 준비 조합과 검증 순서·결과 기록 양식을 추가했다.
  현재 testflight 프로필의 운영 웹 URL에는 7-C 배포가 필요하며, 서버와 같은 Firebase
  프로젝트를 사용해야 한다. dev plist 준비만으로 운영 환경 준비 완료를 판단하지 않는다.
- T035/T041/T042는 실기기·배포 웹·접근성·최종 리뷰가 남아 있어 미완료로 유지한다.
  이번 문서 준비는 실기기 성공이나 출시 승인을 의미하지 않는다.
- 문서 준비 후 check 통과: 모바일 lint·typecheck·256개 테스트 새 실행, 나머지 Turbo
  작업은 캐시 재사용. 문서만 변경해 build·expo:doctor는 반복하지 않았다.
  로그: .context/notification-testflight-plan-check.log. 최종 format:check·diff 검사 통과.
