import { createNoticeFixtures } from './notice-fixtures';
import { createAttendanceFixtures } from './attendance-fixtures';
import { createUpcomingSessionFixtures } from './session-fixtures';
import { createSessionHandlers } from './session-handlers';
import { createMemberAttendanceHandlers } from './member-attendance-handlers';
import { createMemberNoticeHandlers } from './member-notice-handlers';
import { createMemberProfileHandlers } from './member-profile-handlers';
import { client } from '@yapp-plus/api/generated';
import { createApiMockHandlers, onUnhandledApiRequest } from '@yapp-plus/api/mocks';
import { setupWorker } from 'msw/browser';

let startPromise: Promise<void> | undefined;

export function startMocking(): Promise<void> {
  // StrictMode와 여러 소비자가 같은 worker 시작을 기다리도록 한다.
  startPromise ??= (async () => {
    const baseUrl = client.getConfig().baseUrl;
    if (!baseUrl) {
      throw new Error('모킹할 API base URL이 없습니다.');
    }

    const fixtures = createUpcomingSessionFixtures(Date.now());
    const attendance = createAttendanceFixtures(fixtures);
    const noticeState = new URLSearchParams(window.location.search).get('noticeState');
    const worker = setupWorker(
      ...createMemberProfileHandlers(baseUrl),
      ...createMemberAttendanceHandlers(
        baseUrl,
        new URLSearchParams(window.location.search).get('myState'),
        new URLSearchParams(window.location.search).get('attendanceState'),
        attendance,
      ),
      ...createMemberNoticeHandlers(
        baseUrl,
        noticeState,
        noticeState ? undefined : createNoticeFixtures(fixtures),
      ),
      ...createSessionHandlers(
        baseUrl,
        new URLSearchParams(window.location.search).get('scheduleState'),
        fixtures,
        attendance,
      ),
      ...createApiMockHandlers(baseUrl),
    );
    await worker.start({
      serviceWorker: { url: '/mockServiceWorker.js' },
      onUnhandledRequest: onUnhandledApiRequest(baseUrl),
    });
  })();
  return startPromise;
}
