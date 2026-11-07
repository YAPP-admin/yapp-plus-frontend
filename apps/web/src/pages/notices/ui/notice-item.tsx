'use client';

import { Badge } from '@yapp-plus/ui';
import { HStack } from '@seed-design/react';
import { ActivityLink } from '@/app/navigation/activity-link';
import {
  assignmentChip,
  dateText,
  dDayChip,
  etcChip,
  item,
  sessionChip,
  titleText,
} from './notice-item.css';

export type NoticeItemProps = {
  id: string;
  category: 'SESSION' | 'ASSIGNMENT' | 'ETC';
  categoryLabel: string;
  title: string;
  date: string;
  dDay?: string;
  isUrgent?: boolean;
};

function getCategoryChipClass(category: NoticeItemProps['category']) {
  switch (category) {
    case 'ASSIGNMENT':
      return assignmentChip;
    case 'SESSION':
      return sessionChip;
    case 'ETC':
    default:
      return etcChip;
  }
}

export function NoticeItem({ id, category, categoryLabel, title, date, dDay }: NoticeItemProps) {
  const categoryChipClass = getCategoryChipClass(category);

  return (
    <ActivityLink
      activityName="NoticeDetail"
      activityParams={{ noticeId: id }}
      className={item}
      aria-label={`${categoryLabel} 공지: ${title}`}
    >
      <HStack align="center" gap="x1_5" mb="x2">
        <Badge variant="weak" className={categoryChipClass}>
          {categoryLabel}
        </Badge>
        {dDay ? (
          <Badge variant="weak" tone="warning" className={dDayChip}>
            {dDay}
          </Badge>
        ) : null}
      </HStack>
      <h2 className={titleText}>{title}</h2>
      <time className={dateText}>{date}</time>
    </ActivityLink>
  );
}
