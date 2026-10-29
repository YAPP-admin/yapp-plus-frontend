# WebView 탐색과 브리지 권한 경계 기록

발견 ID: C01. 관련 이슈: #165.

## 현재 확인

`BridgeWebView`는 시작 URL과 로딩 화면을 지정하지만 `originWhitelist`,
`onShouldStartLoadWithRequest`, `onOpenWindow`를 앱에서 지정하지 않습니다.
브리지는 safe-area 상태와 `getSafeAreaInsets`만 제공합니다. 외부 페이지에서 토큰을 탈취했다고
확인한 결과는 없습니다. #164의 시작 URL 검증과 후속 탐색의 허용 범위는 별개입니다.

## 정책 결정과 검증

| 대상               | 구현 전 결정                                     | iOS 확인                                  |
| ------------------ | ------------------------------------------------ | ----------------------------------------- |
| 앱 내부            | 실제 운영·Preview origin과 개발 예외             | 최초 진입·내부 이동·redirect 후 URL       |
| OAuth              | 공급자·callback origin, 외부 인증 세션 사용 여부 | 로그인·취소·다중 redirect·callback        |
| 외부 링크          | 시스템 브라우저 여부, 사용자에게 돌아오는 경로   | 일반 링크·새 창·`window.open`             |
| 사용자 지정 scheme | 딥링크 종류와 허용 주체                          | 미등록 scheme·앱 미설치·오류 안내         |
| 브리지 확장        | 허용 페이지와 권한 부여·회수 시점                | 외부 이동 뒤 이전 페이지 요청과 늦은 응답 |

인증 메서드를 추가하기 전 origin 문자열 검사를 어디서 수행할지와 redirect 시 권한 회수를
Spec Kit 명세·계획으로 확정합니다. 단순 URL prefix 비교로 origin을 판정하지 않습니다.
정책 변경 후 정상 OAuth가 막히면 이전 앱 릴리스로 복구할 수 있어야 합니다. 실제 등록된
origin과 callback은 담당자 확인이 필요하며 이 문서가 새로운 허용 목록을 승인하지 않습니다.

관련: #24, #25, #166, #172.

## 근거와 완료 판정

기준: `e0d4bf92f007c075b53adc0938d9abe5e8ba4572`.

- [apps/mobile/app/index.tsx](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/mobile/app/index.tsx)
- [apps/mobile/src/bridge.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/mobile/src/bridge.ts)
- [packages/app-bridge/src/index.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/packages/app-bridge/src/index.ts)
- [apps/mobile/README.md](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/mobile/README.md)

이번 PR은 확인된 현재 상태와 후속 검증 기준을 기록합니다. 미실행 항목을 통과로 처리하지 않으며,
이슈는 실제 완료 조건을 충족할 때 닫습니다. dots 보고서의 재현은 기존 검증이며 아래 신규 확인과
구분합니다.
