/** 화면 전환이 수신 처리를 반복하지 않고 다음 수신은 최신 활성 상태를 읽는지 검증합니다. */
import { InfiniteQueryObserver, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { createAppQueryClient } from '@/app/providers';
import { apiBaseUrl, server } from '../../../mocks/server';
import { alertsInfiniteQueryOptions } from './alerts-query';
import { usePushAlertsRefresh } from './use-push-alerts-refresh';

it('같은 수신 번호의 화면 전환은 재조회하지 않고 새 수신은 최신 활성 상태로 조회한다', async () => {
  let requests = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/users/me/notifications`, () => {
      requests += 1;
      return HttpResponse.json({ items: [], nextCursor: null });
    }),
  );
  const client = createAppQueryClient();
  const options = alertsInfiniteQueryOptions();
  const observer = new InfiniteQueryObserver(client, options);
  const unsubscribe = observer.subscribe(() => {});
  await observer.refetch();

  const { rerender, unmount } = renderHook(
    ({ revision, active }) => usePushAlertsRefresh(revision, active),
    {
      initialProps: { revision: 0, active: false },
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    },
  );
  expect(requests).toBe(1);
  rerender({ revision: 1, active: false });
  expect(client.getQueryState(options.queryKey)?.isInvalidated).toBe(true);
  expect(requests).toBe(1);

  // 화면 복귀 조회가 끝난 상황에서 활성 상태 변경만으로 다시 무효화하지 않습니다.
  await observer.refetch();
  rerender({ revision: 1, active: true });
  expect(client.getQueryState(options.queryKey)?.isInvalidated).toBe(false);
  expect(requests).toBe(2);

  rerender({ revision: 2, active: true });
  await waitFor(() => expect(requests).toBe(3));
  await waitFor(() => expect(observer.getCurrentResult().isFetching).toBe(false));
  rerender({ revision: -1, active: true });
  expect(client.getQueryState(options.queryKey)?.isInvalidated).toBe(false);
  expect(requests).toBe(3);

  unmount();
  unsubscribe();
  client.clear();
});
