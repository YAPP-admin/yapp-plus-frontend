/** 회원 공지 상세를 조회해 읽기 전용 제출·첨부 정보와 Markdown 본문을 보여준다. */
'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { IconCheckmarkCircleFill } from '@karrotmarket/react-monochrome-icon';
import { Suspense, useState } from 'react';
import { useNativeAuthSession } from '@/features/auth';
import { NoticeErrorContent } from '@/features/member-notice';
import { noticeDetailData } from '../model/notice-detail-data';
import { memberNoticeDetailQueryOptions, noticeIdFromParam } from '../model/notice-detail-query';
import {
  assignmentChip,
  attachmentImage,
  attachmentItem,
  attachmentList,
  attachmentMeta,
  attachmentName,
  attachmentSection,
  attachmentTitle,
  confirmCount,
  confirmQuestion,
  confirmSection,
  confirmTextGroup,
  container,
  contentSection,
  dateText,
  dDayChip,
  disabledCheckButton,
  etcChip,
  headerSection,
  metaBox,
  metaInfoRow,
  metaLabel,
  metaLink,
  metaRow,
  metaValue,
  sessionChip,
  titleText,
} from './notice-detail-page.css';
import { NoticeDetailHeader } from './notice-detail-header';
import { NoticeDetailErrorBoundary } from './notice-detail-error-boundary';
import { NoticeMarkdown } from './notice-markdown';

/** Stackflow에서 문자열로 전달한 공지 ID를 상세 query 경계에 연결한다. */
export function NoticeDetailPage({ noticeId }: { noticeId: string }) {
  const { phase } = useNativeAuthSession();
  const postId = noticeIdFromParam(noticeId);
  const canQuery =
    phase === 'SIGNED_IN' ||
    (phase === 'BROWSER' && import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true');

  if (!postId) {
    return <NoticeDetailErrorContent />;
  }

  if (!canQuery) {
    return (
      <NoticeDetailErrorContent descriptionText="YAPP+ 앱에 로그인한 후 공지를 확인할 수 있어요." />
    );
  }

  return (
    <NoticeDetailErrorBoundary>
      <Suspense fallback={<NoticeDetailLoading />}>
        <NoticeDetailContent postId={postId} />
      </Suspense>
    </NoticeDetailErrorBoundary>
  );
}

function NoticeDetailContent({ postId }: { postId: number }) {
  const { apiOptions } = useNativeAuthSession();
  const { data } = useSuspenseQuery(memberNoticeDetailQueryOptions(postId, apiOptions));
  const detail = noticeDetailData(data);
  const categoryChipClass = getCategoryChipClass(detail.type);

  return (
    <>
      <NoticeDetailHeader categoryLabel={detail.categoryLabel} />
      <main className={container}>
        <section className={headerSection}>
          <h1 className={titleText}>{detail.title}</h1>
          <div className={metaInfoRow}>
            <span className={categoryChipClass}>{detail.categoryLabel}</span>
            {detail.deadline ? <span className={dDayChip}>{detail.deadline.dDay}</span> : null}
            <time className={dateText} dateTime={detail.createdDate}>
              {detail.createdDateLabel}
            </time>
          </div>
        </section>

        {detail.deadline ? <NoticeAssignment detail={detail.deadline} /> : null}

        <article className={contentSection}>
          <NoticeMarkdown content={detail.contentMarkdown} />
        </article>

        {detail.images.length ? <NoticeAttachments images={detail.images} /> : null}

        <section className={confirmSection} aria-label="공지 확인">
          <div className={confirmTextGroup}>
            <p className={confirmQuestion}>공지를 다 읽으셨나요?</p>
            <p className={confirmCount}>지금까지 {detail.readCount}명이 확인했어요!</p>
          </div>
          <button type="button" className={disabledCheckButton} disabled>
            <IconCheckmarkCircleFill width={18} height={18} />
            <span>{detail.read ? '확인했어요' : '확인 기능 준비 중'}</span>
          </button>
        </section>
      </main>
    </>
  );
}

function NoticeAssignment({
  detail,
}: {
  detail: NonNullable<ReturnType<typeof noticeDetailData>['deadline']>;
}) {
  return (
    <section className={metaBox} aria-label="제출 안내">
      <div className={metaRow}>
        <span className={metaLabel}>제출 기한</span>
        <time className={metaValue}>{detail.label}까지</time>
      </div>
      <div className={metaRow}>
        <span className={metaLabel}>제출 대상</span>
        <span className={metaValue}>{detail.positions}</span>
      </div>
      <div className={metaRow}>
        <span className={metaLabel}>제출 방법</span>
        <span className={metaValue}>
          <a
            href={detail.submissionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={metaLink}
          >
            🔗 {detail.submissionLinkText}
          </a>
        </span>
      </div>
    </section>
  );
}

function NoticeAttachments({ images }: { images: ReturnType<typeof noticeDetailData>['images'] }) {
  return (
    <section className={attachmentSection} aria-label="첨부 이미지">
      <h2 className={attachmentTitle}>첨부 이미지</h2>
      <ul className={attachmentList}>
        {images.map((image) => (
          <li key={image.imageKey} className={attachmentItem}>
            <NoticeAttachmentImage src={image.readUrl} alt={image.filename} />
            <span className={attachmentName}>{image.filename}</span>
            <span className={attachmentMeta}>{image.contentType}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NoticeAttachmentImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <output>이미지를 표시하지 못했어요.</output>;
  }
  return <img className={attachmentImage} src={src} alt={alt} onError={() => setFailed(true)} />;
}

function getCategoryChipClass(category: ReturnType<typeof noticeDetailData>['type']) {
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

function NoticeDetailLoading() {
  return <output>공지 상세를 불러오고 있어요.</output>;
}

function NoticeDetailErrorContent({ descriptionText }: { descriptionText?: string }) {
  return (
    <main className={container}>
      <NoticeErrorContent descriptionText={descriptionText} />
    </main>
  );
}
