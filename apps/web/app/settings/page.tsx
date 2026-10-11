import { DetailLayout } from '@/app/layouts/detail-layout';
import { SettingsPage } from '@/pages/settings';

export const metadata = { title: '설정 | YAPP+' };

export default function Page() {
  return (
    <DetailLayout fallback="/my">
      <SettingsPage />
    </DetailLayout>
  );
}
