import { createSessionHandlers, currentWeekFixture, scheduleFixture } from './session-handlers';
import { createMemberAttendanceHandlers } from './member-attendance-handlers';
import { createMemberNoticeHandlers } from './member-notice-handlers';
import { createApiMockHandlers } from '@yapp-plus/api/mocks';
import { setupServer } from 'msw/node';

export const apiBaseUrl = 'https://api.yapp.test';
export const createTestHandlers = () => [
  ...createMemberAttendanceHandlers(apiBaseUrl),
  ...createMemberNoticeHandlers(apiBaseUrl),
  ...createSessionHandlers(apiBaseUrl, undefined, { currentWeekFixture, scheduleFixture }),
  ...createApiMockHandlers(apiBaseUrl),
];

export const server = setupServer(...createTestHandlers());
