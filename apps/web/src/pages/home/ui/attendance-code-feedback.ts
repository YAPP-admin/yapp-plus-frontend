/** 출석 mutation 상태와 위치 오류 여부를 화면에 표시할 문구로 변환합니다. */
export function getAttendanceSubmissionFeedback({
  checkingLocation,
  submittingAttendance,
  openingSettings,
  hasLocationIssue,
}: Readonly<{
  checkingLocation: boolean;
  submittingAttendance: boolean;
  openingSettings: boolean;
  hasLocationIssue: boolean;
}>) {
  if (checkingLocation) {
    return { progressMessage: '위치를 확인하고 있어요.', submitLabel: '위치 확인 중' };
  }
  if (submittingAttendance) {
    return { progressMessage: '출석을 처리하고 있어요.', submitLabel: '출석 처리 중' };
  }
  return {
    progressMessage: openingSettings ? '앱 설정을 열고 있어요.' : null,
    submitLabel: hasLocationIssue && !openingSettings ? '위치 다시 확인' : '위치 확인 후 출석하기',
  };
}
