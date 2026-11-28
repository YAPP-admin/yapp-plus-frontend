# 조사와 결정

확인일: 2026-11-28. 기준 commit과 최신 main 차이는 [계획](plan.md)을 따른다.

| 결정                                                        | 근거·대안                                                                                                                                                      |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 웹 SDK와 React Provider, iOS 오류 SDK 분리                  | 주요 UI는 WebView이며 native-only로 DOM 행동을 대체할 수 없다. 양쪽 행동 자동 수집은 중복되므로 제외한다.                                                      |
| 직접 소셜 인증의 서버 결과 3종을 완료로 기록                | native auth가 등록 필요·심사 필요·승인 세션을 구분한다. 등록 토큰과 앱 토큰, 관리자 승인과 세션 복원을 혼동하지 않는다.                                        |
| channel로 알림 경로 구분, eventId는 임시 요청 처리에만 사용 | notificationOpen 공개 계약에는 실제 알림 ID가 없다. native의 전달 ID를 알림 ID로 추측하거나 브리지에 새 ID를 추가하지 않는다.                                  |
| 활성 Activity·탭·visibility·AppState로 노출 계산            | 탭은 마운트와 Query 구독을 유지한다. mount/refetch를 노출로 쓰지 않는다. Modern Web Guidance의 제한된 플랫폼 API·자체 전송기 대신 기존 지원 범위·SDK를 따른다. |
| 입력·텍스트 기본 마스킹, 이미지 전체 차단                   | 텍스트 마스킹만으로 이미지·URL·동적 속성까지 보호되지 않으므로 각각 검증한다.                                                                                  |
| Expo Metro/config plugin으로 소스맵·dSYM 연결               | 실제 배포 번들의 맵·심볼이 필요하며 native 의존성은 새 바이너리가 필요하다. native replay·surveys·별도 react-native-config는 추가하지 않는다.                  |
| report_types·is_edit·원문 코드포인트 길이                   | 최신 main은 복수 유형과 PUT 수정을 지원한다. 유형별 중복 이벤트를 만들지 않는다. 감점 기준과 제출 마감은 달라 is_before_deadline은 생략한다.                   |

## 공식 자료

- [React 가이드](https://posthog.com/docs/libraries/react), [React/Vite 공식 스킬](https://github.com/PostHog/skills/blob/main/skills/posthog/all/skills/integration-react-vite/SKILL.md).
- [녹화 개인정보 보호](https://posthog.com/docs/session-replay/privacy), [JS 설정](https://posthog.com/docs/libraries/js/config).
- [RN 공식 스킬](https://github.com/PostHog/skills/blob/main/skills/posthog/all/skills/error-tracking-react-native/SKILL.md), [오류 설치](https://posthog.com/docs/error-tracking/installation/react-native), [소스맵 업로드](https://posthog.com/docs/error-tracking/upload-source-maps/react-native).

## 의존성

웹은 posthog-js 1.455.4·@posthog/react 1.11.3을 고정한다. React 19.3.0은 양쪽 peer 범위를 충족한다.
iOS 후보는 posthog-react-native 4.87.3·@posthog/react-native-plugin 2.13.3이며 해당 단계에서 Expo 호환과 출시 기간을 검증한다.
기존 Expo file-system·constants를 재사용하고 필요한 application·device·localization만 추가한다. CLI도 고정한다.
공급망 보호는 유지한다. core-js 3.51.0의 postinstall을 직접 확인했으며 후원 안내만 출력하므로 해당 버전만 명시적으로 차단하고 버전 변경 시 재검토한다.
스킬의 자동 대시보드 생성 등 범위 밖 예시는 실행하지 않는다. 실제 프로젝트·키 설정은 해당 단계에서 수행한다.
