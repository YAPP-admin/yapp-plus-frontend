# 구현 계획: iOS OIDC 인증과 TestFlight 준비

> 최신 작업은 [#329](https://github.com/YAPP-admin/yapp-plus-frontend/issues/329)의 보완 5A-1 구현 리뷰다.
> 아래 최초 1–5단계는 이력으로 보존하며, 현재 실행 순서는 마지막의 보완 0–7단계를 따른다.

**브랜치**: `DongjaJ/apple/google-oidc-plan`

**날짜**: 2026-11-04

**명세**: [spec.md](spec.md)

**상태**: 1A 문서 반영 완료, 사용자 리뷰 대기. 제품 구현은 아직 하지 않았다.

**이슈**: [#313](https://github.com/YAPP-admin/yapp-plus-frontend/issues/313)

## 요약

네이티브가 OIDC 교환·가입·세션·로그아웃·탈퇴를 소유하고 웹은 기존 브리지로 요청한다.
웹의 일반 업무 API는 access token을 사용한다. CORS 미확인을 이유로 범용 네이티브 HTTP 프록시를 만들지 않는다.
실기기·백엔드 검증은 후속 확인으로 분리한다. 각 단계 끝에서 사용자 리뷰 및 다음 단계 명시적 승인 전까지 멈춘다.

## 기술 맥락

- 기준: `origin/main`의 `82124d9`. 승인받아 HEAD를 `dc5c957`에서 `82124d9`로 fast-forward했다. 브랜치 이름은 유지했다.
- TypeScript, Expo 58.0.22, React Native 0.88.1, Vite·Stackflow, webview-bridge 1.8.0.
- Apple: expo-apple-authentication. Google: react-native-nitro-google-signin 2.3.1과 호환 Nitro 의존성.
- nonce: expo-crypto. 저장: expo-secure-store. 각 Expo 패키지는 SDK 호환 버전을 설치하고 catalog·lockfile에 고정한다.
- API: 기존 Hey API 0.99.0의 Ky·타입·Zod·MSW 생성 경로. 검증 옵션을 전역 변경하지 않는다.
- 검증: 기존 Vitest·Testing Library·MSW; 네이티브 상태 로직은 SDK·저장소 경계 대역으로 검증한다.
- 성능 정책: 인증 중복 요청 차단, 갱신 single-flight, 브리지 응답 대기 180초. 로그인 UI 표시 시간의 성능 SLA는 만들지 않는다.
- 인증 HTTP 요청은 20초 제한·자동 재시도 없음. 브리지 시간초과는 native 취소가 아니므로 상태를 조회한다.
- 범위: 회원 iOS 앱·회원 웹·공용 API/브리지. admin 인증과 일반 브라우저 쿠키 인증은 변경하지 않는다.

## 헌법 점검

기준 main의 AGENTS.md, apps/web/AGENTS.md, docs/mission.md와 .specify/memory/constitution.md를 읽었다.

| 항목        | 판단과 적용                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------- |
| 제품·범위   | 승인된 iOS 인증과 내부 테스트 범위만 포함. 승인/반려 정책 제외                              |
| 앱 경계     | 앱 간 import 없음. 공용 브리지 계약은 packages/app-bridge, API 계약은 packages/api          |
| 생성 코드   | 수동 수정 금지. 입력 snapshot의 SHA-256과 operationId 변화를 기록                           |
| 외부 입력   | 환경 설정·브리지 양방향·API 응답의 런타임 검증, 토큰 로그 금지                              |
| 도구·의존성 | main의 mise·pnpm 버전 사용. 필요한 native SDK만 추가                                        |
| 검증        | 단계별 가까운 계층의 테스트, check/build/expo:doctor 해당 조건 적용                         |
| Git         | #313 생성·main fast-forward 승인 및 실행 완료. 다음 단계는 별도 리뷰 승인 후 진행           |
| 변경량      | 문서·생성 코드·lockfile 포함 650줄부터 분리 검토, 800줄 미만. 초과 시 별도 리뷰 단위로 분리 |
| 복구        | 웹 호환성 검사 유지, native 결함은 수정 바이너리, 테스트 설정은 production에 노출하지 않음  |

설계 후 재점검: 현재 변경은 정식 명세 문서뿐이며 원본 snapshot과 생성 preview는 gitignored 증거로 보관한다. 기능 구현·계정 변경·배포는 없다.
Spec Kit 전후 hook 설정 파일은 없었다. setup-plan/setup-tasks를 정식 문서 경로로 확인했다.

## 문서와 코드 구조

문서 위치는 `specs/016-ios-oidc-auth/`다. 초기 초안과 격리 생성 증거는 `.context/oidc-stage-1/`에 남긴다.
Spec Kit이 표시하는 feature 이름과 실제 Git 브랜치를 구분하며 브랜치를 바꾸지 않는다.

- `apps/mobile/src/auth/`: provider 연결·서비스 세션·저장소·API 오류 변환. 앱 외부에 공개하지 않는다.
- `apps/mobile/src/bridge.ts`: 기존 safe area를 유지하고 인증 메서드를 등록한다.
- `packages/app-bridge/src/`: 기존 공개 진입점에 인증 계약과 웹 호출·결과 검증을 추가한다.
- `apps/web/src/features/auth/`: 여러 인증 화면이 사용하는 상태·행동. `src/pages/*`와 `stackflow/src/stack.tsx`에서 소비한다.
- `packages/api/`: 기존 생성 경로를 유지한다. 별도 인증용 수동 OpenAPI나 이중 SDK를 만들지 않는다.

## 단계와 리뷰 경계

### 1단계 — 명세·계획·API 계약

현재 단계. Spec Kit 산출물, 공용 계약, 수용 기준과 후속 작업을 작성한다.
수신한 OpenAPI를 main과 비교하고 가입 operationId 변경·Apple 오류 enum 누락을 기록한다.
#313과 main 동기화를 완료하고 정식 문서를 반영했다. 생성 변경은 아래 1B로 별도 분리한다.
격리 재생성 diff가 6343줄로 확인되어 1A(문서)와 1B(API 재생성)를 별도 검토 단위로 분리한다.
1B는 backend 수정 반영과 변경량 처리 방안을 확인한 뒤 수행한다. 그 전 구현은 main 계약을 기준으로 하고 생성 파일을 수동 변경하지 않는다.
1A 승인 뒤 2단계 설정을 진행할 수 있으나, 1B의 계약 변경은 3단계 코드에 반영·재검증한다.
**종료**: 문서 정합성·링크·변경량 검증 결과와 미확인 사항을 제출하고 2단계 승인 대기.

### 2단계 — iOS·Expo 설정

확정한 프로젝트 식별자, HTTPS 웹 주소, 앱 아이콘, Apple capability, Google URL scheme을 적용한다.
개발 기기·시뮬레이터·store 빌드 프로필과 SDK 의존성을 준비하고 환경 변수를 검증한다.
Google SDK의 iOS Client ID는 앱용, serverClientID는 공통 Web Client ID를 사용한다.
**종료**: check/build/expo:doctor, 가능한 시뮬레이터 빌드와 설정 diff 제출. 실기기 설치·업로드는 대기 가능.

### 3단계 — 네이티브 인증·세션·브리지

[계약](contracts/auth.md)에 따라 6개 메서드를 구현한다. provider SDK와 API/저장소를 테스트 경계에서 대체한다.
복구/getSession/refreshSession의 native single-flight, 갱신·로그아웃 경쟁, 저장 실패, 부정확한 응답과 nonce 전달을 검증한다.
요청 당시 sessionId/tokenVersion을 native에서 비교해 늦은 401의 추가 갱신을 막고, 다른 세션으로 이전 요청을 재전송하지 않는다.
공유 상태에는 토큰을 넣지 않고 상태 변경 알림용 revision만 둔다. 웹은 getSession으로 다시 조회한다.
**종료**: 경계·상태 테스트와 기본 검증 제출. 실제 SDK 인증 성공은 미확인으로 남긴다.

### 4단계 — 웹 흐름

US1 로그인, US2 가입, US3 복구·로그아웃, US4 탈퇴 순으로 기존 페이지에 연결한다.
가입 완료 뒤 SignupComplete를 사용하고 승인 상태를 추정해 SignupStatus로 보내지 않는다.
세션 확인 전 보호된 화면을 숨기고 사용자 변경 시 Query 캐시와 Stackflow 세션 루트를 재설정한다.
메서드 준비/지원 여부를 확인하고 외부 링크는 시스템 브라우저로 연다. 브리지 출처는 서비스 origin으로 제한한다.
**종료**: 브리지 대역·MSW 기반 화면 테스트, 키보드·터치·safe area 검증과 화면 근거 제출.

### 5단계 — 통합 테스트·빌드

check/build/expo:doctor와 가능한 시뮬레이터 검증을 실행한다. 실제 실행과 Turbo 캐시를 구분한다.
CORS, 실제 계정 인증, 서명·TestFlight 설치·탈퇴는 별도 대기 목록으로 유지한다.
**종료**: 선행 구현 완료 보고. 백엔드 및 실기기 검증 전 통합 인증 성공이나 출시 가능으로 표시하지 않는다.

## 복구와 호환성

- 구버전 앱은 auth 메서드가 없으면 안내한다. initialBridge에 성공하는 가짜 인증 메서드를 넣지 않는다.
- 웹 배포 실패 시 호환되는 이전 배포로 복구한다. 새 auth 기능을 사용하지 못해도 셸 초기화는 유지한다.
- native SDK·entitlement 변경은 OTA로 복구하지 않는다. 수정 바이너리 전에는 지원 안내로 기능을 제한한다.
- 실제 TestFlight 업로드는 별도 검토 후 한다. 인증 변경의 실제 삭제 검증에는 폐기 가능한 계정을 사용한다.

## 확정된 설정

| 항목                           | 값                                                                      |
| ------------------------------ | ----------------------------------------------------------------------- |
| 이름 / Bundle ID               | YAPP+ / org.yapp.yappplus                                               |
| Apple Team / App Store Connect | FV4V9756F6 / 6830536097                                                 |
| Expo owner / slug              | yapp-plus-official / yapp-plus                                          |
| EAS projectId                  | e34d595c-d553-4007-ac7c-8e85d6549e44                                    |
| 웹 origin                      | https://yapp-plus-web.vercel.app                                        |
| dev API                        | https://44nk4mnqi7.execute-api.ap-northeast-2.amazonaws.com             |
| Google Web Client ID           | 47093355379-bl1tgba0nj3sn5610bn01aeqc7mm4ljb.apps.googleusercontent.com |
| Google iOS Client ID           | 47093355379-s1gkq650qpgjhvsb2bev9h4na5mlmnsi.apps.googleusercontent.com |

아이콘 원본: https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=1167-25275.
512px 프레임을 2배 PNG로 내보내며 실제 export는 2단계다. Client Secret·Apple private key는 앱에 넣지 않는다.

## #329 보완 계획 — 2026-11-05

현재 브랜치 `DongjaJ/oidc-ios-google`, HEAD·fetch 후 `origin/main`은 `9186dc6`이다.
기존 구현을 기준으로 여섯 결함만 보완한다. Node.js 24.20.0·pnpm 12.3.4·Expo 58.0.23과 고정 lockfile을 사용한다.

| 단계 | 목적과 변경 경계                                         | 종료 증거                                                             |
| ---- | -------------------------------------------------------- | --------------------------------------------------------------------- |
| 0    | 기존 Spec Kit 문서에 R1–R6·설계·작업·복구·연계 범위 추가 | 문서 정합성·check·변경량 및 사용자 리뷰                               |
| 1    | R1: mobile 세대 검사와 p-mutex 저장 직렬화               | 로그인·가입·restore·쓰기 지연 뒤 logout 회귀, single-flight·저장 실패 |
| 2    | R2: auth-api의 HTTP 상태 보존과 renew 오류 분류          | 401 정리·일시 오류 보존·구 세션 오류 차단                             |
| 3    | R3: 명시적 iosClientId, 기존 scheme 대응 검증            | 설정·expo:doctor·깨끗한 iOS 생성/빌드; 기기 미검증 분리               |
| 4    | R4: 새 nonce의 silent 인증 가능성 조사                   | 고정 SDK 흐름·대안·재로그인 검증 계획 보고 후 구현 여부 별도 리뷰     |
| 5    | R5: 브리지 가용성·재조회·보호 화면 복구                  | timeout→준비·unsupported·foreground/online·늦은 query 회귀            |
| 6    | R6: 공통 mock의 detail1 연결                             | 실제 공지 상세 URL의 상태·생성 schema 검증                            |
| 7    | 통합 검증 및 미실행 항목 정리                            | check/build/expo:doctor·Metro/Hermes·가능한 iOS 검증과 롤백 확인      |

각 단계에서 변경·검증·미확인을 보고하고 리뷰 반영 및 다음 단계 승인을 받은 뒤 진행한다.
1단계는 변경량 제한을 지키도록 1A(세션 저장·복구 기반과 테스트), 1B(AuthActions 로그인·가입·로그아웃 연결)로 나누며 각각 리뷰받는다.
1A 리뷰에서 establish의 세대 인자를 필수화하며 로그인·가입 시작 세대 전달까지 연결했다. 1B에서 서버 revoke 이전 clear 호출, 가입 자격 정리와 늦은 결과·오류 차단을 구현했다. R1의 웹 전파는 보완 5단계까지 미검증이다.
0단계 문서와 1A 구현은 승인 후 `8895f48`로 커밋했다(main 대비 680줄). 사용자 승인으로 이 커밋에서 `DongjaJ/oidc-auth-actions`를 생성·전환했다.
1B의 종속 PR base는 `DongjaJ/oidc-ios-google`이다. 현재 PR 단위 변경량은 해당 base와 비교하며 main 누적 diff를 하나의 PR로 제출하지 않는다. push·PR 생성·다음 단계는 별도 승인 전 실행하지 않는다.
1B는 리뷰 승인 후 `2813cfe`로 커밋했다. 2단계도 같은 종속 브랜치에서 진행하며 base 대비 전체 변경량을 합산한다. 갱신의 401 정리·오류 구분과 리뷰 수정을 `ba6fa43`으로 커밋했다(base 대비 739줄). 사용자 승인으로 여기서 `DongjaJ/oidc-google-config`를 생성했으며, 3단계 종속 PR base는 `DongjaJ/oidc-auth-actions`다.
0단계에서 제품 코드·의존성은 변경하지 않는다. 4단계 조사로 구현 조건을 확정하지 못하면 R4를 미해결로 남기고 사용자와 다음 범위를 결정한다.

### 동시성 설계

세션 관리자 인스턴스에 mutex 하나를 둔다. provider·서버 응답은 lock 밖에서 기다리고,
SecureStore 읽기/쓰기/삭제와 관련 메모리 확정만 직렬화한다. 같은 lock의 중첩 획득은 금지한다.
로그인·가입·restore·refresh 시작 시 generation을 캡처한다. 조건 검사와 저장을 같은 임계 구역에서 수행하고,
await 뒤에도 다시 확인한다. 로그아웃은 서버 응답을 기다리기 전에 세대를 무효화하고 로컬 삭제를 예약한다.
진행 중 저장은 완료될 수 있어도 세션으로 공개하지 않으며 뒤따르는 삭제가 저장소를 정리한다.
restore/refresh는 세대·대상 token별 진행 Promise를 공유하고 finally는 자신이 등록한 Promise만 해제한다.
삭제 실패는 STORAGE로 보고하고 현재 프로세스의 이전 자격 재복구를 차단한다. 재시작까지 삭제 성공으로 보장하지 않는다.

### 웹 인증 작업 소유권과 5단계 준비

이전 #328 워크스페이스 조사 기록은 research.md에 보존한다. 2026-11-06 사용자가 다른 세션의 인증 작업을 중단했으므로 그 구현이나 병합을 기다리지 않는다. 다른 작업 트리의 미커밋 코드를 복사·cherry-pick하지 않는다.

5단계 시작 시 현재 브랜치와 최신 main을 확인하고 다음을 하나의 웹 인증 설계로 정리한 뒤 구현한다.

- 조회·mutation 결과를 한 경로에서 적용하고, logout/계정 변경 이전의 늦은 결과와 탐색을 차단한다.
- 계정별 query/mutation cache와 화면 수명, tokenVersion을 반영하는 범위를 확인한다.
- 브리지 미준비·timeout·미지원과 실제 SIGNED_OUT을 구분하고 foreground/online/수동 재시도의 소유권을 통합한다.
- 일반 업무 API 401 재요청은 필요 범위를 리뷰에서 확정한다. R1·R5 해결에 불필요한 범용 인증 프레임워크는 도입하지 않는다.

변경량이 커지면 5A(공통 결과 적용·경합), 5B(브리지 복구·화면)로 나누고 각각 리뷰받는다. 실제 브랜치 분리는 별도 승인 후 수행한다.

### 4단계 조사 결론과 승인된 구현

3단계는 `2148bb9`로 커밋했다. 실제 SDK 초기화·로그인은 미검증이다. 고정 SDK에서 새 nonce를 silent token 발급에 전달하는 경로를 확인하지 못했다. iOS의 사용자 Google 로그인만 presentExplicitSignIn으로 변경하고 YAPP refresh 기반 자동 복구와 Android 경로는 유지하는 방안을 권장한다. 자세한 근거·대안·회귀 범위는 research.md에 기록했다. 사용자가 Android 비교 결과와 재로그인 UI 차이를 검토한 뒤 구현을 승인했다. iOS는 configure 후 presentExplicitSignIn을 직접 호출하고 Android는 기존 silent/createAccount/explicit 순서를 유지한다. 자동 회귀와 iOS 번들을 검증하며 실제 token nonce·서버 로그인은 미확인으로 남긴다.

### 헌법 재점검과 복구

`9186dc6`의 AGENTS·제품 맥락·헌법을 기준으로 인증 변경 전 Spec Kit 계획을 보완한다.
공개 브리지 shape·SecureStore key/형식·서버 계약은 유지하며 새 token 저장소나 마이그레이션을 만들지 않는다.
생성 코드는 직접 수정하지 않고 공지 handler만 수정한다. Android 코드는 참고하며 가져오거나 수정하지 않는다.
p-mutex는 기존 workspace에 없는 직렬 실행 책임만 맡기고 catalog/mobile 의존성에 한정한다. 런타임 호환성은 구현 단계에서 검증한다.
실제 base 대비 문서·테스트·lockfile 포함 650줄부터 분리 검토, 800줄 미만으로 유지한다. 단계/PR 분리 시에도 각 리뷰 경계를 지킨다.
배포는 승인 범위가 아니다. 실패 시 해당 변경을 되돌리고 이전 검증 버전으로 복구하며 native 설정/SDK 변경은 호환되는 수정 바이너리가 필요하다.
세션 무효화 보완을 되돌리면 원래 경합 위험이 돌아오므로 복구 기록에 남긴다. 로그·증거에 실제 token을 보관하지 않는다.

## 보완 5단계 상세 설계 — 다른 세션 의존성 제거

기준 `01bdb0c`, 최신 origin/main `9186dc6`. Spec Kit setup-plan은 기존 016 문서를 유지했다. extension hook 설정은 없다. 루트·웹 AGENTS, 제품 맥락, 웹 개발 가이드와 헌법을 재확인했다. 인증 RPC·SecureStore·생성 코드·의존성은 변경하지 않으며 기존 React Query/Stackflow를 사용한다.

### 5A — 웹 인증 결과와 계정 수명

- `features/auth/model`에 QueryClient 수명의 단일 결과 적용 경로를 둔다. 별도 전역 인증 저장소나 상태 라이브러리를 추가하지 않는다. query key는 순환 import를 피하도록 이 경계에서 소유한다.
- 로그인·가입·logout 등 인증 의도 시작은 앞선 작업을 무효화한다. 조회는 현재 세대를 캡처한다. 완료 시 세대, 같은 sessionId의 tokenVersion을 검사해 이전 결과·오류를 폐기한다. native generation과 웹 세대는 별개이며 wire 타입에 추가하지 않는다.
- mutationFn 경계에서 결과를 검증하여 페이지의 onSuccess/onError에도 오래된 결과가 도달하지 않게 한다. cache 쓰기만 막고 탐색 callback을 그대로 실행하는 방식은 쓰지 않는다. 무효 작업은 기존 CANCELLED로 귀결하고 가입·설정에서도 조용히 무시한다.
- logout 시작 시 보호 콘텐츠 노출을 차단하고 앞선 조회를 취소한다. 실제 SIGNED_OUT은 native 확인 뒤 확정한다. 실패 시 이전 로그인 상태를 추측 복원하지 않고 조회 불가 상태를 표시한다. 탈퇴는 실패만으로 계정 삭제를 확정하지 않는다.
- 계정 경계 변경 때 이전 계정의 query를 취소·제거하고 mutation 데이터도 정리한다. 실행 중 Promise는 취소됐다고 가정하지 않고 세대로 차단한다. 인증 query 자체는 유지한다. 현재 웹 query 중 계정과 무관한 것의 명시적 보존 필요성을 구현 전 확인한다.
- 로그인 세션 변경·logout·탈퇴 확정은 별도 화면 세대를 바꾼다. 앱 경계에서 Stackflow 인스턴스를 갱신해 이전 Activity/폼이 새 계정에 남지 않게 한다. 단순 tokenVersion 갱신은 화면 세대를 바꾸지 않는다. 일반 브라우저는 기존 동작을 유지한다.
- 파일 범위: auth model/index, 로그인·가입·설정 callback, Stackflow main 또는 인접 수명 경계와 테스트. deferred로 늦은 query/성공/오류·logout과 새 login 교차·낮은 tokenVersion을 검증하고 화면 테스트로 계정 A의 폼/뒤로가기 상태가 B에게 남지 않는지 확인한다.

### 5B — 브리지 조회 불가와 복구

- native-auth 경계에서 브라우저·연결 대기·메서드 미지원·RPC 실패·실제 AuthResult를 구분한다. undefined는 SIGNED_OUT이 아니다. 기존 180초 RPC timeout은 native 작업 취소로 해석하지 않는다.
- 준비 여부는 현재 공개 `isWebViewBridgeAvailable`와 메서드 지원 여부로 판별한다. 저장소 initialBridge에는 함수 fallback이 없다는 전제를 테스트로 고정한다. SDK의 onReady는 생성 직후 호출되므로 hydration 완료 신호로 사용하지 않는다. 새 readiness RPC나 패키지 API를 도입하지 않는다.
- 초기 미준비는 visible일 때 재확인한다. 네이티브 메서드 목록이 확인됐는데 getSession이 없으면 미지원으로 표시하고 RPC를 반복하지 않는다. 정상 SIGNED_OUT 응답만 로그아웃으로 확정한다.
- 조회는 5A의 세대와 진행 Promise를 공유한다. visible timer·foreground·online·수동 재시도를 하나의 경로로 모으고 실패 완료 후 최소 5초 간격을 적용한다. 성공/숨김/unmount 시 timer와 listener를 정리한다. 진행 중 요청이 있는데 추가 RPC를 만들지 않는다.
- 보호 화면에서 UNAVAILABLE을 Login으로 강제 이동하지 않고 기존 UI 구성요소로 재시도 안내를 표시한다. 미지원은 앱 업데이트 안내로 구분하고 반복 시도 버튼을 노출하지 않는다. 확정 로그아웃과 일반 브라우저 탐색은 유지한다.
- 파일 범위: native-auth/session, NativeAuthRedirect 및 보호 경계·재시도 UI/테스트, 필요시 bridge의 기존 설정 회귀 테스트. fake timer와 지연 응답으로 미준비→준비·timeout→복구·미지원·중복 이벤트·숨김 정리·오래된 결과 차단을 검증한다.

### 검토·검증·복구

5A와 5B는 각각 리뷰한다. 현재 Google PR은 base `DongjaJ/oidc-auth-actions` 대비 383줄이며 웹 구현·회귀를 합치면 800줄 제한을 넘길 가능성이 높다. 다음 구현은 `DongjaJ/oidc-web-auth` 종속 브랜치(base `DongjaJ/oidc-google-config`)를 제안하며 생성·전환 승인 전에는 제품 코드를 변경하지 않는다. 5A도 650줄 도달 시 결과 적용/화면 수명으로 분할 검토한다.

일반 업무 API의 범용 401 재시도는 이번 R1/R5 수정에서 제외한다. native refresh 계약은 유지한다. UI 문구·기존 권한 정책을 바꾸는 추가 요구가 생기면 확인한다. 각 구현 단위에서 check/build, 인접 테스트와 브라우저 키보드·접근성 이름·터치 크기·보호 콘텐츠 미노출을 확인하고 신규 실행/캐시를 구분한다.

롤백은 해당 웹 변경을 이전 검증 버전으로 되돌린다. 데이터 마이그레이션은 없지만 이전 세션 경합/브리지 복구 결함이 돌아오는 위험을 기록한다. 이미 종료한 native 작업을 웹 롤백으로 취소할 수 있다고 보장하지 않는다. 헌법 점검 결과: 앱 간 import/생성 코드 변경/신규 의존성 없음, public RPC 유지, 외부 입력 가용성 경계 검증, 단계별 테스트·리뷰 및 별도 PR 분리 계획으로 기준을 충족한다.

### 다른 세션 재확인 — 2026-11-06

`hong-kong` / `DongjaJ/nsu85` HEAD `7489fad`와 미커밋 변경을 읽기 전용으로 확인했다. 인증 상태 재설계는 #329로 위임했지만 `4d7730d`의 nativeAuthClientOptions·GET 401 갱신과 session.tsx의 apiOptions 제공은 이미 커밋되어 남아 있다. 홈 미커밋 current-week-card와 일정 화면은 이 계약을 소비한다.

현재 커밋 `01bdb0c`와 해당 HEAD는 `git merge-tree --write-tree`에서 충돌 없이 병합 가능했다. 이는 미커밋 내용이나 앞으로의 5A 코드까지 무충돌이라는 의미가 아니다. 다른 작업 트리·브랜치는 수정하지 않았다.

5A는 session.tsx 수정 시 기존 apiOptions 제공 계약을 보존하고, 인증 변경에 따른 취소·결과 적용을 기존 HTTP 갱신 경로와 통합 검증한다. 같은 401 interceptor를 새로 구현하지 않는다. 현재 미커밋 홈·일정·legacy.tsx는 수정 대상으로 삼지 않는다. Provider의 retry:false도 임의로 되돌리지 않는다. 계정 cache·화면 경계 테스트에는 홈/일정의 기존 생성 query 소비를 포함하고, 최신 main 반영 또는 별도 통합 승인 뒤 실제 통합 회귀를 실행한다. 인증 이관은 기존 API 인증 코드를 삭제한다는 의미가 아니다.

### 5A-1 구현과 남은 경계

사용자 승인으로 `01bdb0c`에서 `DongjaJ/oidc-web-auth`를 생성했다. 실제 PR base는 `DongjaJ/oidc-google-config`다. 5A는 5A-1 결과·callback 유효성, 5A-2 계정 cache·Stackflow 수명으로 나누어 각각 리뷰한다.

5A-1은 QueryClient별 세대와 동일 세션 tokenVersion을 검사한다. 인증 의도 시작과 SIGNED_IN/SIGNED_OUT/WITHDRAWN 확정에서 세대가 바뀌어 작업 도중 시작된 조회도 무효화한다. 동일 세대의 중복 로그인·가입은 BUSY로 반환하고 원래 요청은 유지한다. query는 AbortSignal을 소비하며 native RPC 자체가 취소된다고 가정하지 않는다.

웹 mutation은 React Query의 onMutate 문맥에 세대를 보관하고 onSuccess/onError에서 결과를 반영한다. 작업 해제는 mutation 옵션의 onSettled에서 완료한다. 화면 알림은 mutate 호출별 onSettled에서 세대 유효성을 확인한 뒤 전달한다. React Query가 unmount 뒤 알림을 생략하며 연속 호출에서는 마지막 호출만 알린다. 페이지는 operation을 다루지 않는다. RPC 시작 전에도 세대를 검사한다. RPC 예외는 onError에서 처리하며 유효한 작업만 세션·화면에 OUTCOME_UNKNOWN으로 반영한다. 실제 NativeAuthResult wire 계약은 바꾸지 않는다.

조회 undefined를 UNAVAILABLE로 유지하는 최소 경계 수정은 포함했으나 자동 복구·미지원 구분은 5B에 남는다. 5A-2의 계정 cache 삭제와 Stackflow 재생성은 아직 구현하지 않았다. 다른 세션의 apiOptions/401 코드와 실제 통합은 그 코드가 반영된 뒤 별도 검증한다.

### 5A-2 탐색 단순화 선행 — 사용자 리뷰 반영

사용자 승인으로 5A-2를 탐색 기반 정리와 계정 수명 연결의 두 리뷰 단위로 나눈다. 이전 초안은 `.context/oidc-stage-5a2/saved-draft/`에 파일 및 patch로 보존했다. 이번 변경은 기존 탐색을 Stackflow의 상태와 공개 API로 단순화하며, 계정 cache 정리와 계정 경계는 후속 리뷰에서 연결한다.

- BackButton은 별도 browser history ledger 대신 useActivity의 isRoot와 useFlow.pop/replace를 사용한다. 직접 접근의 부모 흐름은 기존 route.defaultHistory가 담당한다.
- Alerts→Tabs 전환은 공개 useHistoryTick 큐에서 pop 뒤 replaceStep을 실행한다. 전역 pendingTransition과 이를 실행하던 plugin은 제거한다.
- 일반 ActivityLink는 공식 Link이므로 유지한다. 탭의 기존 경로·query·수정키 새 탭 이동·뒤로가기 동작을 보존한다.
- 설치된 history-sync 1.11.2는 동일 Activity의 첫 route로 URL을 생성한다. encode/decode만으로 기존 다중 탭 경로와 미등록 경로의 NotFound를 동시에 보존할 수 없다면 useTabsUrl의 한정된 URL 보정은 유지하고 제약을 기록한다. SDK 업그레이드나 새 라우터는 추가하지 않는다.
- 검증은 BackButton root/fallback, 직접 접근 defaultHistory, Alerts→탭 전환, 두 Stack 인스턴스의 독립성, query와 browser back 복원에 집중한다. 실패 시 해당 탐색 변경만 되돌리며 인증 계약·계정 데이터에는 변경이 없다.
- 다른 세션 50dfa2d의 route 추가·홈 UI·apiOptions·retry:false는 보존 대상이다. 해당 작업 트리나 브랜치를 변경하지 않는다. 실제 통합은 별도 승인 전 수행하지 않는다.

### 5A-2 데이터 경계 리뷰 단위

탐색 단순화 509줄 위에서 800줄 PR 제한을 지키도록 데이터 정리를 먼저 연결한다. 확정한 userId/sessionId를 QueryClient 수명에 보관하고, 동일 세션의 tokenVersion 변경·조회 불가는 계정 경계로 취급하지 않는다. 유효한 mutation 결과와 세션 복구 결과에만 적용하며 이전 작업의 늦은 결과는 기존 세대 검사에서 먼저 차단한다.

계정 경계에서 native-auth 이외의 query를 취소·제거하고 이전 mutation cache를 제거한다. 진행 중인 인증 mutation은 자신의 lifecycle 완료를 위해 유지한다. mutation cache 제거는 서버 작업 취소나 callback 무효화를 뜻하지 않는다. 현재 업무 mutation 소비자는 없으며, 추가 시 계정 경계 검사도 필요하다. Stackflow 재생성과 화면 callback 수명 연결은 후속 리뷰 단위에 남기고 이번 변경만으로 이전 화면 노출 방지가 완성됐다고 선언하지 않는다. 실패 시 데이터 정리 모듈과 두 호출 지점만 되돌린다. 새 의존성·브리지 계약 변경은 없다.
