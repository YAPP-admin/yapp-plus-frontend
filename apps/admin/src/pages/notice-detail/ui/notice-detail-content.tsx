/** 조회된 공지의 본문·메타 정보와 선택된 현황을 조합한다. */
import { Link } from '@tanstack/react-router';
import { ActionButton } from '@yapp-plus/ui';
import {
  NoticeBody,
  getNoticeAudience,
  getNoticeSummary,
  getNoticeReaders,
  getNoticeDeadline,
  type Notice,
  type Member,
} from '~/features/notice-management';
import type { NoticeDetailTab } from '../model/notice-detail-search';
import { NoticeReaders } from './notice-readers';
import * as styles from './notice-detail-page.css';

const categoryLabels = { session: '세션', operation: '운영', submission: '제출' };

const audienceLabels = {
  all: '전체 사용자',
  active: '활동회원',
  regular: '정회원',
  completed: '수료회원',
};

const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** 목록과 동일한 대상·집계 계산을 사용하고 전체 대상 행을 표에 전달한다. */
export function NoticeDetailContent({
  notice,
  members,
  tab,
}: {
  notice: Notice;
  members: Member[];
  tab: NoticeDetailTab;
}) {
  const audience = getNoticeAudience(notice, members);
  const summary = getNoticeSummary(audience, notice.readAtByMemberId);
  const readers = getNoticeReaders(audience, notice.readAtByMemberId);

  return (
    <>
      <NoticeDetailHeader notice={notice} />

      <ActionButton asChild variant="neutralWeak" className={styles.editLink}>
        <Link to="/notices/$noticeId/edit" params={{ noticeId: notice.id }} search={{}}>
          공지 수정
        </Link>
      </ActionButton>

      <NoticeBody document={notice.bodyDocument} />

      {notice.category === 'submission' && <NoticeSubmission submission={notice.submission} />}

      <p className={styles.description}>
        대상 {summary.targetCount}명 · 읽음 {summary.readCount}명 · 미열람 {summary.unreadCount}명 ·
        읽음 비율 {summary.readPercentage}%
      </p>

      {tab === 'readers' ? (
        <NoticeReaders readers={readers} />
      ) : (
        <p className={styles.placeholder}>질문 목록을 준비 중입니다.</p>
      )}

      <p className={styles.description}>개발용 예시 데이터입니다.</p>
    </>
  );
}

/** 대상 문구는 공지 종류와 대상 값에서 계산하며 중간 상태를 변경하지 않는다. */
function getAudienceLabel(notice: Notice) {
  if (notice.category === 'submission') {
    return notice.audience === 'all' ? '활동회원 전체' : `활동회원 · ${notice.audience.join(', ')}`;
  }

  return audienceLabels[notice.audience];
}

/** 종류·대상·제목·작성 시각을 하나의 정보 영역으로 표시한다. */
function NoticeDetailHeader({ notice }: { notice: Notice }) {
  return (
    <header>
      <p className={styles.description}>
        {categoryLabels[notice.category]} · {getAudienceLabel(notice)}
      </p>

      <h2 className={styles.title}>{notice.title}</h2>

      <time dateTime={notice.createdAt}>{dateFormat.format(new Date(notice.createdAt))}</time>
    </header>
  );
}

/** 제출 공지의 마감과 선택적 제출 링크를 표시한다. */
function NoticeSubmission({
  submission,
}: {
  submission: Extract<Notice, { category: 'submission' }>['submission'];
}) {
  return (
    <section aria-label="제출 안내">
      <p>
        마감:{' '}
        <time dateTime={submission.deadlineAt}>
          {dateFormat.format(new Date(submission.deadlineAt))}
        </time>{' '}
        · {getNoticeDeadline(submission.deadlineAt, new Date())}
      </p>

      {submission.method && (
        <a className={styles.link} href={submission.method.url}>
          {submission.method.name}
        </a>
      )}
    </section>
  );
}
