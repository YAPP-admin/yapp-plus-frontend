# 독립 ViewModel과 입력 모델 설계

[명세](spec.md) · [계약 초안](contracts/attendance-api.md)

이 문서의 이름과 값은 프런트엔드가 직접 소유하는 설계다. API DTO의 별칭이 아니다. 2-1단계에서 AttendanceResult·PriorReportViewModel·BadgeViewModel과 감점 계산을 구현했다. 나머지는 후속 구현 설계다.
API 타입의 import·상속·Pick/Omit·indexed access를 금지한다. 문자열 값이 같아도 각 경계에서 명시적으로 변환한다.

## 공통 표현

- ID는 화면에서 불투명 문자열로 다룬다. API의 숫자 변환은 adapter에서 안전한 정수 범위를 검증한다.
- 시각은 오프셋을 포함하는 ISO 문자열 또는 null이다. 표시 시각대는 Asia/Seoul로 고정한다.
- 모르는 값은 null 또는 명시적인 unknown으로 남긴다. 미조회와 빈 목록을 혼동하지 않는다.
- `ReportType`: late / earlyLeave / absence. 미지원 서버 값은 보고 유형에 끼워 넣지 않고 변환 오류로 다룬다.
- `AttendanceStatus`: undecided / present / late / earlyLeave / absent / unsupported.
- `PenaltyCategory`: regular / unauthorized / unknown. 출석·미정은 null이다.
- `DurationBand`: withinOneHour / withinThreeHours. 1시간 초과 3시간 이내가 두 번째 구간이다.
- `SessionPhase`: open / closed / unknown. 서버가 마감 여부를 주지 않으면 open으로 단정하지 않는다.
- `ReviewState`: notSubmitted / pending / approved / rejected / unknown.
- `PhotoAccess`: available / unavailable. 검수 상태와 독립이며 URL 유무만으로 제출 여부를 판단하지 않는다.

## 조회 모델

| 모델                       | 핵심 필드와 제약                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| AttendanceSessionViewModel | id, generationId, title, type(offline/team), startsAt, endsAt, phase, canCancelClose, summary                   |
| AttendanceSummary          | total, present, late, earlyLeave, absent, undecided, reported; 전체 세션 기준, reported는 중복 가능한 보조 집계 |
| AttendanceMemberViewModel  | membershipId, name, part, teamId?, attendance, latestReport?, badge, score, isEditable                          |
| AttendanceResult           | status, penaltyCategory, durationBand?, checkedInAt?, earlyLeaveAt?, reason?, explicitlyOverridden              |
| PriorReportViewModel       | id, membershipId, type, reason, submittedAt?, eligibility(eligible/ineligible/unknown)                          |
| BadgeViewModel             | verified, verifiedAt?; 출결·감점에 대한 부수 효과 없음                                                          |
| AttendanceScoreViewModel   | delta: number 또는 null, source(calculated/server/unknown), 설명; null을 0점으로 표시하지 않음                  |
| AttendanceHistoryEntry     | id, membershipId, changedAt?, actorName?, before, after, reason?; 보고 이력과 구분                              |
| TeamReviewViewModel        | teamId, teamName, members, reviewState, photo?, decisionDraft?                                                  |
| TeamPhotoViewModel         | photoId, uploaderName?, submittedAt, readUrl?, access; selectedMembershipIds                                    |
| MemberScoreViewModel       | membershipId, name, initialScore(100), attendanceEntries, adjustmentEntries, totalScore, warning                |
| ScoreAdjustment            | id, kind, delta, description; 회비·면제 등 기존 기여의 읽기 전용 표현                                           |
| AttendanceCodeViewModel    | state(notIssued/active/expired), code?, expiresAt?                                                              |

출결 집계는 회원당 하나의 상태만 센다. 미지원 상태가 있는 실제 응답은 합계를 왜곡하지 않게
변환 경계에서 명시적으로 처리하고 마감을 막는다. 이번 모의 데이터에는 공결·복합 상태를 편집 가능한 상태로 넣지 않는다.
보고의 최신 유형만 있는 응답으로 전체 이력을 만들지 않는다. 사진 미제출 팀은 전체 팀 명단과 제출 목록의 차이로 구한다.
누적 점수의 경고는 totalScore < 40이다. 음수 합계의 하한 등 미확정 정책은 실제 연동 전에 계약으로 확정한다.

## 입력과 초안

| 모델                 | 입력과 검증                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| AttendanceEditInput  | membershipId, status, penaltyCategory?, durationBand?, reason?; 수정 가능한 5개 상태만 허용 |
| BadgeEditInput       | membershipId, verified; 출결 상태를 포함하지 않음                                           |
| TeamDecisionInput    | photoId, decision(approve/reject), reason?; 서버 확인 기준 사유 최대 500자                  |
| AttendanceDraft      | sessionId, memberEdits, badgeEdits, teamDecisions; 변경한 항목만 ID별 보관                  |
| CloseAttendanceInput | sessionId, draft; 현재 필터·페이지를 대상 범위로 받지 않음                                  |

지각·조퇴는 시간 구간과 일반/무단 구분이 필요하고 결석은 일반/무단 구분이 필요하다.
출석·미정을 선택하면 이전 감점 구분과 시간 구간 입력을 제거한다. 상태를 바꾸더라도 보고와 명찰은 보존한다.
사전 보고 적격성이 unknown이면 자동으로 일반 결석 처리하지 않는다. 모의 데이터는 이 경로를 오류 시나리오로 둔다.
시간 구간 선택을 API의 실제 시각으로 임의 변환하지 않는다. 실제 연결에는 별도의 입력 계약이 필요하다.

## 상태 전이와 소유권

```text
조회 결과 + 수정 초안 → 편집 화면
open → 변경 반영 중 → 마감 중 → closed
           ↓ 실패       ↓ 실패
       실패 초안 유지   마감만 재시도 또는 사진 재검수
closed → 마감 취소 중 → open (모의 정책: 결과·점수 보존)
```

Query 결과를 직접 수정해 초안으로 사용하지 않는다. 필터 변경에도 동일 세션 초안은 유지한다.
세션 변경·화면 이탈은 미반영 초안을 확인한다. 모달 닫기는 해당 입력만 취소하며 이미 반영된 결과를 되돌리지 않는다.
작업별 pending/error 상태와 성공한 항목을 보관한다. 서버 반영 성공 후 재조회 실패는 마감 실패와 구분한다.
동시에 변경된 서버 상태를 발견하면 자동 덮어쓰기 대신 최신 결과를 확인하고 초안을 다시 적용한다.

## API 경계와 모의 데이터

미래 adapter는 공개 `@yapp-plus/api/generated`에서만 SDK/DTO를 가져온다.
외부 응답을 검증한 뒤 status, ID, nullable 필드와 날짜를 하나씩 매핑한다. 타입 단언으로 계약 누락을 숨기지 않는다.
DTO가 없는 기능을 가짜 API 응답 필드로 채우지 않는다. 모의 서비스는 독립 모델을 직접 반환한다.
조회 결과에 필요한 보고 시각·마감 상태·일반/무단 근거·이력은 모의 확장임을 fixture에서 명시한다.
실제 adapter가 도입될 때 null·미지원 enum·잘못된 ID·부분 페이지·시간 누락을 변환 테스트로 검증한다.
