'use client';

/** 공지 목록의 인증·조회·탭 상태를 렌더링하는 페이지 UI다. */
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { ActionButton } from '@yapp-plus/ui';
import { HStack, ProgressCircle, Skeleton, VStack } from '@seed-design/react';
import { Suspense } from 'react';
import { useNativeAuthSession } from '@/features/auth';
import {
  memberNoticeCategoryLabel,
  memberNoticeDateLabel,
  memberNoticeDeadlineLabel,
  memberNoticeListInfiniteQueryOptions,
  type NoticeCategory,
} from '@/features/member-notice';
import { useLoadMoreObserver } from '@/shared/lib/use-load-more-observer';
import { list, srOnly } from './notices-page.css';
import { NoticeEmpty } from './notice-empty';
import { NoticeItem } from './notice-item';
import { NoticeListBoundary } from './notice-list-boundary';
import { NoticeTabs } from './notice-tabs';

export type NoticesPageProps = {
  /** Stackflow Tabs step이 소유한 URL 정규화된 공지 유형이다. */
  category?: NoticeCategory;
  /** 탭 선택을 부모 step으로 올려 URL과 browser back 상태를 함께 갱신한다. */
  onCategoryChange?: (category: NoticeCategory) => void;
};

/** 인증된 회원의 공지 목록 상태와 탭 UI를 연결하는 페이지 경계다. */
export function NoticesPage({ category = 'ALL', onCategoryChange = () => {} }: NoticesPageProps) {
  const { phase } = useNativeAuthSession();
  const canQuery =
    phase === 'SIGNED_IN' ||
    (phase === 'BROWSER' && import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true');

  return (
    <VStack as="main" width="full" maxWidth="480px" mx="auto" bg="bg.layerDefault" minHeight="100%">
      <h1 className={srOnly}>게시판</h1>

      <VStack pt="x2_5" px="x5" pb="x10" width="full">
        {canQuery ? (
          <NoticeListBoundary>
            <Suspense fallback={<NoticeListLoading />}>
              <NoticeList category={category} onCategoryChange={onCategoryChange} />
            </Suspense>
          </NoticeListBoundary>
        ) : (
          <output>게시판은 YAPP+ 앱에 로그인한 후 확인할 수 있어요.</output>
        )}
      </VStack>
    </VStack>
  );
}

function NoticeList({ category, onCategoryChange }: Required<NoticesPageProps>) {
  const { apiOptions } = useNativeAuthSession();
  const notices = useSuspenseInfiniteQuery(
    memberNoticeListInfiniteQueryOptions(category, apiOptions),
  );
  const items = notices.data.pages.flatMap((page) => page.items);
  const isEmpty = items.length === 0 && !notices.hasNextPage;
  const loadMoreRef = useLoadMoreObserver(
    notices.hasNextPage && !notices.isFetching && !notices.isError,
    () => {
      void notices.fetchNextPage({ cancelRefetch: false });
    },
  );
  const retry = () => {
    void (notices.isFetchNextPageError
      ? notices.fetchNextPage({ cancelRefetch: false })
      : notices.refetch({ cancelRefetch: false }));
  };

  return (
    <NoticeTabs selected={category} onSelect={onCategoryChange}>
      {isEmpty ? (
        <NoticeEmpty />
      ) : (
        <ul className={list} aria-label="공지사항 목록">
          {items.map((notice) => (
            <li key={notice.postId}>
              <NoticeItem
                id={String(notice.postId)}
                category={notice.type}
                categoryLabel={memberNoticeCategoryLabel(notice.type)}
                title={notice.title}
                date={memberNoticeDateLabel(notice.createdDate)}
                dDay={memberNoticeDeadlineLabel(notice.daysUntilDeadline)}
              />
            </li>
          ))}
        </ul>
      )}
      {notices.isError && (
        <div role="alert">
          <p>공지사항을 새로 불러오지 못했어요. 이전 내용을 표시하고 있어요.</p>
          <ActionButton
            variant="neutralWeak"
            size="medium"
            disabled={notices.isFetching}
            onClick={retry}
          >
            다시 시도
          </ActionButton>
        </div>
      )}
      {notices.isFetchingNextPage && (
        <HStack justify="center" py="x4">
          <ProgressCircle.Root
            size="24"
            tone="neutral"
            aria-label="다음 공지사항을 불러오고 있어요"
          >
            <ProgressCircle.Track />
            <ProgressCircle.Range />
          </ProgressCircle.Root>
        </HStack>
      )}
      <div ref={loadMoreRef} aria-hidden="true" />
    </NoticeTabs>
  );
}

function NoticeListLoading() {
  return (
    <VStack as="output" gap="x4" aria-label="공지사항을 불러오고 있어요">
      <Skeleton width="full" height="40px" />
      {[0, 1, 2, 3].map((index) => (
        <VStack key={index} gap="x2" py="x4">
          <Skeleton width="72px" height="20px" radius="8" />
          <Skeleton width="70%" height="lineHeight.t5" />
          <Skeleton width="30%" height="lineHeight.t3" />
        </VStack>
      ))}
    </VStack>
  );
}
