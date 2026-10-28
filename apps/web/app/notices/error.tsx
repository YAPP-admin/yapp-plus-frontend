'use client';

import { PageShell } from '@/app/layouts/page-shell';
import { NoticeErrorPage } from '@/pages/notices';

export default function NoticesError() {
  return (
    <PageShell header={null}>
      <NoticeErrorPage />
    </PageShell>
  );
}
