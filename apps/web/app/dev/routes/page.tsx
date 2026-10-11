import { notFound } from 'next/navigation';
import { PageShell } from '../../../src/app/layouts/page-shell';
import { DevRoutesPage } from '../../../src/pages/dev-routes';

export const metadata = { title: '개발용 화면 목록 | YAPP+' };

export default function Page() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return (
    <PageShell>
      <DevRoutesPage />
    </PageShell>
  );
}
