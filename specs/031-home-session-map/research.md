# 조사와 결정

## 확인 기준

- 작업 시작 시 작업 트리는 깨끗했다. 실제 브랜치와 기준 SHA는 [plan.md](plan.md)에 기록했다.
- 기존 홈은 장소명만 표시하고 항상 “이번 주” 제목을 사용한다. API는 nullable 위도·경도를 제공한다.
- iOS 셸은 외부 URL을 `Linking.openURL`로 넘기지만 실패 처리가 없다.
- origin/main에는 홈 로딩 접근성·스켈레톤 개선과 iOS 링크 미리보기 비활성화가 추가돼 있다.
- 열린 이슈를 “홈”, “카카오”, “지도”로 조회했다. #501은 출석 연결, #622는 팀 결과 안내이며
  이번 표시 정합성·지도 연결과 동일한 이슈는 없어 [이슈 초안](issue-draft.md)을 준비했다.
- `.specify/extensions.yml`이 없어 specify·plan·tasks의 실행 전후 확장 훅은 없다.
  기본 템플릿을 사용하며 feature 경로와 실제 브랜치 이름은 별개다.

## 결정과 대안

| 결정                                 | 근거                                     | 채택하지 않은 대안            |
| ------------------------------------ | ---------------------------------------- | ----------------------------- |
| HTTPS 링크를 셸에서 앱 실행으로 변환 | 브라우저·구버전 셸에도 지도 링크가 남음  | 신규 브리지 RPC               |
| 앱 실행 실패 시 HTTPS 한 번 실행     | 미설치·실행 실패를 같은 복구 경로로 처리 | 웹 타이머로 설치 추정         |
| `openURL` 직접 실행                  | 설치 여부 조회 설정을 추가하지 않음      | `canOpenURL` 및 iOS 설정 변경 |
| 앱별 작은 변환 함수                  | 서로 다른 경계와 결과를 소유함           | 미래 사용처용 공용 패키지     |
| 기존 출석·팀 사진 흐름 보존          | 사용자 명시 결정                         | 안드로이드 동작 전체 복제     |

`Linking.openURL`은 앱 미설치 외에 열기 취소도 reject할 수 있으므로 실패를 “미설치”라고
단정하지 않는다. HTTPS도 실패하면 사용자 안내 후 홈을 유지한다.

## 출처

- [Android 홈 카드](https://github.com/YAPP-admin/yapp-plus-android/blob/8cbf4b83ff8e676cef1ab6ea5cb3f8b321f23f43/feature/main/home/src/main/java/com/yapp/plus/feature/main/home/components/HomeSessionCard.kt)
- [Android 달력](https://github.com/YAPP-admin/yapp-plus-android/blob/8cbf4b83ff8e676cef1ab6ea5cb3f8b321f23f43/feature/main/home/src/main/java/com/yapp/plus/feature/main/home/components/HomeWeekCalendar.kt)
- [카카오 HTTPS 지도 링크](https://apis.map.kakao.com/web/guide/#mapurl), [iOS 스킴](https://apis.map.kakao.com/ios_v2/docs/getting-started/urlscheme/)
- [React Native Linking](https://reactnative.dev/docs/0.88/linking#openurl)
- [Apple canOpenURL 제한과 open 예외](<https://developer.apple.com/documentation/uikit/uiapplication/canopenurl(_:)>)
- 이전 계획 조사에서 Modern Web Guidance 1.0.0의 `icons`, `accessibility`를 조회했다.
  구현 시 기존 아이콘 사용, 장식 SVG 숨김, 링크 이름·포커스·터치 영역 기준을 적용한다.
