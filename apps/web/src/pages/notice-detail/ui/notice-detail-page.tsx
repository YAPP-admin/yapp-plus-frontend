/** 회원 공지 상세의 API 조회 결과를 기본 정보와 본문으로 표시한다. */
'use client';

import { useQuery } from '@tanstack/react-query';
import { useNativeAuthSession } from '@/features/auth';
import {
  NoticeErrorContent,
  memberNoticeCategoryLabel,
  memberNoticeDateLabel,
} from '@/features/member-notice';
import { memberNoticeDetailQueryOptions, noticeIdFromParam } from '../model/notice-detail-query';
import {
  assignmentChip,
  container,
  contentSection,
  dateText,
  etcChip,
  headerSection,
  metaInfoRow,
  sessionChip,
  titleText,
} from './notice-detail-page.css';
import { NoticeDetailHeader } from './notice-detail-header';
import { NoticeMarkdown } from './notice-markdown';

/** Stackflow의 문자열 ID를 검증한 뒤 인증된 세션으로 상세 API를 조회한다. */
export function NoticeDetailPage({ noticeId }: { noticeId: string }) {
  const { apiOptions, phase } = useNativeAuthSession();
  const postId = noticeIdFromParam(noticeId);
  const canQuery =
    phase === 'SIGNED_IN' ||
    (phase === 'BROWSER' && import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true');
  const { data, isError, isPending } = useQuery({
    ...memberNoticeDetailQueryOptions(postId ?? 0, apiOptions),
    enabled: Boolean(postId && canQuery),
  });

  if (!postId) {
    return <NoticeDetailErrorContent />;
  }

  if (!canQuery) {
    return (
      <NoticeDetailErrorContent descriptionText="YAPP+ 앱에 로그인한 후 공지를 확인할 수 있어요." />
    );
  }

  if (isPending) {
    return <output>공지 상세를 불러오고 있어요.</output>;
  }

  if (isError || !data) {
    return (
      <NoticeDetailErrorContent descriptionText="공지 상세를 불러오지 못했어요. 잠시 후 다시 시도해 주세요." />
    );
  }

  const categoryChipClass = getCategoryChipClass(data.type);

  return (
    <>
      <NoticeDetailHeader categoryLabel={memberNoticeCategoryLabel(data.type)} />
      <main className={container}>
        <section className={headerSection}>
          <h1 className={titleText}>{data.title}</h1>
          <div className={metaInfoRow}>
            <span className={categoryChipClass}>{memberNoticeCategoryLabel(data.type)}</span>
            <time className={dateText} dateTime={data.createdDate}>
              {memberNoticeDateLabel(data.createdDate)}
            </time>
          </div>
        </section>
        <article className={contentSection}>
          <NoticeMarkdown content={data.contentMarkdown} />
        </article>
      </main>
    </>
  );
}

function getCategoryChipClass(category: 'ASSIGNMENT' | 'SESSION' | 'OPERATION') {
  switch (category) {
    case 'ASSIGNMENT':
      return assignmentChip;
    case 'SESSION':
      return sessionChip;
    case 'OPERATION':
      return etcChip;
    default:
      return etcChip;
  }
}

function NoticeDetailErrorContent({ descriptionText }: { descriptionText?: string }) {
  return (
    <main className={container}>
      <NoticeErrorContent descriptionText={descriptionText} />
    </main>
  );
}
