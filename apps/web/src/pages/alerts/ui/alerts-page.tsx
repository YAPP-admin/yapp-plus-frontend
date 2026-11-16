'use client';

import { HStack, List, ProgressCircle, Skeleton, VStack } from '@seed-design/react';
import { BackButton } from '@/app/navigation/back-button';
import { ActivityLink } from '@/app/navigation/activity-link';
import { Image } from '@/app/navigation/image';
import { useNativeAuthSession } from '@/features/auth';
import { useRefetchOnScreenReturn } from '@/shared/lib/screen-activity';
import { useLoadMoreObserver } from '@/shared/lib/use-load-more-observer';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { alertSentDateLabel } from '../model/alerts-display';
import { alertsInfiniteQueryOptions } from '../model/alerts-query';
import { AlertsListBoundary } from './alerts-list-boundary';
import {
  body,
  container,
  emptyContainer,
  emptyGraphic,
  emptyText,
  header,
  headerSpacer,
  headerTitle,
  itemDate,
  itemMessage,
  list,
  listItem,
} from './alerts-page.css';

/** 인증된 회원의 알림 수신 기록을 목록으로 표시한다. */
export function AlertsPage() {
  const { phase } = useNativeAuthSession();
  const canQuery =
    phase === 'SIGNED_IN' ||
    (phase === 'BROWSER' && import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true');

  return (
    <VStack className={container}>
      <HStack as="header" align="center" justify="space-between" className={header}>
        <BackButton
          fallbackActivityName="Tabs"
          fallbackActivityParams={{ initialTab: 'home' }}
          iconOnly
        />
        <h1 className={headerTitle}>알림</h1>
        <div className={headerSpacer} aria-hidden="true" />
      </HStack>

      <VStack className={body}>
        {canQuery ? (
          <AlertsListBoundary>
            <Suspense fallback={<AlertsLoading />}>
              <AlertsList />
            </Suspense>
          </AlertsListBoundary>
        ) : (
          <output>알림은 YAPP+ 앱에 로그인한 후 확인할 수 있어요.</output>
        )}
      </VStack>
    </VStack>
  );
}

function AlertsList() {
  const { apiOptions } = useNativeAuthSession();
  const alerts = useSuspenseInfiniteQuery(alertsInfiniteQueryOptions(apiOptions));
  useRefetchOnScreenReturn(alerts);
  const items = alerts.data.pages.flatMap((page) => page.items);
  const loadMoreRef = useLoadMoreObserver(
    alerts.hasNextPage && !alerts.isFetching && !alerts.isError,
    () => {
      void alerts.fetchNextPage({ cancelRefetch: false });
    },
  );

  if (items.length === 0 && !alerts.hasNextPage) {
    return <AlertsEmpty />;
  }

  return (
    <>
      <List.Root className={list} aria-label="알림 목록">
        {items.map((item) => (
          <List.Item key={item.id} className={listItem}>
            {item.type === 'POST' && item.postId !== null ? (
              <List.Content asChild gap="x2">
                <ActivityLink
                  activityName="NoticeDetail"
                  activityParams={{ noticeId: String(item.postId) }}
                  aria-label={`공지 알림: ${item.content}`}
                >
                  <AlertContent content={item.content} sentDate={item.sentDate} />
                </ActivityLink>
              </List.Content>
            ) : (
              <List.Content gap="x2">
                <AlertContent content={item.content} sentDate={item.sentDate} />
              </List.Content>
            )}
          </List.Item>
        ))}
      </List.Root>
      {alerts.isFetchingNextPage && (
        <HStack justify="center" py="x4">
          <ProgressCircle.Root size="24" tone="neutral" aria-label="다음 알림을 불러오고 있어요">
            <ProgressCircle.Track />
            <ProgressCircle.Range />
          </ProgressCircle.Root>
        </HStack>
      )}
      <div ref={loadMoreRef} aria-hidden="true" />
    </>
  );
}

function AlertContent({ content, sentDate }: { content: string; sentDate: string }) {
  return (
    <>
      <List.Title asChild>
        <p className={itemMessage}>{content}</p>
      </List.Title>
      <List.Detail asChild>
        <time className={itemDate}>{alertSentDateLabel(sentDate)}</time>
      </List.Detail>
    </>
  );
}

function AlertsEmpty() {
  return (
    <VStack
      as="section"
      align="center"
      justify="center"
      gap="x5"
      className={emptyContainer}
      aria-label="알림 없음"
    >
      <Image
        src="/images/notices/graphic-none.svg"
        alt=""
        width={90}
        height={74}
        className={emptyGraphic}
      />
      <p className={emptyText}>아직 알림이 없어요</p>
    </VStack>
  );
}

function AlertsLoading() {
  return (
    <VStack as="output" gap="x4" aria-label="알림을 불러오고 있어요">
      {[0, 1, 2].map((index) => (
        <VStack key={index} gap="x2" py="x5">
          <Skeleton width="70%" height="lineHeight.t5" />
          <Skeleton width="30%" height="lineHeight.t3" />
        </VStack>
      ))}
    </VStack>
  );
}
