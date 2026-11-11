# 구현 계획: 회원 알림함과 iOS 푸시

**실제 브랜치**: `DongjaJ/android` · **기준**: `d8dfd4862bb2f739bba8bdc8d022304f5ce305cd`
**명세**: [spec.md](spec.md) · **작업**: [tasks.md](tasks.md) · **상태**: 1단계 리뷰 대기

## 요약과 기술 맥락

회원 웹은 기존 React·TanStack Query·Zod·SEED·Stackflow를 사용한다. iOS Expo SDK 58 / React Native
0.88.1 셸에 React Native Firebase만 추가한다. `expo-notifications`·Notifee·새 공용 패키지는 없다.
Node.js 24.20.0·pnpm 12.3.4를 mise로 실행한다. 최신 안정 Firebase 세 패키지는 조사일 기준
27.1.0이다. 실제 설치 직전 registry latest와 peer dependency를 재확인해 정확한 호환 버전을
catalog·lockfile에 고정한다. 범위 지정 `latest`를 의존성 값으로 남기지 않는다.
서버·DB migration은 없다. 목록은 Query 캐시, 선택은 SecureStore, 등록 캐시·탭 대기는 메모리다.
Vitest·Testing Library·MSW와 실제 iPhone을 사용한다. 별도 성능 SLA·백그라운드 폴링은 추가하지 않는다.

## 헌법 점검

[루트 지침](../../AGENTS.md), [웹 지침](../../apps/web/AGENTS.md), [공통 가이드](../../docs/frontend-development.md),
[웹 가이드](../../docs/web-development.md), [모바일 운영](../../apps/mobile/README.md)을 기준으로 설계 전·후 확인했다.

| 항목             | 판단                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| 한국어·최소 범위 | 적용: 확정한 회원 알림만 구현, 추가 알림 도구·미래 추상화 없음         |
| 계약·앱 경계     | 적용: 생성 SDK와 app-bridge 공개 진입점 사용, 생성 파일 직접 수정 없음 |
| 입력 검증        | 적용: 응답·브리지·푸시 payload·환경 설정을 각 경계에서 검증            |
| 의존성           | 적용: 최신 안정 버전 확인 후 고정, 기존 공급망 보호 유지               |
| 검증             | 적용: 가까운 테스트·check/build·expo:doctor·네이티브 빌드·실기기       |
| 변경량·리뷰      | 적용: 단계별 리뷰, 650줄 분리 검토·800줄 미만, lockfile 포함           |
| 인증·복구        | 적용: 합의된 로그아웃 변경, 계정 경합·runtime·서버 등록 복구 명시      |
| 외부 설정        | 확인 필요: Firebase iOS·APNs·서버 환경 연결, 실제 수신은 미검증        |

설계상 규칙 예외는 없다. 구현 후 diff와 검증 결과로 재평가한다.

## 구조와 책임

- `apps/web/src/pages/alerts/`: 알림 schema·query·표시 모델·UI. 단일 소비이므로 feature로 승격하지 않는다.
- `apps/web/src/pages/settings/`: 설정 query·mutation·UI. 기존 인증·공통 오류 UI를 재사용한다.
- `apps/web/stackflow/src/`: 알림 이벤트를 typed 탐색으로 연결한다. 페이지끼리 import하지 않는다.
- `apps/mobile/src/notifications/`: SDK 어댑터·저장·등록 조율·수신·대기 이벤트.
- `apps/mobile/src/auth/`: 기존 세션 수명·401 갱신·로그아웃 정책을 확장한다.
- `packages/app-bridge/`: [알림 계약](contracts/notifications.md)의 타입·Zod·웹 경계만 공유한다.

## 단계별 구현과 리뷰

### 1 — 기준·명세

