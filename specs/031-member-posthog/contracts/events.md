# 이벤트 계약

## 출처와 표기

원문: [이벤트 트래킹 설계](https://app.notion.com/p/yapp-workspace/4212106a0e8480b684ebe0beb6f8c7d6?source=copy_link).
노션 내보내기 대신 사용자가 제공한 2026-11-28 16:56:37·45·51·58 스크린샷 4장을 확인했다. 원문 우선순위는 P0 14개·P1 17개·P2 9개다.
아래는 원문 이름·속성·트리거를 옮기고 별도로 합의된 수정·누락을 명시한 계약이다. S=string, N=number, B=boolean, 없음=사용자 정의 속성 없음.
`대상`은 이번 구현 24개, `보류`는 미구현·서버 책임 16개다. 표의 원문 속성이 모두 현재 전송 가능하다는 뜻은 아니다.

## P0 — 14개

| 이벤트                      | 원문 속성                                                                                                                                                     | 원문 발생 조건                 | 적용                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------- |
| login_completed             | method:S, is_new_user:B                                                                                                                                       | 소셜 인증 완료 후 앱 토큰 발급 | 대상: 아래 합의한 서버 인증 결과 수신 기준으로 정정 |
| signup_step_completed       | step:S                                                                                                                                                        | 각 단계에서 다음 탭 성공       | 대상                                                |
| signup_requested            | 없음                                                                                                                                                          | 승인 대기 화면 최초 진입       | 대상: 이번 가입 제출 성공만                         |
| signup_approved             | wait_minutes:N                                                                                                                                                | 관리자 승인 처리               | 보류: 서버·관리자                                   |
| attendance_submitted        | session_id:S, is_success:B, attempt_count:N, minutes_from_start:N                                                                                             | 코드 제출 응답 수신            | 대상                                                |
| attendance_closed           | session_id:S, session_type:S, result:S, was_reported:B                                                                                                        | 세션 출석 마감 배치            | 보류: 서버                                          |
| team_cert_submitted         | session_id:S, team_id:S, tagged_member_count:N, team_size:N, minutes_from_start:N, is_resubmission:B                                                          | 업로드 성공 응답               | 대상                                                |
| team_cert_reviewed          | session_id:S, team_id:S, result:S, reject_reason_code:S, review_minutes:N                                                                                     | 관리자 승인·반려·결석 처리     | 보류: 서버·관리자                                   |
| attendance_report_submitted | session_id:S, report_type:S, days_before_session:N, is_before_deadline:B, reason_length:N                                                                     | 제출 성공 응답                 | 대상: report_types 배열로 변경 확정                 |
| notice_read_confirmed       | notice_id:S, category:S, hours_since_posted:N, read_seconds:N, scrolled_to_bottom:B                                                                           | 확인 버튼 탭                   | 대상                                                |
| settlement_created          | settlement_id:S, dining_id:S, participant_count:N, per_person_amount:N, is_amount_edited:B, proof_photo_count:N, roster_added_count:N, roster_removed_count:N | 등록 성공 응답                 | 보류: 미구현                                        |
| settlement_list_viewed      | entry:S, pending_count:N, pending_amount:N                                                                                                                    | 보낼 금액 화면 노출            | 보류: 미구현                                        |
| settlement_marked_paid      | settlement_id:S, hours_since_created:N                                                                                                                        | 송금 완료 탭 성공              | 보류: 미구현                                        |
| dining_rsvp_submitted       | dining_id:S, round1:S, round2:S, is_edit:B, hours_before_close:N                                                                                              | 제출 성공 응답                 | 보류: 실제 제출 미연결                              |

## P1 — 17개

| 이벤트                      | 원문 속성                                                                    | 원문 발생 조건                | 적용                                |
| --------------------------- | ---------------------------------------------------------------------------- | ----------------------------- | ----------------------------------- |
| login_failed                | method:S, error_type:S                                                       | 로그인 에러 팝업 노출         | 대상: 취소 제외                     |
| support_contact_clicked     | source_screen:S                                                              | 운영진 문의 버튼 탭           | 대상                                |
| attendance_code_opened      | session_id:S, minutes_from_start:N                                           | 출석 코드 시트 노출           | 대상                                |
| team_cert_started           | session_id:S, team_id:S                                                      | 인증 안내에서 업로드 버튼 탭  | 대상                                |
| team_cert_upload_failed     | error_type:S, file_size_mb:N                                                 | 실패 토스트·팝업 노출         | 대상                                |
| attendance_report_started   | session_id:S, entry:S, days_before_session:N                                 | 출결 보고 미리하기 탭         | 대상                                |
| attendance_report_abandoned | report_type:S, step:S                                                        | 미제출 상태에서 시트 닫기     | 대상: report_types 배열로 변경 확정 |
| notice_opened               | notice_id:S, category:S, source:S, hours_since_posted:N                      | 공지 상세 노출                | 대상                                |
| settlement_create_started   | dining_id:S, existing_settlement_count:N                                     | 정산 입력 화면 노출           | 보류: 미구현                        |
| settlement_account_copied   | settlement_id:S                                                              | 계좌 복사 버튼 탭             | 보류: 미구현                        |
| settlement_status_viewed    | settlement_id:S, paid_ratio:N                                                | 내 정산 현황 화면 노출        | 보류: 미구현                        |
| dining_viewed               | dining_id:S, survey_status:S, source:S                                       | 회식 상세 노출                | 대상                                |
| home_viewed                 | session_state:S, session_type:S, days_to_session:N                           | 홈 노출·앱 전면 복귀          | 대상                                |
| notification_opened         | notification_id:S, notification_type:S, channel:S, minutes_since_sent:N      | 알림 목록 항목 클릭·푸시 열기 | 대상                                |
| my_attendance_viewed        | total_score:N, absence_count:N, is_warning:B                                 | 출석 내역 화면 노출           | 대상                                |
| account_deleted             | days_since_signup:N                                                          | 탈퇴 완료                     | 대상                                |
| study_cert_posted           | study_id:S, week_index:N, photo_count:N, text_length:N, is_first_this_week:B | 등록 성공 응답                | 보류: 미구현                        |

## P2 — 9개

| 이벤트                   | 원문 속성                               | 원문 발생 조건       | 적용                                           |
| ------------------------ | --------------------------------------- | -------------------- | ---------------------------------------------- |
| notice_link_clicked      | notice_id:S, link_type:S                | 공지 내 외부 링크 탭 | 대상                                           |
| settlement_edited        | settlement_id:S, edited_fields:S        | 수정 저장            | 보류: 미구현                                   |
| settlement_paid_reverted | settlement_id:S, seconds_since_marked:N | 되돌리기 탭          | 보류: 미구현                                   |
| schedule_tab_viewed      | 없음                                    | 일정 탭 노출         | 대상: 현재 실제 일정 화면 기준                 |
| attendance_rules_viewed  | source:S                                | 출석 규칙 노출       | 대상: 실제 규칙 콘텐츠만                       |
| logged_out               | 없음                                    | 로그아웃 확인        | 대상: 확인 클릭, reset은 실제 로그아웃 완료 후 |
| study_viewed             | study_id:S, is_member:B                 | 소모임 상세 노출     | 보류: 미구현                                   |
| study_cert_liked         | study_id:S, post_id:S, is_member:B      | 좋아요 탭, 취소 제외 | 보류: 미구현                                   |
| study_comment_posted     | study_id:S, post_id:S, is_post_author:B | 댓글 등록 성공       | 보류: 미구현                                   |

## 확정한 발생·변환 규칙

- login_completed: 직접 signIn의 유효한 서버 결과 수신 시 1회. SIGNUP_REQUIRED는 is_new_user=true, REVIEW_REQUIRED·SIGNED_IN은 false다. method는 google/apple. 소셜 SDK 성공만으로 기록하지 않으며 취소·실패·복원·갱신·가입 정보 후속 제출은 제외한다.
- signup_step_completed: step은 name/phone. 해당 단계 검증 후 다음 단계 또는 성공 결과로 전환할 때 기록한다. 마지막 제출 실패는 완료가 아니다. 회원이 이전 단계로 돌아갔다 다시 완료한 실제 행동은 별도 기록한다.
- signup_requested: 이번 가입 제출 성공으로 첫 승인 대기 진입 시 1회. 기존 대기 회원의 재로그인·재조회·화면 재방문은 제외한다.
- attendance_submitted: 같은 시트의 실제 서버 제출 시작마다 attempt_count를 1부터 증가시킨다. 코드 제출 성공·오류 응답에서 is_success를 기록한다. 로컬 검증·위치 실패는 제외하고 응답 없는 네트워크 오류는 서버 결과로 추정하지 않는다.
- team_cert_submitted: 선택한 참가자 수·조회된 팀 인원 수·기존 인증 유무로 속성을 계산한다. 재시도·재조회는 성공 기록을 추가하지 않는다.
- team_cert_upload_failed·login_failed: 실제 실패 안내를 표시할 때 통제된 오류 분류를 사용한다. raw Error.message·서버 본문·파일 경로를 속성으로 보내지 않는다. 파일 크기는 알 때만 바이트/1,000,000으로 기록한다.
- notice_read_confirmed는 확인 클릭 기준이다. 읽기 시간은 전면의 활성 구간만 초 단위로 누적하며 본문 끝 노출을 boolean으로 기록한다.
- report_abandoned는 성공 전 명시적인 닫기만 기록한다. 성공 후 닫기·앱 백그라운드·입력 단계 이동은 제외한다. 아무 유형도 선택하지 않았으면 유형 속성을 생략한다.
- 진입 경로는 실제 호출 지점에서 전달한다. source·entry·source_screen은 고정된 화면 식별자만 허용하며 URL·문구를 보내지 않는다. 경로를 알 수 없으면 생략한다.
- API가 제공한 category·session_type·notification_type·survey_status는 검증된 코드값을 사용한다. 준비 중 화면·로딩·실패를 성공 노출로 대신 기록하지 않는다.
- minutes_from_start=(행동 시각-세션 시작 시각)/60,000이며 시작 전에는 음수다. 날짜 차이는 한국 시간의 달력 날짜 간 차이로 계산한다. 경고 여부는 기존 화면의 absence_count>=10 판정을 재사용한다.
- home_viewed는 활성 구간당 1회이며 화면 복귀·앱 전면 복귀를 포함한다. session_state는 기존 홈 표시 상태, session_type·days_to_session은 실제 세션이 있을 때만 보낸다.
- account_deleted는 탈퇴 성공 후 식별 초기화 전에 기록한다. 분석 전송 실패로 탈퇴 완료를 막지 않는다.

## 알림 경로와 중복

- channel=in_app: 실제 알림 목록의 클릭 가능한 항목을 누를 때 기록한다. id를 notification_id로, 검증한 type을 notification_type으로 전달한다. 추적을 위해 비활성 항목에 새 탐색 동작을 만들지 않는다.
- channel=push: 인증·탐색 준비 후 현재 요청을 처리할 때 1회 기록한다. 목적 화면이 이미 열려 있어도 실제 푸시 열기는 기록한다.
- eventId는 native 프로세스에서 생성하는 notification-open-N 요청 번호다. 같은 요청의 재렌더·acknowledge 재시도만 중복 제거하고 PostHog 이벤트 ID나 영구 중복 키로 전송·저장하지 않는다.
- notification_id는 서버의 알림 항목 ID다. 현재 브리지에는 없으므로 push에서는 생략한다. postPushDeliveryId·FCM message ID도 대신 사용하지 않는다.
- 푸시로 연 뒤 같은 알림 목록을 누르면 두 실제 행동으로 기록한다. 앱 재시작 사이의 완전한 exactly-once 보장은 하지 않는다.

## 누락 속성과 필요한 보완

| 속성                                                   | 이번 처리             | 필요한 보완                                        |
| ------------------------------------------------------ | --------------------- | -------------------------------------------------- |
| notice_opened/notice_read_confirmed.hours_since_posted | 생략                  | 날짜만 있는 createdDate 대신 정확한 게시 시각      |
| notification_opened.minutes_since_sent                 | 생략                  | 날짜만 있는 sentDate 대신 정확한 발송 시각         |
| push의 notification_id·notification_type               | 생략                  | 검증된 실제 알림 ID·종류의 브리지 전달             |
| account_deleted.days_since_signup                      | 생략                  | 실제 가입일                                        |
| attendance_report_submitted.is_before_deadline         | 생략                  | 제출 가능 마감과 감점 적용 기준을 구분한 분석 정의 |
| team_cert_upload_failed.file_size_mb                   | 크기 미확보 시 생략   | 업로드 전 파일 바이트 수                           |
| 기타 출처·세션 관련 값                                 | 실제 값이 없으면 생략 | 해당 탐색 경로·세션 데이터                         |

## 최신 main 반영 계약

원문은 단일 report_type:S지만 최신 main은 LATE·EARLY_LEAVE 복수 선택, ABSENT 단독 선택과 기존 보고 수정이 가능하다.
사용자 확인에 따라 submitted·abandoned의 report_type을 report_types:string[]로 변경하고, 선택 순서와 무관하게 LATE, EARLY_LEAVE, ABSENT 순서의 중복 없는 코드 배열로 보낸다.
유형별로 이벤트를 여러 번 만들지 않아 제출 1회의 의미를 유지한다. 예를 들어 지각·조퇴 동시 제출은 report_types=["LATE", "EARLY_LEAVE"]인 이벤트 한 건이다. 위 표의 원문 속성은 출처 보존용이며 실제 구현에서는 report_type을 함께 보내지 않는다.
started·submitted·abandoned에는 is_edit:boolean을 추가해 기존 보고 수정과 최초 제출을 구분한다. reportId가 있으면 true다.
reason_length는 최신 입력 계약에 맞춰 실제 제출 원문의 Unicode 코드포인트 수로 계산한다. 사유 원문은 보내지 않는다.
