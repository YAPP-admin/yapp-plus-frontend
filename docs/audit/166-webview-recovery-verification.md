# WebView 기본 오류 화면과 복구 검증 경계 기록

발견 ID: C02. 관련 이슈: #166.

## 현재 확인

앱은 `renderLoading`과 `startInLoadingState`만 제공합니다. 앱 전용 `renderError`,
`onError`, `onHttpError`, `onContentProcessDidTerminate`와 재시도 버튼은 없습니다.
설치된 react-native-webview 14.0.1의 iOS 구현은 오류 상태에서 `defaultRenderError`를
사용합니다. 이 기본 화면에는 영문 오류 제목·domain·code·description이 있으며 재시도
버튼은 없습니다. 따라서 오류 UI가 전혀 없다고 표현하면 부정확합니다. 프로세스 종료
콜백은 앱 콜백을 전달하며, 앱 코드에서 복구 동작을 지정하지 않았습니다.

## 실기기 실행표

| 조건                           | 확인할 결과                                           |
| ------------------------------ | ----------------------------------------------------- |
| cold launch offline → online   | 오류 화면, 연결 복구 후 사용자 조작으로 복귀 가능한지 |
| 정상 로드 후 offline           | 기존 화면 유지, 링크·API 실패와 문서 로드 오류 구분   |
| HTTP 404·500 문서              | 서버 오류 페이지와 native 오류 콜백 차이              |
| iOS content process 종료       | 흰 화면·로딩 고착 여부, reload 필요성                 |
| 복구 중 뒤로가기·앱 백그라운드 | 중복 reload·이전 페이지 부활·무한 재시도 없음         |

앱 버전·iOS 버전·기기·최종 URL·오류 종류·복구 조작을 기록하며 인증 URL query와 개인정보를
로그에 남기지 않습니다. 자동 reload를 추가하려면 입력 유실과 중복 제출 위험, 재시도 횟수,
수동 탈출 경로를 먼저 정합니다. 필요 시 단일 수동 재시도부터 구현하고 위 실행표를 다시
검증합니다. 실제 기기 결과 없이 무한 자동 재시도를 추가하지 않습니다.

관련: #24, #25, #165. 이 저장소의 모바일 대상은 iOS이며 Android 검증은 별도 프로젝트입니다.

## 근거와 완료 판정

기준: `e0d4bf92f007c075b53adc0938d9abe5e8ba4572`.

- [apps/mobile/app/index.tsx](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/mobile/app/index.tsx)
- [apps/mobile/package.json](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/mobile/package.json)
- [apps/mobile/README.md](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/mobile/README.md)

이번 PR은 확인된 현재 상태와 후속 검증 기준을 기록합니다. 미실행 항목을 통과로 처리하지 않으며,
이슈는 실제 완료 조건을 충족할 때 닫습니다. dots 보고서의 재현은 기존 검증이며 아래 신규 확인과
구분합니다.
