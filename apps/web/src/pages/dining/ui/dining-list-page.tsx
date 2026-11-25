/** 회식 목록의 상태 필터와 피그마 전용 탐색 모양을 렌더링합니다. */
'use client';

import { IconCalendarFill } from '@karrotmarket/react-monochrome-icon';
import { ActivityLink } from '@/app/navigation/activity-link';
import { ActionButton, Badge, Text } from '@yapp-plus/ui';
import { HStack } from '@seed-design/react';
import { useState } from 'react';
import { getDiningDeadline } from '../model/dining-model';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { list4InfiniteOptions } from '@yapp-plus/api/generated';
import { diningListSchema, useDiningAccess } from '../model/dining-query';
import { DiningQueryBoundary } from './dining-query-boundary';
import { DiningQueryState } from './dining-query-state';
import { useRefetchOnScreenReturn } from '@/shared/lib/screen-activity';
import {
  calendarIcon,
  calendarMeta,
  cardMeta,
  communityHeader,
  communityTab,
  communityTabs,
  communityTabSelected,
  deadlineChip,
  deadlineChipClosed,
  diningCard,
  diningList,
  filterButton,
  filterButtonSelected,
  filterList,
  filterGroup,
  filterLegend,
  listContent,
  listPage,
  notificationDot,
  page,
} from './dining-list-page.css';

type ListFilter = 'ALL' | 'OPEN' | 'CLOSED';

const LIST_FILTERS: readonly { value: ListFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'OPEN', label: '진행 중' },
  { value: 'CLOSED', label: '투표 마감' },
];

/** 서버 상태 필터와 cursor를 사용해 초대된 회식을 조회합니다. */
export function DiningListPage() {
  return (
    <DiningQueryBoundary>
      <DiningListContent />
    </DiningQueryBoundary>
  );
}

function DiningListContent() {
  const [filter, setFilter] = useState<ListFilter>('ALL');
  const { apiOptions } = useDiningAccess();
  const generated = list4InfiniteOptions({ ...apiOptions, query: { filter } });
  const query = useSuspenseInfiniteQuery({
    ...generated,
    queryFn: typeof generated.queryFn === 'function' ? generated.queryFn : undefined,
    initialPageParam: {},
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((response) => diningListSchema.parse(response).items),
  });
  useRefetchOnScreenReturn(query);
  if (query.error && !query.isFetching) {
    throw query.error instanceof Error
      ? query.error
      : new Error('뒤풀이 정보를 불러오지 못했어요.', { cause: query.error });
  }
  const items = query.data;
  return (
    <main className={[page, listPage].join(' ')}>
      <header className={communityHeader}>
        <Text as="h1" textStyle="t8Bold">
          커뮤니티
        </Text>
        <nav className={communityTabs} aria-label="커뮤니티 메뉴">
          <span className={[communityTab, communityTabSelected].join(' ')}>
            뒤풀이
            <span className={notificationDot} aria-hidden="true" />
          </span>
        </nav>
      </header>

      <section className={listContent} aria-label="뒤풀이 목록">
        <fieldset className={filterGroup}>
          <legend className={filterLegend}>뒤풀이 상태 필터</legend>
          <ul className={filterList}>
            {LIST_FILTERS.map(({ value, label }) => (
              <li key={value}>
                <button
                  type="button"
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                  className={[filterButton, filter === value ? filterButtonSelected : ''].join(' ')}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
        {items.length === 0 && <DiningQueryState message="초대된 뒤풀이가 없어요." />}
        <ul className={diningList} aria-label="뒤풀이 목록">
          {items.map((dining) => (
            <li key={dining.afterpartyId}>
              <DiningCard dining={dining} now={query.dataUpdatedAt} />
            </li>
          ))}
        </ul>
        {query.hasNextPage && (
          <ActionButton
            type="button"
            variant="neutralWeak"
            disabled={query.isFetchingNextPage}
            onClick={() => {
              void query.fetchNextPage();
            }}
          >
            더 보기
          </ActionButton>
        )}
      </section>
    </main>
  );
}

function DiningCard({
  dining,
  now,
}: {
  now: number;
  dining: ReturnType<typeof diningListSchema.parse>['items'][number];
}) {
  const deadline =
    dining.state === 'OPEN'
      ? getDiningDeadline(Date.parse(dining.deadline), now)
      : { status: 'closed', label: dining.state === 'ENDED' ? '종료' : '투표 마감' };
  return (
    <ActivityLink
      activityName="DiningDetail"
      activityParams={{ diningId: String(dining.afterpartyId) }}
      className={diningCard}
    >
      <Badge
        variant="weak"
        tone={deadline.status === 'closed' ? 'neutral' : 'brand'}
        className={[deadlineChip, deadline.status === 'closed' ? deadlineChipClosed : ''].join(' ')}
      >
        {deadline.label}
      </Badge>
      <Text as="h2" textStyle="t5Bold">
        {dining.title}
      </Text>
      <HStack className={cardMeta}>
        <HStack className={calendarMeta}>
          <IconCalendarFill className={calendarIcon} aria-hidden="true" />
          <Text as="span" textStyle="t2Medium" color="fg.neutralSubtle">
            {dining.startsAtDisplay ?? formatDiningListDate(Date.parse(dining.startsAt))}
          </Text>
        </HStack>
        <Text as="span" textStyle="t2Medium" color="fg.neutralSubtle">
          {dining.respondedCount}명 참여
        </Text>
      </HStack>
    </ActivityLink>
  );
}

function formatDiningListDate(timestamp: number) {
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(timestamp);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? '';
  return `${part('month')}.${part('day')} (${part('weekday')}) ${part('hour')}:${part('minute')}`;
}
