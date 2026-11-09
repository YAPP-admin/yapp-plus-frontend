import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { client } from '@yapp-plus/api/generated';
import { onUnhandledApiRequest } from '@yapp-plus/api/mocks';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { createElement, type ComponentProps } from 'react';
import type * as Seed from '@seed-design/react';
import { apiBaseUrl, server, createTestHandlers } from './src/mocks/server';
import { resetMemberNoticeHandlerState } from './src/mocks/member-notice-handlers';

beforeAll(() => {
  server.listen({ onUnhandledRequest: onUnhandledApiRequest(apiBaseUrl) });
});

beforeEach(() => {
  server.resetHandlers(...createTestHandlers());
  client.setConfig({ baseUrl: apiBaseUrl });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetMemberNoticeHandlerState();
});

afterAll(() => {
  server.close();
});

// happy-dom에는 레이아웃 측정이 없습니다. 탐색 통합 테스트에서는 Carousel의 DOM 경계만 유지합니다.
vi.mock('@seed-design/react', async (importOriginal) => {
  const actual = await importOriginal<typeof Seed>();
  return {
    ...actual,
    Tabs: {
      ...actual.Tabs,
      Carousel: ({ children, className }: ComponentProps<typeof Seed.Tabs.Carousel>) => {
        return createElement('div', { className }, children);
      },
      CarouselCamera: ({ children, ...props }: ComponentProps<typeof Seed.Tabs.CarouselCamera>) =>
        createElement('div', props, children),
    },
  };
});
