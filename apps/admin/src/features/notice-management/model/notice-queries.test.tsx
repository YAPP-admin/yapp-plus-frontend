/** 조회 시작 조건과 성공·실패 시 Query 캐시 변화를 실제 훅으로 검증한다. */
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { noticeContentSchema, noticeSchema } from './notice';
import {
  noticeMembersQueryOptions,
  noticeQueryOptions,
  noticesQueryOptions,
  useNoticeMembersQuery,
  useNoticeMutations,
  useNoticeQuery,
  useNoticesQuery,
} from './notice-queries';
import * as service from './notices';

const hydration = vi.hoisted(() => ({ ready: true }));
vi.mock('@tanstack/react-router', () => ({ useHydrated: () => hydration.ready }));
vi.mock('./notices', () => ({
  listNotices: vi.fn<typeof service.listNotices>(),
  listNoticeMembers: vi.fn<typeof service.listNoticeMembers>(),
  getNotice: vi.fn<typeof service.getNotice>(),
  createNotice: vi.fn<typeof service.createNotice>(),
  updateNotice: vi.fn<typeof service.updateNotice>(),
  deleteNotice: vi.fn<typeof service.deleteNotice>(),
}));
const input = noticeContentSchema.parse({
  category: 'session',
  audience: 'all',
  title: '공지',
  bodyDocument: {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '본문' }] }],
  },
});
const saved = {
  ...input,
  id: 'notice-1',
  createdAt: '2026-10-23T00:00:00.000Z',
  readAtByMemberId: {},
  unansweredCount: 0,
};
const clients: QueryClient[] = [];

/** 테스트별로 캐시를 격리하고 자동 재시도를 끈다. */
function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  clients.push(client);
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return { client, wrapper: Wrapper };
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('DEV', true);
  vi.stubEnv('SSR', false);
  hydration.ready = true;
});
afterEach(() => {
  for (const client of clients) {
    client.clear();
  }
  clients.length = 0;
  vi.unstubAllEnvs();
});

describe('공지 Query 연결', () => {
  it.each(['production', 'server', 'before-hydration'])(
    '%s에서는 조회하지 않는다',
    (environment) => {
      if (environment === 'production') {
        vi.stubEnv('DEV', false);
      } else if (environment === 'server') {
        vi.stubEnv('SSR', true);
      } else {
        hydration.ready = false;
      }
      const { wrapper } = setup();
      const { result } = renderHook(
        () => ({
          list: useNoticesQuery(),
          detail: useNoticeQuery(saved.id),
          members: useNoticeMembersQuery(),
        }),
        { wrapper },
      );
      expect(result.current.list.fetchStatus).toBe('idle');
      expect(result.current.detail.fetchStatus).toBe('idle');
      expect(result.current.members.fetchStatus).toBe('idle');
      expect(service.listNotices).not.toHaveBeenCalled();
      expect(service.getNotice).not.toHaveBeenCalled();
      expect(service.listNoticeMembers).not.toHaveBeenCalled();
    },
  );
  it('hydration 후 조회를 시작하고 실패한 조회를 재시도한다', async () => {
    hydration.ready = false;
    vi.mocked(service.listNotices)
      .mockRejectedValueOnce(new Error('조회 실패'))
      .mockResolvedValue([saved]);
    const { wrapper } = setup();
    const { result, rerender } = renderHook(useNoticesQuery, { wrapper });
    hydration.ready = true;
    rerender();
    await waitFor(() => expect(result.current.isError).toBe(true));
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.data).toEqual([saved]));
    expect(service.listNotices).toHaveBeenCalledTimes(2);
  });
  it('생성·수정 성공은 목록과 상세를 무효화하고 삭제 성공은 대상 상세만 제거한다', async () => {
    const { client, wrapper } = setup();
    vi.mocked(service.createNotice).mockResolvedValue(saved);
    vi.mocked(service.updateNotice).mockResolvedValue(saved);
    vi.mocked(service.deleteNotice).mockResolvedValue(undefined);
    const { result } = renderHook(useNoticeMutations, { wrapper });
    for (const operation of [
      () => result.current.create.mutateAsync(input),
      () => result.current.update.mutateAsync({ id: saved.id, input }),
    ]) {
      client.setQueryData(noticesQueryOptions.queryKey, [saved]);
      client.setQueryData(noticeQueryOptions(saved.id).queryKey, saved);
      client.setQueryData(noticeMembersQueryOptions.queryKey, []);
      await act(async () => {
        await operation();
      });
      expect(client.getQueryState(noticesQueryOptions.queryKey)?.isInvalidated).toBe(true);
      expect(client.getQueryState(noticeQueryOptions(saved.id).queryKey)?.isInvalidated).toBe(true);
      expect(client.getQueryState(noticeMembersQueryOptions.queryKey)?.isInvalidated).toBe(false);
    }
    const other = noticeSchema.parse({ ...saved, id: 'other' });
    client.setQueryData(noticeQueryOptions('other').queryKey, other);
    await act(async () => {
      await result.current.remove.mutateAsync(saved.id);
    });
    expect(client.getQueryState(noticeQueryOptions(saved.id).queryKey)).toBeUndefined();
    expect(client.getQueryData(noticeQueryOptions('other').queryKey)).toBeDefined();
  });
  it('변경 실패 시 기존 캐시를 유지하고 자동 재시도하지 않는다', async () => {
    const { client, wrapper } = setup();
    client.setQueryData(noticesQueryOptions.queryKey, [saved]);
    client.setQueryData(noticeQueryOptions(saved.id).queryKey, saved);
    for (const mock of [service.createNotice, service.updateNotice, service.deleteNotice]) {
      vi.mocked(mock).mockRejectedValue(new Error('저장 실패'));
    }
    const { result } = renderHook(useNoticeMutations, { wrapper });
    for (const operation of [
      () => result.current.create.mutateAsync(input),
      () => result.current.update.mutateAsync({ id: saved.id, input }),
      () => result.current.remove.mutateAsync(saved.id),
    ]) {
      await act(async () => {
        await expect(operation()).rejects.toThrow('저장 실패');
      });
      expect(client.getQueryData(noticesQueryOptions.queryKey)).toEqual([saved]);
      expect(client.getQueryData(noticeQueryOptions(saved.id).queryKey)).toEqual(saved);
      expect(client.getQueryState(noticesQueryOptions.queryKey)?.isInvalidated).toBe(false);
    }
    expect(service.createNotice).toHaveBeenCalledTimes(1);
    expect(service.updateNotice).toHaveBeenCalledTimes(1);
    expect(service.deleteNotice).toHaveBeenCalledTimes(1);
  });
});
