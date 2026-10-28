import { PageShell } from '@/app/layouts/page-shell';
import { NoticeDetailPage } from '@/pages/notice-detail';

export const metadata = { title: '게시판 상세 | YAPP+' };

export default async function Page({ params }: { params: Promise<{ noticeId: string }> }) {
  const { noticeId } = await params;
  return (
    <PageShell header={null}>
      <NoticeDetailPage noticeId={noticeId} />
    </PageShell>
  );
}
