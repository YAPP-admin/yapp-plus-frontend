import { Suspense } from 'react';

import { PageShell } from '@/app/layouts/page-shell';
import { AttendancePage } from '@/pages/attendance';

export const metadata = { title: '출석 내역 | YAPP+' };

export default function Page() {
  return (
    <PageShell header={null} plain>
      <Suspense fallback={null}>
        <AttendancePage />
      </Suspense>
    </PageShell>
  );
}
