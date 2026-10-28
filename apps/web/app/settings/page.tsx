import { PageShell } from '@/app/layouts/page-shell';
import { SettingsPage } from '@/pages/settings';

export const metadata = { title: '설정 | YAPP+' };

export default function Page() {
  return (
    <PageShell header={null} plain>
      <SettingsPage />
    </PageShell>
  );
}
