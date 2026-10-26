import { createApiMockHandlers } from '@yapp-plus/api/mocks';
import { setupServer } from 'msw/node';

export const apiBaseUrl = 'https://api.yapp.test';
export const server = setupServer(...createApiMockHandlers(apiBaseUrl));