최신 main fast-forward, 관련 issue 검색·초안, Spec Kit 산출물·품질 점검과 기본 check를 수행한다.
이슈 생성은 별도 승인 후이며 번호 확인 전 제품 구현을 시작하지 않는다. 사용자 지시로 실제
브랜치는 유지하고 feature.json만 023에 연결한다. 이 단계에서 제품 코드·의존성은 수정하지 않는다.

### 2 — US1 데이터

`find3InfiniteOptions`에 기존 인증 옵션·AbortSignal과 응답 검증을 연결한다. 생성 Zod를 확장해
양의 안전한 정수 ID·한국 날짜·불투명 커서를 검증한다. 기존 client의 responseTransformer에서 parseAsync 결과를 반환해
생성 SDK의 number 모델을 캐시에 저장하고 서버 순서를 그대로 표시한다.
`nextCursor=null`에서 종료하고, 첫 페이지를 수동 재조회할 수 있다.
갱신 성공 후 첫 페이지부터 다시 시작하며 실패하면 기존 목록을 유지한다. 계정 경계는 기존
업무 캐시 정리를 재사용한다. MSW는 개발·테스트에서만 연결한다.
완료: 모델·query·401·커서·계정 경합 테스트와 check, 데이터 계약 리뷰.

### 3 — US1 화면

샘플·showEmpty·운영 empty=true 분기를 제거한다. 최초 로딩·빈 목록·최초 실패·갱신/추가 조회 실패를
구분하고 새로고침·더 불러오기·재시도를 제공한다. POST만 ActivityLink로 상세에 연결한다.
기존 `/alerts` 부모 Tabs(home), 선택 없는 하단 메뉴, 상세 왕복 목록·스크롤을 유지한다.
비로그인 안내·화면 복귀 훅을 재사용한다. 새로운 무한 스크롤 observer는 도입하지 않는다.
완료: 화면·탐색 테스트, check/build, 브라우저·접근성·화면 캡처 리뷰.

### 4 — US2 네이티브 기반 (세 리뷰 단위)

**4-A:** 최신 Firebase app/messaging/installations를 같은 호환 버전으로 고정한다. 필요한
Expo config plugin·expo-build-properties·dynamic frameworks·APNs entitlement를 설정한다.
iOS config의 서비스 파일 경로는 빌드 환경에서 공급하고 Bundle ID·Firebase project 일치를 검증한다.
로컬 설정 없음은 미지원, 출시 설정 없음은 빌드 실패다. 기본 Firebase 앱을 무조건 참조하지 않는다.
버전/runtime은 현재 1.0.2에서 1.0.3으로 올린다. 자동 등록은 아직 연결하지 않는다.
완료: check/build·expo:doctor·iOS 빌드와 기존 OIDC/위치 호환성 확인.

**4-B:** Firebase project·FID별 SecureStore 선택을 기기 전용 접근성으로 저장한다.
기본 ON·손상 OFF·읽기 실패 차단을 적용한다. register/remove 응답의 실제 HTTP 성공을 확인한다.
설정 변경·자동 동기화는 직렬화하고 세션·FID·token 캐시로 같은 등록만 생략한다. OFF는 앱 재시작에도
DELETE한다. 서버 성공→저장→반영, 저장 실패는 이전 선택으로 재동기화한다. 409는 오류로 알리고
FID를 임의 재발급하지 않는다. 완료: 저장·등록·실패·세션 경합 테스트와 check.

**4-C:** 앱 시작·세션 복원·로그인·FCM token 갱신·active 복귀에 동기화를 연결한다. ON+허용이면
PUT, OFF/권한 차단이면 DELETE한다. 최초 인증 후 미결정 권한만 요청하고 OFF에는 요청하지 않는다.
동기화 실패는 로그인을 실패시키지 않는다. 리스너는 앱 수명에 한 번 설치·해제하고 인증 조회가
다시 동기화를 부르는 순환을 막는다. 권한 변경·중복 이벤트·복귀 테스트와 check/build 후 리뷰한다.

