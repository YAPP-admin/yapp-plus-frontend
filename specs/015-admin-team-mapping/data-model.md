# 화면 데이터와 초안

## 원본 입력

앱 내부 readonly 타입과 Zod를 사용한다. API DTO와 같은 이름·호환성을 약속하지 않는다.

| 개체                    | 필드와 관계                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------- |
| TeamMappingSnapshot     | generation 양의 정수, status before/draft/confirmed, members, teams, 선택 confirmation  |
| TeamMappingMember       | activityId 문자열, name, part, previousGenerations 읽기 전용 배열                       |
| TeamMappingTeam         | id 문자열, name, serviceName 문자열 또는 null, memberActivityIds, 선택 leaderActivityId |
| TeamMappingConfirmation | confirmedAt ISO 시각, actorName 합성 표시명                                             |
| CreateTeamDraft         | name, serviceName, 선택 activityIds; 최초 빈 값과 비교                                  |
| TeamMemberChange        | activityId, destinationTeamId 문자열 또는 null(미배정 예정)                             |

직군은 현재 화면의 pm/design/android/ios/web/server를 사용한다. 서버의 MOBILE·AI_NATIVE 등으로 확장하지 않는다.
멤버는 이미 대상 기수 후보로 선정된 입력이다. 기존 회원 role/status를 해석해 자격을 추측하지 않는다.
소속은 team.memberActivityIds만 원천으로 삼고 후보에 별도 currentTeam 값을 중복 저장하지 않는다.

## 입력 불변식

- 회원 활동 ID·팀 ID는 각각 유일하며 소속 참조는 존재해야 한다. 같은 활동은 최대 한 팀에 속한다.
- 팀장 ID는 해당 팀 소속이어야 한다. 팀장 부재는 구성 경고 조건이 아니다.
- 기존 팀의 원본 인원은 1명 이상이다. before는 teams가 비며 draft/confirmed는 팀이 존재한다.
- confirmed의 대표 fixture에는 확인 가능한 합성 확정 이력을 제공한다. 시간은 고정값을 사용한다.
- 합계·미배정·현재 소속·직군 수는 원본에서 계산한다. PM·Design 누락 여부는 별도 상태로 계산하지 않는다. 표시 순서는 입력 순서를 유지한다.

## 초안과 변경 예정

변경 예정은 활동 ID당 하나다. 원본 소속과 같은 대상을 선택하면 해당 예정은 제거한다.
현재 패널·미배정 화면·생성 폼마다 독립적인 작업 범위를 가지며 다른 작업으로 이동하면 폐기 정책을 적용한다.
패널 원본 행과 배경 목록에는 예정 값을 쓰지 않는다. 별도 영역에 이름·원래 팀·대상 또는 제외를 표시한다.

검증 시 원본의 영향 팀 인원에 현재 작업의 모든 이동·추가·제외를 한 번씩 적용한다.
기존 팀 중 하나라도 0명이 되면 그 조작을 채택하지 않는다. 예정 취소도 같은 검증을 하며 전체 취소는 허용한다.
생성 폼은 선택 회원의 원래 팀에서 빠질 인원을 합산하고, 새 팀의 선택 인원도 1명 이상인지 검사한다.
검증 결과는 표시 가능한 사유로 반환하고 데이터를 변경하거나 성공 상태를 만들지 않는다.

## 상태 전이

- preview 변경: before/draft/confirmed의 원본 입력을 교체한다. 변경이 있으면 이탈 확인을 먼저 거친다.
- confirmed 조회 → 화면 편집 → 조회: 원본 status·confirmation은 유지한다. 편집 종료 시 예정 폐기 확인을 거친다.
- 생성 입력·패널 예정·미배정 예정: 메모리에서 변경 → 원복 또는 폐기. 저장·확정 전이는 없다.
- 검색·체크: dirty가 아니다. 생성 값 변경·배정 예정은 dirty이며 원복하면 false가 된다.
