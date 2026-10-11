import { DetailLayout } from '@/app/layouts/detail-layout';
import { NoticeDetailPage } from '@/pages/notice-detail';

export const metadata = { title: '공지 상세 | YAPP+' };

export default function Page() {
  return (
    <DetailLayout fallback="/notices">
      <NoticeDetailPage />
    </DetailLayout>
  );
}
