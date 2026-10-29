import type { AttendanceResult } from '../attendance';

/** 모의 서비스 전용 감점 계산입니다. 실제 화면은 서버의 scoreDelta를 표시합니다. */
export function calculateMockAttendanceDelta(result: AttendanceResult): number | null {
  switch (result.status) {
    case 'present':
      return 0;
    case 'undecided':
    case 'unsupported':
      return null;
    case 'absent':
      if (result.penaltyCategory === 'unknown') {
        return null;
      }
      return result.penaltyCategory === 'regular' ? -12 : -20;
    case 'late':
    case 'earlyLeave': {
      if (result.penaltyCategory === 'unknown' || result.durationBand === null) {
        return null;
      }
      const regularDelta = result.durationBand === 'withinOneHour' ? -4 : -8;
      return result.penaltyCategory === 'regular' ? regularDelta : regularDelta - 6;
    }
  }
  return null;
}
