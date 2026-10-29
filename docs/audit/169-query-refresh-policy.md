# 관리자 재조회 정책과 기능별 확인 기준 기록

발견 ID: C06. 관련 이슈: #169.

## 현재 정책

관리자는 `staleTime: 30_000`, `retry: false`, `refetchOnMount: false`,
`refetchOnWindowFocus: false`, `refetchOnReconnect: false`를 사용합니다. 30초가 지나도
타이머가 자동으로 네트워크 요청을 보내는 구조가 아닙니다. Web Provider의 설정과는 다릅니다.
현재 세션은 브라우저 메모리 예시 저장소이며 다른 관리자가 공유하는 실제 서버 데이터가 아닙니다.

공지·세션은 저장 mutation 성공 시 목록 invalidation을 사용합니다. 비활성 공지 목록은 #140,
삭제 후 목록 실패는 #143, 세션 저장·재조회 경합은 #152에서 각각 다룹니다. 이 변경은 다른
사용자가 서버에서 수정한 내용을 자동으로 전달하는 기능이 아닙니다.

## 원격 API 연결 시 결정할 표

| 화면        | 확인할 선택                       | 완료 기준                                  |
| ----------- | --------------------------------- | ------------------------------------------ |
| 목록 재방문 | mount 재조회 또는 명시적 새로고침 | 다른 관리자의 수정이 합의한 시점에 보임    |
| 탭 복귀     | focus 재조회 허용 여부            | 편집 초안을 덮지 않고 목록 최신 상태 안내  |
| 재연결      | reconnect 재조회 허용 여부        | 오프라인 상태를 벗어난 뒤 갱신 가능        |
| 상세·편집   | 서버 변경 감지와 충돌 안내        | 서버 갱신이 사용자 입력을 조용히 덮지 않음 |
| 캐시 회수   | gcTime과 계정 수명                | 재방문과 로그아웃의 데이터 보존 범위 일치  |

정책을 바꿀 때는 전체 앱 기본값보다 실제 서버 소비 화면의 query 옵션부터 검토합니다. 두
관리자 A·B를 사용해 A 수정→B 재방문/탭 복귀/재연결을 각각 측정하고 요청 횟수·표시 시간을
기록합니다. 로컬 메모리 예시에서 이를 실제 다중 관리자 검증으로 대신하지 않습니다.

관련: #107, #140, #143, #152, #167.

## 근거와 완료 판정

기준: `e0d4bf92f007c075b53adc0938d9abe5e8ba4572`.

- [apps/admin/src/query-client.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/query-client.ts)
- [apps/admin/src/pages/sessions/model/session-queries.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/pages/sessions/model/session-queries.ts)
- [apps/admin/src/features/notice-management/model/notice-queries.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/features/notice-management/model/notice-queries.ts)

이번 PR은 확인된 현재 상태와 후속 검증 기준을 기록합니다. 미실행 항목을 통과로 처리하지 않으며,
이슈는 실제 완료 조건을 충족할 때 닫습니다. dots 보고서의 재현은 기존 검증이며 아래 신규 확인과
구분합니다.
