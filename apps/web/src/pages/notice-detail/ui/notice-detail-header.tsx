'use client';

import { BackButton } from '@/app/navigation/back-button';
import { header, spacer, title } from './notice-detail-header.css';

export type NoticeDetailHeaderProps = {
  categoryLabel: string;
};

export function NoticeDetailHeader({ categoryLabel }: NoticeDetailHeaderProps) {
  return (
    <div className={header}>
      <BackButton
        fallbackActivityName="Tabs"
        fallbackActivityParams={{ initialTab: 'notices' }}
        iconOnly
      />
      <span className={title}>{categoryLabel}</span>
      <div className={spacer} aria-hidden="true" />
    </div>
  );
}
