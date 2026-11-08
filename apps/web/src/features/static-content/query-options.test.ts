import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { find3Options, find4Options } from '@yapp-plus/api/generated';
import { currentWeekQueryOptions } from '@/pages/home/model/current-week-query';
import { scheduleQueryOptions } from '@/pages/schedule/model/schedule-query';
import {
  memberNoticeListQueryOptions,
  memberNoticeListInfiniteQueryOptions,
} from '@/features/member-notice/model/notice-queries';
import { memberNoticeDetailQueryOptions } from '@/pages/notice-detail/model/notice-detail-query';
import { getStaticNotice, markStaticNoticeRead } from './index';

beforeEach(() => vi.stubEnv('VITE_STATIC_CONTENT', 'true'));
afterEach(() => vi.unstubAllEnvs());

it('생성 키를 유지하며 네트워크 없이 세션·일정·공지 상세를 연결한다', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch');
  const client = new QueryClient();
  try {
    expect(currentWeekQueryOptions().queryKey).toEqual(find3Options().queryKey);
    expect(scheduleQueryOptions().queryKey).toEqual(find4Options().queryKey);
    const week = await client.fetchQuery(currentWeekQueryOptions());
    expect(week.session).toBeNull();
    await client.fetchQuery(scheduleQueryOptions());
    const list = await client.fetchQuery(memberNoticeListQueryOptions('SESSION'));
    expect(list.items).toHaveLength(1);
    const item = list.items[0];
    if (!item) {
      throw new Error('세션 공지가 없습니다.');
    }
    const detail = await client.fetchQuery(memberNoticeDetailQueryOptions(item.postId));
    expect(detail.title).toBe(item.title);
    expect(fetch).not.toHaveBeenCalled();
  } finally {
    client.clear();
    fetch.mockRestore();
  }
});

it('정적 공지는 필터에 맞는 한 페이지만 반환한다', async () => {
  const client = new QueryClient();
  try {
    const result = await client.fetchInfiniteQuery(
      memberNoticeListInfiniteQueryOptions('ASSIGNMENT'),
    );
    expect(result.pages[0]?.items).toEqual([]);
    expect(result.pages[0]?.nextCursor).toBeNull();
  } finally {
    client.clear();
  }
});

it('읽음 상태는 공지별로 관리하고 사용자가 바뀌면 초기화한다', async () => {
  await markStaticNoticeRead(39901, 'first');
  expect(await getStaticNotice(39901, 'first')).toMatchObject({ read: true, readCount: 1 });
  expect(await getStaticNotice(39902, 'first')).toMatchObject({ read: false });
  expect(await getStaticNotice(39901, 'second')).toMatchObject({ read: false });
  await expect(getStaticNotice(0)).rejects.toMatchObject({ code: 'POST_NOT_FOUND' });
});

it('정적 모드를 끄면 생성 query 함수로 실제 API를 조회한다', async () => {
  vi.stubEnv('VITE_STATIC_CONTENT', 'false');
  const client = new QueryClient();
  try {
    // 테스트 서버의 현재 세션은 AVAILABLE이며 정적 모드의 null과 다르다.
    const week = await client.fetchQuery(currentWeekQueryOptions());
    expect(week.session?.attendanceStatus).toBe('AVAILABLE');
  } finally {
    client.clear();
  }
});
