# 알림 PR 분리 결과

기존 구현을 검토 가능한 크기로 분리했습니다. 각 PR은 바로 앞 브랜치를 base로 사용하며, 첫 PR은 main을 대상으로 합니다.

## 검토 순서

| 단계 | 브랜치                                       | 변경 줄 수 | 목적                                                    |
| ---- | -------------------------------------------- | ---------: | ------------------------------------------------------- |
| 00   | `DongjaJ/notifications-00-expo-patch`        |        266 | fix(mobile): Expo 필수 검사에 맞춰 패치 버전 갱신       |
| 01   | `DongjaJ/notifications-01-spec`              |        591 | docs(notifications): 알림 기능 요구사항과 검증 계획     |
| 02   | `DongjaJ/notifications-02-data`              |        159 | feat(alerts): 알림 목록 데이터와 조회 테스트            |
| 03   | `DongjaJ/notifications-03-list`              |        396 | feat(alerts): 실제 알림함 화면과 상세 탐색              |
| 04a  | `DongjaJ/notifications-04a-firebase-core`    |        754 | feat(mobile): Firebase 앱 기반과 새 runtime 추가        |
| 04b  | `DongjaJ/notifications-04b-firebase-push`    |        145 | feat(mobile): Firebase 푸시 SDK와 iOS 표시 설정         |
| 05   | `DongjaJ/notifications-05-auth`              |        597 | fix(auth): 세션 요청 경계와 서버 성공 후 로그아웃       |
| 06   | `DongjaJ/notifications-06-device-api`        |        469 | feat(notifications): 설치별 선택 저장과 기기 API        |
| 07   | `DongjaJ/notifications-07-registration`      |        538 | feat(notifications): 기기 등록 직렬화와 실패 복구       |
| 08   | `DongjaJ/notifications-08-registration-sync` |        311 | feat(notifications): 세션과 기기 등록 동기화            |
| 09   | `DongjaJ/notifications-09-contracts`         |        133 | feat(bridge): 알림 설정과 푸시 탐색 스키마              |
| 10   | `DongjaJ/notifications-10-settings-bridge`   |        559 | feat(notifications): 네이티브 설정 RPC와 등록 연결      |
| 11   | `DongjaJ/notifications-11-settings-ui`       |        489 | feat(notifications): 설정 화면에 수신 선택 연결         |
| 12   | `DongjaJ/notifications-12-push-state`        |        271 | feat(notifications): 푸시 대상과 중복 수신 상태 관리    |
| 13   | `DongjaJ/notifications-13-push-runtime`      |        463 | feat(notifications): Firebase 수신과 탭 브리지 연결     |
| 14   | `DongjaJ/notifications-14-web-navigation`    |        460 | feat(notifications): 웹 푸시 탐색과 목록 갱신           |
| 15   | `DongjaJ/notifications-15-flow-docs`         |        362 | docs(notifications): 알림 구현 흐름과 설계 이유         |
| 16   | `DongjaJ/notifications-16-validation-docs`   |        570 | docs(notifications): 검증 이력과 TestFlight 미검증 범위 |

마지막 `DongjaJ/notifications-17-pr-plan` PR은 이 분리 기록만 추가합니다. 모든 변경량은 실제 base 대비 추가·삭제 합계이며 lockfile과 문서도 포함합니다.

## Expo 선행 변경과 네이티브 호환성

필수 CI의 Expo Doctor 실패를 해결하기 위해 expo 58.0.25, expo-dev-client 58.0.20, expo-location 58.0.22를 별도 선행 PR로 적용했습니다. Expo 선행 단계의 appVersion runtime은 1.0.4, Firebase app 추가 단계는 1.0.5, 푸시 SDK와 네이티브 설정 단계는 1.0.6입니다. 각 네이티브 구성을 서로 다른 runtime으로 구분하므로 새 네이티브 빌드가 필요합니다.

## 검증과 남은 작업

- 모든 단계에서 `node --run check`를 실행했습니다. Turbo 캐시 재사용 여부는 각 PR 본문에 기록합니다.
- 제품 코드와 빌드 설정 단계에서는 `node --run build`를 실행했습니다. 문서만 변경한 단계에서는 빌드를 반복하지 않았습니다.
- Expo와 Firebase 의존성 단계에서 `node --run expo:doctor`가 20/20 통과했습니다.
- 재구성된 최신 Expo 조합의 새 iOS 네이티브 빌드와 실제 FCM/APNs 수신·탭 검증은 아직 수행하지 않았습니다. 사용자 결정에 따라 TestFlight에서 확인합니다.
- 과거 시뮬레이터 관찰과 자동 테스트는 실제 푸시 검증을 대신하지 않습니다. 상세 검증 이력은 validation.md를 확인합니다.

## 이력과 복구

원본 `DongjaJ/android` 브랜치와 구현 커밋 `eacc0dba`를 보존했습니다. 최신 main을 기반으로 별도 브랜치에 재구성했고 원본 원격 이력을 강제로 덮어쓰지 않습니다. 기존 초안 #425와 #426은 새 스택으로 대체합니다. 관련 이슈 #417은 TestFlight 검증이 남아 있으므로 자동으로 닫지 않습니다.

PR은 Draft 상태로 생성하며 merge 또는 프로덕션 배포는 포함하지 않습니다. 변경을 취소할 때는 해당 PR의 변경을 되돌리고, 네이티브 구성이 달라졌다면 호환되는 runtime으로 새 빌드를 배포해야 합니다. 선행 PR이 병합되면 후속 PR의 base와 누적 diff를 다시 확인합니다.
