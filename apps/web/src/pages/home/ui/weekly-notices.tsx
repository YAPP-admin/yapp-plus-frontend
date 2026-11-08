/** 홈의 이번 주 공지를 세션 카드와 독립된 query 경계에서 보여주는 UI다. */
'use client';

import { useRefetchOnScreenReturn } from '@/shared/lib/screen-activity';
import { useSuspenseQuery } from '@tanstack/react-query';
import { IconChevronRightFill } from '@karrotmarket/react-monochrome-icon';
import { Badge } from '@yapp-plus/ui';
import { HStack, VStack } from '@seed-design/react';
import { Suspense } from 'react';
import { ActivityLink } from '@/app/navigation/activity-link';
import { useNativeAuthSession } from '@/features/auth';
import {
  memberNoticeCategoryLabel,
  memberNoticeListQueryOptions,
  type NoticeCategory,
} from '@/features/member-notice';
import { weeklyNotices } from '../model/weekly-notices';
import {
  chipBlue,
  chipGray,
  noticeCard,
  noticeChevron,
  noticeContent,
  noticesSectionTitle,
  noticeTitle,
} from './home-page.css';
import { WeeklyNoticesErrorBoundary } from './weekly-notices-error-boundary';

/** 인증 가능 여부에 따라 이번 주 공지 query를 시작하고 오류를 섹션 안에서 복구한다. */
export function WeeklyNotices() {
  const { phase } = useNativeAuthSession();
  const canQuery =
    phase === 'SIGNED_IN' ||
    (phase === 'BROWSER' && import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true');

  return (
    <VStack as="section" gap="x3" aria-label="이번 주 공지">
      <h2 className={noticesSectionTitle}>이번 주 공지</h2>
      {canQuery ? (
        <WeeklyNoticesErrorBoundary>
          <Suspense fallback={<output>이번 주 공지를 불러오고 있어요.</output>}>
            <WeeklyNoticesContent />
          </Suspense>
        </WeeklyNoticesErrorBoundary>
      ) : (
        <output>공지는 YAPP+ 앱에 로그인한 후 확인할 수 있어요.</output>
      )}
    </VStack>
  );
}

function WeeklyNoticesContent() {
  const { apiOptions } = useNativeAuthSession();
  const query = useSuspenseQuery(memberNoticeListQueryOptions('ALL', apiOptions));
  useRefetchOnScreenReturn(query);
  const { data } = query;
  const notices = weeklyNotices(data);

  return (
    <>
      {notices.length ? (
        <VStack gap="x2_5">
          {notices.map((notice) => (
            <ActivityLink
              key={notice.postId}
              activityName="NoticeDetail"
              activityParams={{ noticeId: String(notice.postId) }}
              className={noticeCard}
              aria-label={notice.title}
            >
              <VStack gap="x2" className={noticeContent}>
                <HStack align="center" gap="x1_5">
                  <NoticeCategoryBadge category={notice.type} />
                </HStack>
                <p className={noticeTitle}>{notice.title}</p>
              </VStack>
              <span className={noticeChevron} aria-hidden="true">
                <IconChevronRightFill width={20} height={20} />
              </span>
            </ActivityLink>
          ))}
        </VStack>
      ) : (
        <output>이번 주 공지가 없어요.</output>
      )}
    </>
  );
}

function NoticeCategoryBadge({ category }: { category: Exclude<NoticeCategory, 'ALL'> }) {
  return (
    <Badge
      variant="weak"
      tone={category === 'SESSION' ? 'informative' : 'neutral'}
      className={category === 'SESSION' ? chipBlue : chipGray}
    >
      {memberNoticeCategoryLabel(category)}
    </Badge>
  );
}
