'use client';

import { staticContentEnabled } from '@/features/static-content';

import { useThrowQueryError } from '@/shared/lib/query-error-policy';
import { useRefetchOnScreenReturn } from '@/shared/lib/screen-activity';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { List, VStack } from '@seed-design/react';
import { useNativeAuthSession } from '@/features/auth';
import { formatKoreanTime, koreanTimestamp } from '@/shared/lib/korean-date-time';
import { scheduleQueryOptions } from '../model/schedule-query';
import { list, srOnly } from './schedule-page.css';
import { ScheduleEmpty } from './schedule-empty';
import { ScheduleItem } from './schedule-item';
import { ScheduleErrorBoundary } from './schedule-error-boundary';
import { ScheduleLoading } from './schedule-loading';

const dayLabels = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

export function SchedulePage() {
  const { phase } = useNativeAuthSession();
  const canQuery =
    staticContentEnabled() ||
    phase === 'SIGNED_IN' ||
    (phase === 'BROWSER' && import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true');
  return (
    <VStack as="main" width="full" maxWidth="480px" mx="auto" minHeight="100%" bg="bg.layerDefault">
      <h1 className={srOnly}>일정</h1>
      <VStack width="full" pt="x2_5" px="x5" pb="x10">
        {canQuery ? (
          <ScheduleErrorBoundary>
            <Suspense fallback={<ScheduleLoading />}>
              <ScheduleList />
            </Suspense>
          </ScheduleErrorBoundary>
        ) : (
          <output>일정은 YAPP+ 앱에 로그인한 후 확인할 수 있어요.</output>
        )}
      </VStack>
    </VStack>
  );
}

function ScheduleList() {
  const { apiOptions } = useNativeAuthSession();
  const query = useSuspenseQuery(scheduleQueryOptions(apiOptions));

  useRefetchOnScreenReturn(query);
  useThrowQueryError(query);
  const { data, dataUpdatedAt } = query;
  return (
    <>
      {data.sessions.length ? (
        <List.Root className={list} aria-label="세션 일정 목록">
          {data.sessions.map((session) => (
            <li key={String(session.sessionId)}>
              <ScheduleItem
                title={session.name}
                date={`${Number(session.date.slice(5, 7))}.${Number(session.date.slice(8))} (${dayLabels[session.dayOfWeek]})`}
                location={session.location ?? '-'}
                time={`${formatKoreanTime(session.startTime)} ~ ${formatKoreanTime(session.endTime)}`}
                chipText={session.type === 'REGULAR' ? '정규 세션' : undefined}
                isPast={koreanTimestamp(session.date, session.endTime) <= dataUpdatedAt}
              />
            </li>
          ))}
        </List.Root>
      ) : (
        <ScheduleEmpty />
      )}
    </>
  );
}
