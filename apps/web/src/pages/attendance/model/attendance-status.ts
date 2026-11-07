import type { AttendanceHistoryItemResponse } from '@yapp-plus/api/generated';

const labels = {
  PRESENT: '출석',
  LATE: '지각',
  ABSENT: '결석',
  EARLY_LEAVE: '조퇴',
  LATE_AND_EARLY_LEAVE: '지각·조퇴',
  EXCUSED_ABSENCE: '공결',
};
const decisions = {
  PENDING: '검토중',
  REJECTED: '반려',
  NOT_SUBMITTED: '미제출',
  NOT_SELECTED: '미선택',
  APPROVED: '미확정',
};
export function attendanceLabel(item: AttendanceHistoryItemResponse) {
  if (item.attendanceStatus !== 'UNDECIDED') {
    return labels[item.attendanceStatus];
  }
  return item.staffDecisionStatus === null ? '미확정' : decisions[item.staffDecisionStatus];
}
