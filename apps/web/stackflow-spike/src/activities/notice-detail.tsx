import { AppScreen, AppScreenContent } from '../../../seed-design/ui/app-screen';
import { AppBar, AppBarBackButton, AppBarMain } from '../../../seed-design/ui/app-bar';
import { useActivityParams } from '@stackflow/react/future';
import { useState } from 'react';
import { getNoticeById } from '../notice-data';
import { useAppScreenOptions } from '../platform';

export function NoticeDetailActivity() {
  const { noticeId } = useActivityParams<'NoticeDetail'>();
  const appScreenOptions = useAppScreenOptions();
  const detail = getNoticeById(noticeId);

  return (
    <AppScreen {...appScreenOptions}>
      <AppScreenContent>
        <AppBar>
          <AppBarBackButton />
          <AppBarMain title="공지 상세" />
        </AppBar>
        {detail ? <NoticeDetailContent detail={detail} /> : <NoticeNotFound noticeId={noticeId} />}
      </AppScreenContent>
    </AppScreen>
  );
}

function NoticeDetailContent({
  detail,
}: {
  detail: NonNullable<ReturnType<typeof getNoticeById>>;
}) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedCount, setConfirmedCount] = useState(detail.confirmedCount);

  const toggleConfirmed = () => {
    setIsConfirmed((current) => {
      setConfirmedCount((count) => Math.max(0, count + (current ? -1 : 1)));
      return !current;
    });
  };

  return (
    <main className="spike-notice-detail">
      <p className="spike-eyebrow">NoticeDetail Activity · {detail.id}</p>
      <h1>{detail.title}</h1>
      <div className="spike-notice-detail-meta">
        <span>{detail.categoryLabel}</span>
        {detail.dDay ? <span>{detail.dDay}</span> : null}
        <time>{detail.date}</time>
      </div>
      {detail.metaBox ? (
        <dl className="spike-notice-detail-box">
          <div>
            <dt>제출 기한</dt>
            <dd>{detail.metaBox.deadline}</dd>
          </div>
          <div>
            <dt>제출 대상</dt>
            <dd>{detail.metaBox.target}</dd>
          </div>
          <div>
            <dt>제출 방법</dt>
            <dd>
              <a href={detail.metaBox.submissionMethod.url} target="_blank" rel="noreferrer">
                {detail.metaBox.submissionMethod.label}
              </a>
            </dd>
          </div>
        </dl>
      ) : null}
      <article className="spike-notice-detail-body">
        {detail.content.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>
      <section className="spike-notice-confirm" aria-label="공지 확인">
        <div>
          <strong>공지를 다 읽으셨나요?</strong>
          <span>지금까지 {confirmedCount}명이 확인했어요!</span>
        </div>
        <button type="button" aria-pressed={isConfirmed} onClick={toggleConfirmed}>
          {isConfirmed ? '확인 취소' : '확인했어요'}
        </button>
      </section>
    </main>
  );
}

function NoticeNotFound({ noticeId }: { noticeId: string }) {
  return (
    <main className="spike-content">
      <p className="spike-eyebrow">NoticeDetail Activity</p>
      <h1>공지사항을 찾을 수 없습니다.</h1>
      <p>요청한 공지 ID({noticeId})가 존재하지 않습니다.</p>
    </main>
  );
}
