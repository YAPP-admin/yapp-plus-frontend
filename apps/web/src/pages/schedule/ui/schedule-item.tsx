'use client';

import { IconClockFill, IconLocationpinFill } from '@karrotmarket/react-monochrome-icon';
import {
  chip,
  dateText,
  detailGroup,
  item,
  itemLeft,
  itemPast,
  metaContainer,
  metaIcon,
  metaRow,
  metaText,
  titleText,
} from './schedule-item.css';

export type ScheduleItemProps = {
  date: string;
  title: string;
  location: string;
  time: string;
  chipText?: string;
  isPast?: boolean;
};

export function ScheduleItem({
  date,
  title,
  location,
  time,
  chipText,
  isPast = false,
}: ScheduleItemProps) {
  return (
    <article className={`${item} ${isPast ? itemPast : ''}`} aria-label={`${date} ${title}`}>
      <div className={itemLeft}>
        <span className={dateText}>{date}</span>
        <div className={detailGroup}>
          <h2 className={titleText}>{title}</h2>
          <div className={metaContainer}>
            <div className={metaRow}>
              <span className={metaIcon} aria-hidden="true">
                <IconLocationpinFill width={12} height={12} />
              </span>
              <span className={metaText}>{location}</span>
            </div>
            <div className={metaRow}>
              <span className={metaIcon} aria-hidden="true">
                <IconClockFill width={12} height={12} />
              </span>
              <span className={metaText}>{time}</span>
            </div>
          </div>
        </div>
      </div>
      {chipText ? <span className={chip}>{chipText}</span> : null}
    </article>
  );
}
