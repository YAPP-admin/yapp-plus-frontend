import { DetailLayout } from '@/app/layouts/detail-layout';
import { AttendancePage } from '@/pages/attendance';

export const metadata = { title: '출석 내역 | YAPP+' };

export default function Page() {
  return (
    <DetailLayout fallback="/my">
      <AttendancePage />
    </DetailLayout>
  );
}
