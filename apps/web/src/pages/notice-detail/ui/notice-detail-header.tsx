'use client';

import { BackButton } from '@/app/navigation/back-button';
import { header, spacer, title } from './notice-detail-header.css';

export type NoticeDetailHeaderProps = {
  categoryLabel: string;
  fallback?: string;
};

export function NoticeDetailHeader({
  categoryLabel,
  fallback = '/notices',
}: NoticeDetailHeaderProps) {
  return (
    <div className={header}>
      <BackButton fallback={fallback} iconOnly />
      <span className={title}>{categoryLabel}</span>
      <div className={spacer} aria-hidden="true" />
    </div>
  );
}
