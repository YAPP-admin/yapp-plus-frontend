/** 조회된 공지의 본문·메타 정보와 선택된 현황을 조합한다. */
import { Link } from '@tanstack/react-router';
import { ActionButton, Badge } from '@yapp-plus/ui';
import type { AdminPostDetailResponse } from '@yapp-plus/api/generated';
import { ArrowLeft, Pencil } from 'lucide-react';
import {
  NoticeBody,
  NoticeAttachments,
  useAdminNoticeRecipientsQuery,
} from '~/features/notice-management';
import type { NoticeDetailTab } from '../model/notice-detail-search';
import { NoticeReaders } from './notice-readers';
import * as styles from './notice-detail-page.css';

const categoryLabels = { SESSION: '세션', OPERATION: '기타', ASSIGNMENT: '제출' } as const;

const audienceLabels = { ALL_USERS: '전체 사용자', PLAYER: '활동회원', OB: '정회원', COMPLETED_MEMBER: '수료회원' } as const;

const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 목록과 동일한 대상·집계 계산을 사용하고 전체 대상 행을 표에 전달한다. */
export function NoticeDetailContent({
  notice,
  generationId,
  tab,
}: {
  notice: AdminPostDetailResponse;
  generationId: number;
  tab: NoticeDetailTab;
}) {
  const readersQuery = useAdminNoticeRecipientsQuery(generationId, String(notice.postId));
  const summary = {
    readCount: notice.readCount,
    targetCount: notice.recipientCount,
    unreadCount: Math.max(0, notice.recipientCount - notice.readCount),
    readPercentage: notice.recipientCount
      ? Math.round((notice.readCount / notice.recipientCount) * 100)
      : 0,
  };
  let category: string = categoryLabels.OPERATION;
  if (notice.type === 'SESSION') {
    category = categoryLabels.SESSION;
  } else if (notice.type === 'ASSIGNMENT') {
    category = categoryLabels.ASSIGNMENT;
  }

  function renderReaders() {
    if (readersQuery.isPending) {
      return <output>회원별 읽음 현황을 불러오는 중입니다.</output>;
    }
    if (readersQuery.error) {
      return (
        <div role="alert">
          <p>회원별 읽음 현황을 불러오지 못했습니다.</p>
          <ActionButton type="button" variant="neutralWeak" onClick={() => void readersQuery.refetch()}>
            다시 시도
          </ActionButton>
        </div>
      );
    }
    return (
      <>
        <NoticeReaders readers={readersQuery.recipients} />
        {readersQuery.hasNextPage && (
          <ActionButton
            type="button"
            variant="neutralWeak"
            loading={readersQuery.isFetchingNextPage}
            onClick={() => void readersQuery.fetchNextPage()}
          >
            더 불러오기
          </ActionButton>
        )}
        {readersQuery.isFetchingNextPage && <output>다음 현황을 불러오는 중입니다.</output>}
      </>
    );
  }

  return (
    <>
      <Link className={styles.backLink} to="/notices" search={{}}>
        <ArrowLeft size={14} aria-hidden="true" />
        공지 목록으로
      </Link>

      <section className={styles.headerSection} aria-labelledby="notice-detail-title">
        <NoticeDetailHeader notice={notice} category={category} />

        <ActionButton asChild variant="neutralWeak" className={styles.editLink}>
          <Link to="/notices/$noticeId/edit" params={{ noticeId: String(notice.postId) }} search={{}}>
            <Pencil size={13} aria-hidden="true" />
            공지 수정
          </Link>
        </ActionButton>
      </section>

      <NoticeDetailTabs noticeId={String(notice.postId)} tab={tab} />

      <NoticeReadSummary summary={summary} />

      <section className={styles.readersSection} aria-labelledby="notice-readers-title">
        <div className={styles.sectionHeading}>
          <div>
            <h2 id="notice-readers-title" className={styles.sectionTitle}>
              회원별 읽음 현황
            </h2>
            <p className={styles.sectionDescription}>
              회원이 공지를 처음 확인한 시각을 기준으로 표시해요.
            </p>
          </div>
          <p className={styles.totalCount}>전체 {summary.targetCount}명</p>
        </div>

        {renderReaders()}
        {/*
          TODO(다음 스프린트): 질문 API 연동 후 질문 탭과 질문 목록을 구현한다.
          {tab === 'questions' && <p className={styles.placeholder}>질문 목록을 준비 중입니다.</p>}
        */}
      </section>

      <section className={styles.bodySection} aria-labelledby="notice-body-title">
        <h2 id="notice-body-title" className={styles.sectionTitle}>
          공지 내용
        </h2>
        <NoticeBody markdown={notice.contentMarkdown} />

        <NoticeAttachments images={notice.images} />

        {notice.assignment && <NoticeSubmission assignment={notice.assignment} />}
      </section>
    </>
  );
}

