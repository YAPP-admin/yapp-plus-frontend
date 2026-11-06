# 조사와 결정 근거

## 확인 기준

- 로컬 HEAD: `1fb900f835f2294c73767fd172bb7667d8faac4b`.
- fetch한 origin/main: `9186dc6b0883003f7a025cd3a6cd04899eddfb3a`. 설정 약관 링크 변경만 1커밋 뒤이며 작업 트리는 깨끗했다.
- 기존 홈은 고정 주간 날짜·세션명·모의 출석 성공 흐름, 일정은 DEFAULT_SCHEDULES를 사용한다.
- native 인증 provider는 Query에 인증 결과를 저장한다. mutation 결과는 setQueryData로 반영하지만 전체 clear는 없다.
- 기존 native-auth에는 refreshSession 브리지 래퍼가 있으나 웹 업무 조회의 401 재요청 연결은 없다.
- 생성 find3Options/find4Options는 throwOnError: true를 강제한다. HTTP status를 보존하는 수동 queryFn에서 SDK의 fields 결과를 사용한다.
- 이번 주와 현재 기수 조회 SDK·Zod·MSW 기반은 이미 생성돼 있다. 이번 주 응답에는 type·endTime이 없다.
- 과거 인증 tasks의 완료 체크만으로 현재 업무 요청 연결을 완료로 간주하지 않고 현재 소스를 기준으로 했다.
- 별도 읽기 전용 계약 검토에서도 인증 query 재구독, 실패 결과 분리, mutation callback 무효화, Stack 인스턴스 수명, bigint·시간 검증을 확인했다.

## 결정과 대안

| 결정                               | 이유                                                | 채택하지 않은 대안                  |
| ---------------------------------- | --------------------------------------------------- | ----------------------------------- |
| 홈은 이번 주 API만 사용            | 사용자 승인한 Android 조회 구조, 불필요한 결합 방지 | 전체 일정으로 type을 보완           |
| 일정 서버 순서·null 장소 `-`       | Android와 동작 정합성                               | 날짜 재정렬·팀별 장소 추론          |
| 한국 시간·분 표시                  | 사용자가 승인한 정확성 보완                         | 기기 시간대와 시 단위만 표시        |
| 전체 query·mutation clear          | 사용자의 명시적 정책                                | 세션 관련 query만 삭제              |
| 같은 로그인 토큰 갱신 시 캐시 유지 | 사용자가 초기화 범위를 계정 전환으로 한정           | 모든 401 갱신 후 clear              |
| native 브리지 갱신                 | 기존 보안·토큰 저장 계약                            | 웹 refresh token 또는 직접 갱신 API |
| 요청별 auth                        | 전역 singleton에 사용자 자격을 남기지 않음          | 매 로그인마다 전역 SDK 설정 변경    |
| 웹 로컬 MSW override               | 이번 작업의 소비자인 웹에 고정 예시 추가            | 공용 생성 faker·handler 직접 수정   |
| 미연동 기능 비활성화               | 실데이터와 모의 성공의 혼동 방지                    | 실서비스 모의 출석 성공 유지        |

## 출처

- [제품 맥락](../../docs/mission.md), [웹 가이드](../../docs/web-development.md).
- [기능명세서 APP 시트](https://docs.google.com/spreadsheets/d/1K-2VwMPkoT8kq-bujUIMetTPKal11Iql2GUmMd1M7eE/edit): 앞선 계획 과정에서 CSV 원문 확인.
- [Android 조회](https://github.com/YAPP-admin/yapp-plus-android/blob/2b837e3cb21762c6a73f1db205be6a3ef2749a97/data/src/main/java/com/yapp/plus/data/session/SessionScheduleRemoteDataSource.kt).
- [Android 일정 표시](https://github.com/YAPP-admin/yapp-plus-android/blob/2b837e3cb21762c6a73f1db205be6a3ef2749a97/feature/main/schedule/src/main/java/com/yapp/plus/feature/main/schedule/model/SessionScheduleUiMapper.kt).
- [Android 홈 카드](https://github.com/YAPP-admin/yapp-plus-android/blob/2b837e3cb21762c6a73f1db205be6a3ef2749a97/feature/main/home/src/main/java/com/yapp/plus/feature/main/home/components/HomeSessionCard.kt).
- [기존 인증 계약](../../specs/016-ios-oidc-auth/contracts/auth.md), [탐색 계약](../../docs/webview-navigation-contract.md).

## 관련 이슈와 경계

열린 이슈를 세션·일정·캐시로 검색했다. 같은 회원용 조회 기능 이슈는 찾지 못했다.
[계정 격리 #167](https://github.com/YAPP-admin/yapp-plus-frontend/issues/167)은 SSR까지 포함한 조사이며 이 작업은 웹 계정 전환 부분만 관련된다.
[관리자 #152](https://github.com/YAPP-admin/yapp-plus-frontend/issues/152)와 [#178](https://github.com/YAPP-admin/yapp-plus-frontend/issues/178)은 관리자 세션 관리 범위다.
이 이슈들을 변경·종료하거나 이번 작업의 기준 이슈로 임의 지정하지 않는다.

## 남은 검증

제품 결정에 미확정 항목은 없다. 실제 사용자 세션의 CORS, 기기 복귀 이벤트, native 갱신 연결은 구현 후 실환경 검증 대상이다.
외부 실환경 검증이 미실행이면 기능 연동 완료로 보고하지 않는다. 새로운 토큰·기기 설정이나 native 계약 추가로 범위를 확대하지 않는다.
