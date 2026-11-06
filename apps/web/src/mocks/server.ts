import { createSessionHandlers } from './session-handlers';
import { createApiMockHandlers } from '@yapp-plus/api/mocks';
import { setupServer } from 'msw/node';

export const apiBaseUrl = 'https://api.yapp.test';
export const server = setupServer(
  ...createSessionHandlers(apiBaseUrl),
  ...createApiMockHandlers(apiBaseUrl),
);