/** 상세의 읽음 집계를 Figma의 요약 카드 구조로 표시한다. */
function NoticeReadSummary({
  summary,
}: {
  summary: { readCount: number; targetCount: number; unreadCount: number; readPercentage: number };
}) {
  return (
    <section className={styles.readSummary} aria-labelledby="notice-read-summary-title">
      <div className={styles.summaryMetric}>
        <p id="notice-read-summary-title" className={styles.summaryLabel}>
          공지 확인 현황
        </p>
        <p className={styles.summaryValue}>
          <strong className={styles.summaryValueNumber}>{summary.readCount}</strong>
          <span>/ {summary.targetCount}명 읽음</span>
          <Badge variant="weak" tone="informative">
            {summary.readPercentage}%
          </Badge>
        </p>
      </div>

      <div className={styles.summaryProgress}>
        <progress
          className={styles.progress}
          aria-label="공지 읽음 비율"
          value={summary.readPercentage}
          max={100}
        />
        <div className={styles.progressLegend}>
          <span>
            <i className={styles.readDot} aria-hidden="true" /> 읽음 {summary.readCount}명
          </span>
          <span>
            <i className={styles.unreadDot} aria-hidden="true" /> 안 읽음 {summary.unreadCount}명
          </span>
        </div>
      </div>

      {/*
        TODO(다음 스프린트): 알림 발송 API 연결 후 안 읽은 회원에게 알림 보내기를 구현한다.
        <ActionButton type="button" variant="neutralWeak" size="small" disabled className={styles.notifyButton}>
          안 읽은 회원에게 알림 보내기
        </ActionButton>
      */}
    </section>
  );
}

/** 대상 문구는 공지 종류와 대상 값에서 계산하며 중간 상태를 변경하지 않는다. */
function getAudienceLabel(notice: AdminPostDetailResponse) {
  if (notice.audience.type === 'POSITION') {
    return `활동회원 · ${notice.audience.positions.join(', ')}`;
  }

  return audienceLabels[notice.audience.target ?? 'ALL_USERS'];
}

/** 종류·대상·제목·작성 시각을 하나의 정보 영역으로 표시한다. */
function NoticeDetailHeader({ notice, category }: { notice: AdminPostDetailResponse; category: string }) {
  return (
    <header className={styles.detailHeader}>
      <div className={styles.metaRow}>
        <Badge variant="weak" tone="informative">
          {category}
        </Badge>
        <Badge variant="weak" tone="neutral">
          {getAudienceLabel(notice)}
        </Badge>
        <span className={styles.metaSeparator} aria-hidden="true" />
        <time className={styles.createdAt} dateTime={notice.publishedAt}>
          {dateFormat.format(new Date(notice.publishedAt))} 작성
        </time>
      </div>

      <h2 id="notice-detail-title" className={styles.title}>
        {notice.title}
      </h2>

      <p className={styles.headerDescription}>공지 본문과 회원별 확인 현황을 확인해 주세요.</p>
    </header>
  );
}

/** URL 기반 상세 탐색은 페이지 내 내비게이션 링크로 제공한다. */
function NoticeDetailTabs({ noticeId, tab }: { noticeId: string; tab: NoticeDetailTab }) {
  return (
    <nav className={styles.tabs} aria-label="공지 상세 구분">
      <Link
        className={styles.tab}
        to="/notices/$noticeId"
        params={{ noticeId }}
        search={{ tab: 'readers' }}
        resetScroll={false}
        activeOptions={{ exact: true, includeSearch: true }}
        aria-current={tab === 'readers' ? 'page' : undefined}
      >
        읽음 현황
      </Link>
      {/*
        TODO(다음 스프린트): 질문 API가 확정되면 질문 탭을 다시 노출한다.
        <Link className={styles.tab} to="/notices/$noticeId" params={{ noticeId }} search={{ tab: 'questions' }}>
          질문
        </Link>
      */}
    </nav>
  );
}

/** 제출 공지의 마감과 선택적 제출 링크를 표시한다. */
function NoticeSubmission({
  assignment,
}: {
  assignment: AdminPostDetailResponse['assignment'] & object;
}) {
  return (
    <section aria-label="제출 안내">
      <p>
        마감:{' '}
        <time dateTime={assignment.deadlineDate}>
          {assignment.deadlineDate}
        </time>{' '}
      </p>

      {assignment.submissionUrl && (
        <a className={styles.link} href={assignment.submissionUrl}>
          {assignment.submissionLinkText}
        </a>
      )}
    </section>
  );
}
