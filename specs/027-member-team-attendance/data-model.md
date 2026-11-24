# 데이터 모델과 상태 수명

## 서버 상태

- 주간 세션: useSuspenseQuery로 type·attendanceStatus를 읽어 홈과 입력 UI를 결정한다.
- 팀원: 생성 find5Options를 소비하고 TeamAttendanceTarget으로 표시한다.
  teamId·membershipId를 사용하고 isMe로 본인을 정한다. 직군 null은 ‘—’다.
- 팀 사진: 생성 find1Options를 PENDING_APPROVAL에서 소비한다. 사진 없음·오류는 검토 중 표시를 유지한다.
- 별도 조회 래퍼·SUBMITTED 상태 모델은 없다. 기존 제출 대상·폼 스키마만 유지한다.

## 화면 초안

selectedPhoto는 Context의 { photo: File; previewUrl: string } 또는 null이다.
브리지 성공 콜백에서 저장하고 업로드 Activity로 이동한다. 사진 선택 시 서버 업로드는 없다.
previewUrl은 URL.createObjectURL로 생성하며 교체·완료·이탈 시 revokeObjectURL로 해제한다.
참석자 선택은 폼의 selectedMembershipIds가 소유하고 본인을 포함한다.

## 전송과 완료

최종 버튼에서 체크섬 생성·presign·PUT·접수를 실행한다.
imageKey는 해당 전송 내부에서만 사용하며 다음 Activity에 전달하지 않는다.
접수 결과 receipt는 photoId·submittedAt·PENDING·제출 당시 팀과 참석자 정보를 가진다.
isSubmissionComplete는 Stackflow stage === complete로 계산하고 receipt가 있어야 완료 화면을 표시한다.
진행·오류·접수 결과는 Mutation, 사진 File은 Context가 소유한다.
계정 변경·화면 이탈의 취소와 늦은 응답 차단은 기존 화면 수명 정책을 따른다.

## 오류

팀원 조회 실패는 문구만 표시한다. 주간·사진 재조회 실패는 기존 데이터를 유지한다.
명시적 제출 실패는 오류를 안내하고 결과 불명은 재전송을 막으며 홈 복귀를 제공한다.
접수 성공과 후속 조회 실패를 구분하며 성공 기록으로 출석 승인 상태를 추정하지 않는다.
