import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { client } from '@yapp-plus/api/generated';
import { onUnhandledApiRequest } from '@yapp-plus/api/mocks';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { apiBaseUrl, server } from './src/mocks/server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: onUnhandledApiRequest(apiBaseUrl) });
});

beforeEach(() => {
  client.setConfig({ baseUrl: apiBaseUrl });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
