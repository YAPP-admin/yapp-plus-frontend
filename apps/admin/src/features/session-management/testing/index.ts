import { getBrowserSessionStore, type AttendanceMockOperation } from '../model/sessions.mock';

// 모의 저장소는 테스트에서만 이 진입점으로 동기 접근합니다.
export { createSessionStore } from '../model/sessions.mock';

export function failNextAttendanceOperation(
  operation: AttendanceMockOperation,
  sessionId: string,
  membershipId?: string,
) {
  getBrowserSessionStore().failNextAttendanceOperation(operation, sessionId, membershipId);
}
