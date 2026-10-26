/** 공지의 대상·읽음 집계와 상세·수정 진입점을 한 행으로 표시한다. */
import { ActionButton } from '@yapp-plus/ui';
import { Ellipsis } from 'lucide-react';
import { Badge } from '@seed-design/react';
import { Link } from '@tanstack/react-router';
import {
  NoticeDeleteDialog,
  getNoticeAudience,
  getNoticeDeadline,
  getNoticeSummary,
  type Member,
  type Notice,
} from '~/features/notice-management';
import { noticeCategoryLabels } from '../model/notice-search';
import * as styles from './notice-card.css';

const audienceLabels = {
  all: '전체 사용자',
  active: '활동회원',
  regular: '정회원',
  completed: '수료회원',
};

const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 제출 공지는 활동회원 내 선택 직군을 표시하고 일반 공지는 회원 구분을 표시한다. */
function audienceLabel(notice: Notice) {
  if (notice.category === 'submission') {
    return notice.audience === 'all' ? '활동회원 전체' : `활동회원 · ${notice.audience.join(', ')}`;
  }
  return audienceLabels[notice.audience];
}

/** 원본 공지와 전체 명단으로 상세 화면과 같은 계산 함수를 사용한다. */
export function NoticeCard({
  notice,
  members,
  now,
}: {
  notice: Notice;
  members: Member[];
  now: Date;
}) {
  return (
    <article className={styles.card} aria-label={notice.title}>
      <NoticeIdentity notice={notice} now={now} />
      <NoticeReadSummary notice={notice} members={members} />
      <dl className={styles.questions}>
        <dt>미답변 질문</dt>
        <dd className={styles.questionCount}>{notice.unansweredCount}</dd>
      </dl>
      <NoticeActions notice={notice} />
    </article>
  );
}

/** 종류·마감·제목·게시일·대상을 묶어 공지의 기본 정보를 표시한다. */
function NoticeIdentity({ notice, now }: { notice: Notice; now: Date }) {
  return (
    <div className={styles.identity}>
      <div className={styles.heading}>
        <Badge variant="weak" tone={notice.category === 'operation' ? 'positive' : 'informative'}>
          {noticeCategoryLabels[notice.category]}
        </Badge>
        {notice.category === 'submission' && (
          <Badge variant="weak" tone="critical">
            {getNoticeDeadline(notice.submission.deadlineAt, now)}
          </Badge>
        )}
        <h2 className={styles.title}>
          <Link
            className={styles.titleLink}
            to="/notices/$noticeId"
            params={{ noticeId: notice.id }}
            search={{}}
          >
            {notice.title}
          </Link>
        </h2>
      </div>
      <p className={styles.meta}>
        <time dateTime={notice.createdAt}>{dateFormat.format(new Date(notice.createdAt))}</time>
        <span aria-hidden="true">·</span>
        <span>{audienceLabel(notice)}</span>
      </p>
    </div>
  );
}

/** 상세와 같은 계산 함수로 대상 회원의 읽음 현황을 표시한다. */
function NoticeReadSummary({ notice, members }: { notice: Notice; members: Member[] }) {
  const summary = getNoticeSummary(getNoticeAudience(notice, members), notice.readAtByMemberId);

  return (
    <div className={styles.reading}>
      <div className={styles.readingLabel}>
        <span>읽음</span>
        <span>
          {summary.readCount} / {summary.targetCount}명
        </span>
      </div>
      <progress
        className={styles.progress}
        aria-label={`${notice.title} 읽음 비율`}
        value={summary.readPercentage}
        max={100}
      />
      <span className={styles.percentage}>{summary.readPercentage}%</span>
    </div>
  );
}

/** 네이티브 펼침 동작으로 수정·삭제 액션을 제공한다. */
function NoticeActions({ notice }: { notice: Notice }) {
  return (
    <details className={styles.menu}>
      <ActionButton asChild variant="neutralWeak" size="small" className={styles.menuButton}>
        <summary aria-label={`${notice.title} 관리`}>
          <Ellipsis size={18} aria-hidden="true" />
        </summary>
      </ActionButton>
      <div className={styles.menuContent}>
        <ActionButton asChild variant="ghost" size="small">
          <Link to="/notices/$noticeId/edit" params={{ noticeId: notice.id }} search={{}}>
            수정
          </Link>
        </ActionButton>
        <NoticeDeleteDialog notice={notice} />
      </div>
    </details>
  );
}
