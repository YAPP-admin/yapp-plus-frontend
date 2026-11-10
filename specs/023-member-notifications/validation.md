# 1단계 검증 기록

- 작성일: 2026-11-10. 실제 브랜치: `DongjaJ/android`.
- 승인된 main 반영: `7bd77d09` → `d8dfd4862bb2f739bba8bdc8d022304f5ce305cd`, fast-forward 완료.
- 기준 origin/main도 같은 SHA다. 브랜치 생성·전환·이름 변경·commit·push·PR·이슈 생성은 하지 않았다.
- 범위: Spec Kit 문서·이슈 초안. 제품 코드·의존성 선언·lockfile 변경은 없다.
- `.specify/feature.json`은 gitignored 로컬 포인터이며 023-member-notifications로 설정했다.
- setup-plan의 BRANCH 출력은 feature 이름을 추론한 값이다. 실제 git 브랜치는 변경하지 않았다.

## 수행한 검증

| 항목                            | 결과·실행 구분                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------- |
| main·작업 트리 확인             | 새 실행: fetch·fast-forward·HEAD 대조, 기존 사용자 변경 없음                     |
| Firebase 최신 안정 버전         | 새 조회: app/messaging/installations 모두 27.1.0; 설치 직전 재확인 정책          |
| 이슈 검색                       | 새 조회: 열린 알림/notification 전용 이슈 없음; #385·#178은 별도 범위            |
| Spec Kit 설정·템플릿            | 새 실행: spec-template 해석, setup-plan, setup-tasks, check-prerequisites 통과   |
| 전후 hooks                      | extensions.yml 없음: specify/plan/tasks hooks 해당 없음                          |
| 문서 포맷                       | 새 실행: 신규 문서 oxfmt 및 루트 format:check 통과                               |
| lint                            | Turbo 캐시 재사용: 7/7 성공                                                      |
| typecheck                       | Turbo 캐시 재사용: 7/7 성공                                                      |
| test                            | Turbo 캐시 재사용: 5/5 성공; 146개 파일·1,297개 테스트 로그, 이번 신규 실행 아님 |
| node --run check                | 통과; 세 하위 Turbo 작업의 결과는 위 캐시 구분을 따른다                          |
| 문서 링크·placeholder·작업 번호 | 새 실행: 내부 링크 유효, 미치환 템플릿 없음, T001~T042 연속·경로 포함            |
| 기본 diff 공백 검사             | 새 실행: git diff --check 통과; 신규 파일은 별도 포맷·줄 수 검사                 |

고정 pnpm 실행 시 기존 lockfile의 로컬 의존성이 캐시에서 복원되었다. 새 패키지를 추가하거나
버전을 바꾸지 않았다. check 로그는 gitignored `.context/notifications-stage1-check.log`에 있다.

## 계약 교차 검토

백엔드 조사 에이전트가 문서를 읽기 전용으로 검토했다. 성공 상태·FID/FCM·payload 식별자·날짜/커서는
일치한다. 이전 refresh token의 revoke 204 무동작 위험을 plan·계약·Q06·T027에 반영했다.
이는 이미 합의한 단계 5의 실행 순서를 구체화한 것이며 별도 기능 범위 추가가 아니다.

## 미실행과 남은 위험

- build·expo:doctor·iOS 빌드: 문서만 변경한 단계이므로 미실행. 제품 구현 단계에서 필수 항목을 실행한다.
- 실제 회원 API·기기 PUT/DELETE·푸시 발송·TestFlight·VoiceOver: 미실행. 단위 캐시 통과로 대체하지 않는다.
- Firebase iOS·APNs·서버 환경 연결은 아직 준비되지 않았다. 실제 수신 가능성을 확인하지 않았다.
- GitHub 이슈 [#417](https://github.com/YAPP-admin/yapp-plus-frontend/issues/417)을 생성했고 사용자가 1단계 검토와 다음 진행을 승인했다.

## 변경량과 리뷰

기준은 origin/main `d8dfd486`이다. 신규 문서 10개 전체를 포함해 추가 569줄·삭제 0줄이다. 합계 650줄 미만으로 1단계 분리는 필요 없다.
main fast-forward로 들어온 기존 48개 파일은 이번 알림 변경량에 중복 합산하지 않는다.
리뷰 대상: 범위·로그아웃 합의·최신 버전 정책·기기/계정 수명·단계별 검증과 외부 준비 조건.
