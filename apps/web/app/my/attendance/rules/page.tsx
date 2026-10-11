import { DetailLayout } from '@/app/layouts/detail-layout';
import { AttendanceRulesPage } from '@/pages/attendance-rules';

export const metadata = { title: '출석 규칙 | YAPP+' };

export default function Page() {
  return (
    <DetailLayout fallback="/my/attendance">
      <AttendanceRulesPage />
    </DetailLayout>
  );
}
