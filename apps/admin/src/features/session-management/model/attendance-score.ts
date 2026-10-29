import type { AttendanceResult } from './attendance';

/** 근거가 부족하거나 아직 확정하지 않은 출결은 0점 대신 null을 반환합니다. */
export function calculateAttendanceDelta(result: AttendanceResult): number | null {
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
