import '@yapp-plus/api/setup';
import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { client } from '@yapp-plus/api/generated';
import { onUnhandledApiRequest } from '@yapp-plus/api/mocks';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { apiBaseUrl, server } from './src/mocks/server';

// 테스트 runner의 UI 시간 제한과 같은 기준으로 비동기 렌더링을 기다린다.
configure({ asyncUtilTimeout: 10_000 });

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
