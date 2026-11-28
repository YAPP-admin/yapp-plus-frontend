/** 공지 상세의 레이아웃·조회 대기·오류 복구를 Activity 경계에서 구성합니다. */
import {
  content,
  errorHandler,
  layout,
  loading,
  structuredActivityComponent,
  type CustomErrorBoundary,
} from '@stackflow/react';
import { PageShell } from '@/app/layouts/page-shell';
import {
  loadNoticeDetailPage,
  NoticeDetailError,
  NoticeDetailLoading,
} from '@/pages/notice-detail';
import { LocalErrorBoundary } from '@/shared/ui/local-error-boundary';
import { ActivityScreen } from './activity-screen';

const NoticeDetailBoundary: CustomErrorBoundary = ({ children, renderFallback }) => (
  <LocalErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => renderFallback(error, resetErrorBoundary)}
  >
    {children}
  </LocalErrorBoundary>
);

/** 본문 번들 사전 로딩은 Stackflow에 맡기고 Query 재시도·인증 오류 위임은 기존 정책을 따릅니다. */
export const NoticeDetailActivity = structuredActivityComponent<'NoticeDetail'>({
  content: () =>
    loadNoticeDetailPage().then(({ NoticeDetailPage }) => ({
      default: content<'NoticeDetail'>(({ params }) => (
        <NoticeDetailPage noticeId={params.noticeId} />
      )),
    })),
  layout: layout<'NoticeDetail'>(({ children }) => (
    <ActivityScreen title="게시판 상세">
      <PageShell header={null}>
        {/* 상세 헤더와 본문이 셸의 단일 본문 행 안에서 함께 흐르도록 묶습니다. */}
        <div>{children}</div>
      </PageShell>
    </ActivityScreen>
  )),
  loading: loading<'NoticeDetail'>(NoticeDetailLoading),
  errorHandler: errorHandler<'NoticeDetail'>(({ reset }) => <NoticeDetailError onRetry={reset} />, {
    boundary: NoticeDetailBoundary,
  }),
});
