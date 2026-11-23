/** 회식 목록의 상태 필터와 피그마 전용 탐색 모양을 렌더링합니다. */
'use client';

import { IconCalendarFill } from '@karrotmarket/react-monochrome-icon';
import { ActivityLink } from '@/app/navigation/activity-link';
import { Badge, Text } from '@yapp-plus/ui';
import { Chip, HStack } from '@seed-design/react';
import { useState } from 'react';
import { countDiningMembers, getDiningDeadline, type Dining } from '../model/dining-model';
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

/** 제공된 회식 목록을 개발 전용 필터와 함께 표시합니다. */
export function DiningListPage({ items, now }: { items: readonly Dining[]; now: number }) {
  const [filter, setFilter] = useState<ListFilter>('ALL');
  const filteredItems = items.filter((dining) => {
    const status = getDiningDeadline(dining.surveyClosesAt, now).status;
    return filter === 'ALL' || (filter === 'OPEN' ? status === 'open' : status === 'closed');
  });

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
        <Chip.RadioRoot
          value={filter}
          name="dining-status-filter"
          aria-label="뒤풀이 상태 필터"
          onValueChange={(value) => {
            const nextFilter = LIST_FILTERS.find(({ value: filterValue }) => filterValue === value);
            if (nextFilter) {
              setFilter(nextFilter.value);
            }
          }}
        >
          <ul className={filterList}>
            {LIST_FILTERS.map(({ value, label }) => (
              <li key={value}>
                <Chip.RadioItem
                  value={value}
                  size="medium"
                  variant="solid"
                  className={[filterButton, filter === value ? filterButtonSelected : ''].join(' ')}
                >
                  <Chip.Label>{label}</Chip.Label>
                </Chip.RadioItem>
              </li>
            ))}
          </ul>
        </Chip.RadioRoot>
        <ul className={diningList} aria-label="뒤풀이 목록">
          {filteredItems.map((dining) => (
            <li key={dining.id}>
              <DiningCard dining={dining} now={now} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function DiningCard({ dining, now }: { dining: Dining; now: number }) {
  const deadline = getDiningDeadline(dining.surveyClosesAt, now);
  const count = countDiningMembers(dining.members);
  return (
    <ActivityLink
      activityName="DiningDetail"
      activityParams={{ diningId: dining.id }}
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
            {formatDiningListDate(dining.startsAt)}
          </Text>
        </HStack>
        <Text as="span" textStyle="t2Medium" color="fg.neutralSubtle">
          {count.RESPONDED}명 참여
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
  });
  const parts = formatter.formatToParts(timestamp);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? '';
  return `${part('month')}.${part('day')} (${part('weekday')}) 18:30`;
}
