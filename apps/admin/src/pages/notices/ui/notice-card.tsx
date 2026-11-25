/** 공지의 대상·읽음 집계와 상세·수정 진입점을 한 행으로 표시한다. */
import { ActionButton, Badge } from '@yapp-plus/ui';
import type { AdminPostListItemResponse } from '@yapp-plus/api/generated';
import { Ellipsis } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { NoticeDeleteDialog } from '~/features/notice-management';
import { noticeCategoryLabels } from '../model/notice-search';
import type { NoticeCategory } from '../model/notice-search';
import * as styles from './notice-card.css';

const audienceLabels = {
  ALL_USERS: '전체 사용자',
  PLAYER: '활동회원',
  OB: '정회원',
  COMPLETED_MEMBER: '수료회원',
} as const;

const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 제출 공지는 활동회원 내 선택 직군을 표시하고 일반 공지는 회원 구분을 표시한다. */
function categoryOf(notice: AdminPostListItemResponse): NoticeCategory {
  if (notice.type === 'SESSION') {
    return 'session';
  }
  if (notice.type === 'ASSIGNMENT') {
    return 'submission';
  }
  return 'operation' as const;
}

function audienceLabel(notice: AdminPostListItemResponse) {
  if (notice.audience.type === 'POSITION') {
    return `활동회원 · ${notice.audience.positions.join(', ')}`;
  }
  return audienceLabels[notice.audience.target ?? 'ALL_USERS'];
}

/** 원본 공지와 전체 명단으로 상세 화면과 같은 계산 함수를 사용한다. */
export function NoticeCard({
  notice,
  generationId,
  now,
}: {
  notice: AdminPostListItemResponse;
  generationId: number;
  now: Date;
}) {
  const category = categoryOf(notice);
  return (
    <article className={styles.card} aria-label={notice.title}>
      <NoticeIdentity notice={notice} category={category} now={now} />
      <NoticeReadSummary notice={notice} />
      {/* TODO(다음 스프린트): 질문 API 연동 시 미답변 질문 집계를 다시 노출한다.
      <dl className={styles.questions}>
        <dt>미답변 질문</dt>
        <dd className={styles.questionCount}>{notice.unansweredCount}</dd>
      </dl>
      */}
      <NoticeActions notice={notice} generationId={generationId} />
    </article>
  );
}

/** 종류·마감·제목·게시일·대상을 묶어 공지의 기본 정보를 표시한다. */
function NoticeIdentity({
  notice,
  category,
  now,
}: {
  notice: AdminPostListItemResponse;
  category: NoticeCategory;
  now: Date;
}) {
  return (
    <div className={styles.identity}>
      <div className={styles.heading}>
        <Badge variant="weak" tone={category === 'operation' ? 'positive' : 'informative'}>
          {noticeCategoryLabels[category]}
        </Badge>
        {category === 'submission' && notice.daysUntilDeadline !== null && (
          <Badge variant="weak" tone="critical">
            {getNoticeDeadline(notice.daysUntilDeadline, now)}
          </Badge>
        )}
        <h2 className={styles.title}>
          <Link
            className={styles.titleLink}
            to="/notices/$noticeId"
            params={{ noticeId: String(notice.postId) }}
            search={{}}
          >
            {notice.title}
          </Link>
        </h2>
      </div>
      <p className={styles.meta}>
        <time dateTime={notice.publishedAt}>{dateFormat.format(new Date(notice.publishedAt))}</time>
        <span aria-hidden="true">·</span>
        <span>{audienceLabel(notice)}</span>
      </p>
    </div>
  );
}

/** 상세와 같은 계산 함수로 대상 회원의 읽음 현황을 표시한다. */
function NoticeReadSummary({ notice }: { notice: AdminPostListItemResponse }) {
  const readPercentage = notice.recipientCount
    ? Math.round((notice.readCount / notice.recipientCount) * 100)
    : 0;

  return (
    <div className={styles.reading}>
      <div className={styles.readingLabel}>
        <span>읽음</span>
        <span>
          {notice.readCount} / {notice.recipientCount}명
        </span>
      </div>
      <progress
        className={styles.progress}
        aria-label={`${notice.title} 읽음 비율`}
        value={readPercentage}
        max={100}
      />
      <span className={styles.percentage}>{readPercentage}%</span>
    </div>
  );
}

/** 네이티브 펼침 동작으로 수정·삭제 액션을 제공한다. */
function NoticeActions({
  notice,
  generationId,
}: {
  notice: AdminPostListItemResponse;
  generationId: number;
}) {
  return (
    <details className={styles.menu}>
      <ActionButton asChild variant="neutralWeak" size="small" className={styles.menuButton}>
        <summary aria-label={`${notice.title} 관리`}>
          <Ellipsis size={18} aria-hidden="true" />
        </summary>
      </ActionButton>
      <div className={styles.menuContent}>
        <ActionButton asChild variant="ghost" size="small">
          <Link
            to="/notices/$noticeId/edit"
            params={{ noticeId: String(notice.postId) }}
            search={{}}
          >
            수정
          </Link>
        </ActionButton>
        <NoticeDeleteDialog notice={notice} generationId={generationId} />
      </div>
    </details>
  );
}

function getNoticeDeadline(daysUntilDeadline: number, now: Date) {
  void now;
  if (daysUntilDeadline < 0) {
    return '마감';
  }
  if (daysUntilDeadline === 0) {
    return 'D-day';
  }
  return `D-${daysUntilDeadline}`;
}
