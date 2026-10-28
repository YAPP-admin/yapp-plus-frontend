'use client';

import Link from 'next/link';
import {
  assignmentChip,
  chipRow,
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
    <Link href={`/notices/${id}`} className={item} aria-label={`${categoryLabel} 공지: ${title}`}>
      <div className={chipRow}>
        <span className={categoryChipClass}>{categoryLabel}</span>
        {dDay ? <span className={dDayChip}>{dDay}</span> : null}
      </div>
      <h2 className={titleText}>{title}</h2>
      <time className={dateText}>{date}</time>
    </Link>
  );
}
