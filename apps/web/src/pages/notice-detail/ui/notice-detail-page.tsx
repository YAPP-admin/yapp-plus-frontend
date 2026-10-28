'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { IconCheckmarkCircleFill } from '@karrotmarket/react-monochrome-icon';
import { NoticeErrorPage } from '@/pages/notices';
import { getNoticeDetailById, type NoticeDetail } from '../model/notice-detail-data';
import {
  assignmentChip,
  checkButtonConfirmed,
  checkButtonUnconfirmed,
  confirmCount,
  confirmQuestion,
  confirmSection,
  confirmTextGroup,
  container,
  contentSection,
  dateText,
  dDayChip,
  etcChip,
  headerSection,
  metaBox,
  metaInfoRow,
  metaLabel,
  metaLink,
  metaRow,
  metaValue,
  paragraph,
  sessionChip,
  titleText,
} from './notice-detail-page.css';
import { NoticeDetailHeader } from './notice-detail-header';

export type NoticeDetailPageProps = {
  noticeId?: string;
  initialDetail?: NoticeDetail;
};

function getCategoryChipClass(category: NoticeDetail['category']) {
  switch (category) {
    case 'ASSIGNMENT':
      return assignmentChip;
    case 'SESSION':
      return sessionChip;
    case 'ETC':
    default:
      return etcChip;
  }
}

export function NoticeDetailPage({ noticeId: propNoticeId, initialDetail }: NoticeDetailPageProps) {
  const params = useParams<{ noticeId?: string }>();
  const id = propNoticeId ?? params?.noticeId ?? '1';
  const detail = initialDetail ?? getNoticeDetailById(id);

  if (!detail) {
    return <NoticeErrorPage fallbackUrl="/notices" />;
  }

  return <NoticeDetailContent detail={detail} />;
}

function NoticeDetailContent({ detail }: { detail: NoticeDetail }) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedCount, setConfirmedCount] = useState(detail.confirmedCount);

  const handleToggleConfirm = () => {
    if (isConfirmed) {
      setIsConfirmed(false);
      setConfirmedCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsConfirmed(true);
      setConfirmedCount((prev) => prev + 1);
    }
  };

  const categoryChipClass = getCategoryChipClass(detail.category);

  return (
    <>
      <NoticeDetailHeader categoryLabel={detail.categoryLabel} />

      <main className={container}>
        <section className={headerSection}>
          <h1 className={titleText}>{detail.title}</h1>
          <div className={metaInfoRow}>
            <span className={categoryChipClass}>{detail.categoryLabel}</span>
            {detail.dDay ? <span className={dDayChip}>{detail.dDay}</span> : null}
            <time className={dateText}>{detail.date}</time>
          </div>
        </section>

        {detail.metaBox ? (
          <section className={metaBox} aria-label="제출 안내">
            <div className={metaRow}>
              <span className={metaLabel}>제출 기한</span>
              <span className={metaValue}>{detail.metaBox.deadline}</span>
            </div>
            <div className={metaRow}>
              <span className={metaLabel}>제출 대상</span>
              <span className={metaValue}>{detail.metaBox.target}</span>
            </div>
            <div className={metaRow}>
              <span className={metaLabel}>제출 방법</span>
              <span className={metaValue}>
                <a
                  href={detail.metaBox.submissionMethod.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={metaLink}
                >
                  🔗 {detail.metaBox.submissionMethod.label}
                </a>
              </span>
            </div>
          </section>
        ) : null}

        <article className={contentSection}>
          {detail.content.map((p, index) => (
            <p key={index} className={paragraph}>
              {p}
            </p>
          ))}
        </article>

        <section className={confirmSection} aria-label="공지 확인">
          <div className={confirmTextGroup}>
            <p className={confirmQuestion}>공지를 다 읽으셨나요?</p>
            <p className={confirmCount}>지금까지 {confirmedCount}명이 확인했어요!</p>
          </div>
          <button
            type="button"
            className={isConfirmed ? checkButtonConfirmed : checkButtonUnconfirmed}
            onClick={handleToggleConfirm}
            aria-pressed={isConfirmed}
          >
            <IconCheckmarkCircleFill width={18} height={18} />
            <span>확인했어요</span>
          </button>
        </section>
      </main>
    </>
  );
}
