import { act, renderHook, waitFor } from '@testing-library/react';
import { onlineManager, QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { createSessionInputSchema, sessionSchema } from './session';
import {
  sessionsQueryOptions,
  useCreateSessionMutation,
  useUpdateSessionMutation,
} from './session-queries';
import * as service from './sessions';

vi.mock('./sessions', () => ({
  listSessions: vi.fn<typeof service.listSessions>(),
  createSession: vi.fn<typeof service.createSession>(),
  updateSession: vi.fn<typeof service.updateSession>(),
}));

const clients: QueryClient[] = [];
afterEach(() => {
  clients.splice(0).forEach((client) => client.clear());
  onlineManager.setOnline(true);
  vi.resetAllMocks();
});

it.each(['team', 'offline'])(
  '오프라인에서도 %s 메모리 목록·저장이 완료되고 재연결에 재실행되지 않는다',
  async (type) => {
    const input = createSessionInputSchema.parse({
      type,
      name: '세션',
      date: '2026-11-01',
      startTime: '14:00',
      endTime: '17:00',
      location:
        type === 'team'
          ? { guide: '팀별 진행' }
          : {
              roadAddress: '서울특별시 중구 세종대로 110',
              detailAddress: '',
              latitude: 37.5665,
              longitude: 126.978,
            },
    });
    const saved = sessionSchema.parse({
      ...input,
      id: 'session-1',
      attendance: {
        present: 0,
        late: 0,
        absent: 0,
        pending: 0,
        reported: 0,
      },
    });
    vi.mocked(service.listSessions).mockResolvedValue([saved]);
    vi.mocked(service.createSession).mockResolvedValue(saved);
    vi.mocked(service.updateSession).mockResolvedValue(saved);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    clients.push(client);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    onlineManager.setOnline(false);
    const { result, unmount } = renderHook(
      () => ({
        list: useQuery(sessionsQueryOptions),
        create: useCreateSessionMutation(),
        update: useUpdateSessionMutation(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    act(() => result.current.create.mutate(input));
    await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
    act(() => result.current.update.mutate({ id: saved.id, input }));
    await waitFor(() => expect(result.current.update.isSuccess).toBe(true));
    unmount();
    await act(async () => {
      onlineManager.setOnline(true);
      await Promise.resolve();
    });
    expect(service.createSession).toHaveBeenCalledExactlyOnceWith(input, expect.anything());
    expect(service.updateSession).toHaveBeenCalledExactlyOnceWith(saved.id, input);
  },
);
