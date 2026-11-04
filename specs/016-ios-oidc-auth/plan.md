# 구현 계획: iOS OIDC 인증과 TestFlight 준비

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