### 5 — US3 합의된 로그아웃 정책

새 장애 수정이 아니라 사용자 선택인 서버 성공 후 로그아웃을 구현한다. 신규 등록·갱신 진입을 보류하고
진행 중 등록·갱신을 완료한 뒤 최신 refresh token을 읽어 revoke한다. 이미 진행 중인 등록에 필요한
내부 갱신은 완료할 수 있게 해 잠금 교착을 막는다. 진입 때 미리 읽은 token을 재사용하지 않는다. 서버 성공 후 로컬 삭제·대기 작업 정리,
서버 실패는 로그인 유지·보류 해제·재시도다. 별도 선행 기기 DELETE는 추가하지 않는다.
웹 mutation 진행 상태와 로그인 cache를 분리해 실패를 SIGNED_OUT으로 바꾸지 않는다.
서버 성공 뒤 저장 삭제 실패는 기존 삭제 재시도 경로를 사용한다. 응답 유실 후 만료 확인은
기존 인증 정리를 따른다. 선택은 유지하며 탈퇴·계정 변경도 이전 작업을 폐기한다.
완료: 서버 오류 응답/예외·유실·삭제 실패·갱신/등록 경합 회귀와 check/build, 인증 리뷰.

### 6 — US2 설정 UI

설정 브리지·웹 검증과 query/mutation을 연결하고 임시 useState(true)를 제거한다.
저장된 선택과 OS 권한을 별도로 표시한다. 조회 실패는 스위치 위치의 재시도 버튼,
변경 실패는 이전 값·재시도다. ON 요청은 권한 확인 후 등록하며 거부는 시스템 설정 이동을 제공한다.
복귀·재진입 시 다시 조회하고 브라우저·구버전은 비활성 안내를 제공한다.
완료: 경계·UI·권한·이탈·접근성 테스트, check/build, 상태별 캡처 리뷰.

### 7 — US4 수신·탭과 통합

Firebase onMessage/onNotificationOpenedApp/getInitialNotification을 연결한다. iOS banner/list
표시를 사용하고 수신 시 로컬 알림을 중복 생성하지 않는다. 목록 갱신 신호만 전파하고 수신만으로
화면을 이동하지 않는다. 탭은 검증한 최신 한 건을 보관하고 웹·인증·Stackflow 준비 후 처리한다.
같은 대상이 최상단이면 재push하지 않는다. 처리한 eventId만 ack하며 다른 새 이벤트는 지우지 않는다.
계정 변경·로그아웃은 대기를 폐기하고 복원 실패는 Login으로 보낸다. cold start 부모 복원은
기존 typed 탐색/route 계약을 사용한다. 완료: payload·브리지·탐색 테스트, check/build,
development/TestFlight 실제 수신·탭·접근성 확인과 미검증 위험 보고.

## 복구·변경량·출시

매 리뷰는 실제 base 대비 추가+삭제 합계로 계산한다. 650줄부터 분리 검토, 800줄 이상이면
독립 리뷰 단위로 분리한다. lockfile만으로 초과해도 제외하지 않고 원인을 보고한다.
이슈·commit·push·PR·배포는 각각 기존 승인 절차를 따른다. 단계 리뷰는 외부 변경 승인과 다르다.
문서 1단계 리뷰 뒤 2단계부터 순서대로 진행하며 다음 단계 확인 전 구현하지 않는다.
Firebase/APNs 준비가 되지 않아도 문서·웹·단위 테스트는 가능하지만 실기기 완료로 표시하지 않는다.
검증된 main의 새 runtime 빌드로 출시한다. 기존 설치본에는 미지원 처리를 유지한다.
웹은 이전 검증 배포, JS는 동일 runtime, 네이티브 설정은 수정 빌드로 복구한다. 코드 복구만으로
서버 등록은 삭제되지 않으므로 필요 시 기기 해제·발송 중단의 별도 운영 조치를 확인한다.
