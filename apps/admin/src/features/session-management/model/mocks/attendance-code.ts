import type { AttendanceCodeViewModel } from '../attendance-view-model';
import type { Session } from '../session';

const codeLifetimeMs = 10 * 60 * 1000;

export function createMockAttendanceCode(session: Session): AttendanceCodeViewModel {
  void session;
  return { state: 'notIssued', code: null, expiresAt: null };
}

export function issueMockAttendanceCode(
  revision: number,
  now = new Date(),
): AttendanceCodeViewModel {
  const code = String(100000 + ((revision * 1739) % 900000)).padStart(6, '0');
  return {
    state: 'active',
    code,
    // mock에서는 같은 밀리초에 재발급되는 경우도 새 만료 시각으로 구분한다.
    expiresAt: new Date(now.getTime() + codeLifetimeMs + revision).toISOString(),
  };
}
