# 조사와 결정

## 확인 기준

- 2026-11-10 최신 main `d8dfd4862bb2f739bba8bdc8d022304f5ce305cd`로 fast-forward했다. 브랜치는 유지했다.
- [Android 855e111](https://github.com/YAPP-admin/yapp-plus-android/tree/855e111f34d2e6df1f23a5ea72682081a82fd8a3): HomeNotificationsViewModel, PushRegistration, NotificationSettingsRoute, FirebasePushEnvironment, YappMessagingService와 제품 정책을 확인했다.
- [백엔드 e2c2612](https://github.com/YAPP-admin/yapp-plus-backend/blob/e2c2612a8652dc9c76f6ce7b6c26e97dbe8348c6/APIDOC.md): 알림함·기기 등록·로그아웃·FCM payload를 확인했다. private backend는 connector 404 뒤 읽기 전용 gh api로 확인했다.
- 최신 main의 SDK에서 알림은 find3, find2는 프로필이다. register/remove는 유지된다. 별도 API 재생성은 필요하지 않다.
- #412 종료와 main의 VITE_STATIC_CONTENT=false를 확인했다. 배포 웹 실서버 연결은 이번 조사에서 검증하지 않았다.
- 최신 main에도 AuthActions.signOut은 로컬 삭제 후 revoke하며 예외를 무시한다. revoke의 error 응답도 성공으로 오인하지 않도록 5단계에서 처리한다.
- npm registry latest를 재조회했다: app/messaging/installations 모두 27.1.0. 설치 직전 다시 확인한다.
- `.specify/extensions.yml`·preset override가 없어 specify/plan/tasks 전후 hook은 해당 없다. 기본 템플릿을 사용했다.

## 선택과 대안

| 결정                               | 근거                                                             | 제외한 대안                             |
| ---------------------------------- | ---------------------------------------------------------------- | --------------------------------------- |
| React Native Firebase만 사용       | 서버는 FCM token·FID를 요구, 현재 기능에 수신·표시·탭 API로 충분 | Expo 병용·APNs/Expo 서버 발송 추가      |
| 설치 선택과 OS 권한 분리           | Android 구현·사용자 선택, 다른 기기에 영향 없음                  | 계정 전체 동의 API 발명                 |
| 서버 성공 후 선택 저장             | Android와 동일, 실패 시 허위 성공 방지                           | 낙관적 토글                             |
| 서버 성공 후 로그아웃              | 사용자 명시 선택, 기존 동작 변경                                 | 오프라인 로컬 로그아웃 유지             |
| 일반 푸시는 알림함                 | 사용자 명시 선택                                                 | Android의 홈 이동 그대로 적용           |
| 최신 안정 버전 확인 후 정확히 고정 | 최신 사용 요구와 재현성 동시 충족                                | floating latest·서로 다른 Firebase 버전 |
| 목록·설정은 각 페이지 소유         | 다른 실제 소비자 없음                                            | 새 전역 store·공용 패키지               |

## SDK·외부 설정 근거

- [Expo notifications](https://docs.expo.dev/versions/latest/sdk/notifications/): iOS의 native token은 APNs이며 FCM token과 다르다. Expo로 수신 UI를 처리하는 병용은 가능하지만 이번에는 사용하지 않는다.
- [React Native Firebase 설치](https://rnfirebase.io/): Expo development build·config plugin, 최신 SPM 구성의 dynamic frameworks.
- [Messaging](https://rnfirebase.io/messaging/usage): 토큰·권한·수신·탭·iOS foreground 표시. [Installations](https://rnfirebase.io/installations/usage): Firebase Installation ID.
- [app latest](https://registry.npmjs.org/@react-native-firebase%2Fapp/latest), [messaging latest](https://registry.npmjs.org/@react-native-firebase%2Fmessaging/latest), [installations latest](https://registry.npmjs.org/@react-native-firebase%2Finstallations/latest).
- 사용자는 Firebase iOS·APNs 미준비로 답했다. 외부 설정과 실제 수신은 구현 완료와 구분한다.
- iOS 앱은 org.yapp.yappplus이며 Android는 별도 저장소다. 패키지 설치·Expo Go·실제 iPhone 검증을 혼동하지 않는다.
