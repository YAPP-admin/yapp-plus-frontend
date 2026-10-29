/** 저장 성공 시 캐시 무효화와 실패 시 기존 데이터 보존을 검증한다. */
import { act, renderHook, waitFor } from '@testing-library/react';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { noticeContentSchema, noticeSchema } from './notice';
import {
  noticeMembersQueryOptions,
  noticeQueryOptions,
  noticesQueryOptions,
  useNoticeMutations,
} from './notice-queries';
import * as service from './notices';
import { createAdminQueryClient } from '../../../query-client';

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
  const client = createAdminQueryClient();
  clients.push(client);

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  return { client, wrapper: Wrapper };
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  for (const client of clients) {
    client.clear();
  }

  clients.length = 0;
});

describe('공지 변경 후 캐시 처리', () => {
  it.each(['create', 'update'] as const)(
    '비활성 목록도 %s 성공 후 실제 앱 정책에서 최신 목록을 반환한다',
    async (kind) => {
      const { client, wrapper } = setup();
      const changed = { ...saved, title: '새 제목' };
      vi.mocked(service.listNotices).mockResolvedValueOnce([saved]).mockResolvedValue([changed]);
      vi.mocked(service.createNotice).mockResolvedValue(changed);
      vi.mocked(service.updateNotice).mockResolvedValue(changed);
      await client.fetchQuery(noticesQueryOptions);
      const { result } = renderHook(useNoticeMutations, { wrapper });
      await act(async () => {
        if (kind === 'create') {
          await result.current.create.mutateAsync(input);
        } else {
          await result.current.update.mutateAsync({ id: saved.id, input });
        }
      });
      expect(client.getQueryData(noticesQueryOptions.queryKey)).toEqual([changed]);
      expect(service.listNotices).toHaveBeenCalledTimes(2);
    },
  );

  it('생성·수정 성공은 목록과 상세를 무효화하고 삭제 성공은 대상 상세만 제거한다', async () => {
    const { client, wrapper } = setup();
    vi.mocked(service.createNotice).mockResolvedValue(saved);
    vi.mocked(service.updateNotice).mockResolvedValue(saved);
    vi.mocked(service.deleteNotice).mockResolvedValue(undefined);

    const { result } = renderHook(useNoticeMutations, { wrapper });

    for (const [kind, operation] of [
      ['create', () => result.current.create.mutate(input)],
      ['update', () => result.current.update.mutate({ id: saved.id, input })],
    ] as const) {
      client.setQueryData(noticesQueryOptions.queryKey, [saved]);
      client.setQueryData(noticeQueryOptions(saved.id).queryKey, saved);
      client.setQueryData(noticeMembersQueryOptions.queryKey, []);

      act(operation);
      await waitFor(() => expect(result.current[kind].isSuccess).toBe(true));

      expect(client.getQueryState(noticesQueryOptions.queryKey)?.isInvalidated).toBe(true);
      expect(client.getQueryState(noticeQueryOptions(saved.id).queryKey)?.isInvalidated).toBe(true);
      expect(client.getQueryState(noticeMembersQueryOptions.queryKey)?.isInvalidated).toBe(false);
    }

    const other = noticeSchema.parse({ ...saved, id: 'other' });
    client.setQueryData(noticeQueryOptions('other').queryKey, other);
    act(() => result.current.remove.mutate(saved.id));
    await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));
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

    for (const [kind, operation] of [
      ['create', () => result.current.create.mutate(input)],
      ['update', () => result.current.update.mutate({ id: saved.id, input })],
      ['remove', () => result.current.remove.mutate(saved.id)],
    ] as const) {
      act(operation);
      await waitFor(() => expect(result.current[kind].isError).toBe(true));
      expect(client.getQueryData(noticesQueryOptions.queryKey)).toEqual([saved]);
      expect(client.getQueryData(noticeQueryOptions(saved.id).queryKey)).toEqual(saved);
      expect(client.getQueryState(noticesQueryOptions.queryKey)?.isInvalidated).toBe(false);
    }

    expect(service.createNotice).toHaveBeenCalledTimes(1);
    expect(service.updateNotice).toHaveBeenCalledTimes(1);
    expect(service.deleteNotice).toHaveBeenCalledTimes(1);
  });
});
