import { expect, it } from 'vitest';
import type { AttendanceHistoryItemResponse } from '@yapp-plus/api/generated';
import { attendanceLabel } from './attendance-status';

const item = { sessionId: 1, sessionName: '세션' };
it.each<[AttendanceHistoryItemResponse['attendanceStatus'], string]>([
  ['PRESENT', '출석'],
  ['LATE', '지각'],
  ['ABSENT', '결석'],
  ['EARLY_LEAVE', '조퇴'],
  ['LATE_AND_EARLY_LEAVE', '지각·조퇴'],
  ['EXCUSED_ABSENCE', '공결'],
])('확정 출결 %s가 운영진 판단보다 우선한다', (attendanceStatus, label) => {
  expect(attendanceLabel({ ...item, attendanceStatus, staffDecisionStatus: 'REJECTED' })).toBe(
    label,
  );
});
it.each<[AttendanceHistoryItemResponse['staffDecisionStatus'], string]>([
  ['PENDING', '검토중'],
  ['REJECTED', '반려'],
  ['NOT_SUBMITTED', '미제출'],
  ['NOT_SELECTED', '미선택'],
  ['APPROVED', '미확정'],
  [null, '미확정'],
])('미확정 출결의 운영진 판단 %s를 표시한다', (staffDecisionStatus, label) => {
  expect(attendanceLabel({ ...item, attendanceStatus: 'UNDECIDED', staffDecisionStatus })).toBe(
    label,
  );
});
