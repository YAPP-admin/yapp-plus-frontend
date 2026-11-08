'use client';

import { BackButton } from '@/app/navigation/back-button';
import { NoticeErrorContent } from '@/features/member-notice';
import { container, header } from './notice-error-page.css';

export type NoticeErrorPageProps = {
  titleText?: string;
  descriptionText?: string;
};

export function NoticeErrorPage({
  titleText = '앗, 오류가 발생했어요!',
  descriptionText = '잠시 후 다시 시도해 주세요.',
}: NoticeErrorPageProps) {
  return (
    <main className={container}>
      <header className={header}>
        <BackButton
          fallbackActivityName="Tabs"
          fallbackActivityParams={{ initialTab: 'notices' }}
          iconOnly
        />
      </header>

      <NoticeErrorContent titleText={titleText} descriptionText={descriptionText} />
    </main>
  );
}
