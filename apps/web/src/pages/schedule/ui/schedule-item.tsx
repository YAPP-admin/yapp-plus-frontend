'use client';

import { IconClockFill, IconLocationpinFill } from '@karrotmarket/react-monochrome-icon';
import { List } from '@seed-design/react';
import {
  chip,
  dateText,
  item,
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
    <List.Item asChild alignItems="flex-start">
      <article
        className={`${item} ${isPast ? itemPast : ''}`}
        aria-label={`${date} ${title}${isPast ? ' (종료)' : ''}`}
      >
        <List.Prefix pr="x4">
          <span className={dateText}>{date}</span>
        </List.Prefix>
        <List.Content gap="x2">
          <List.Title asChild>
            <h2 className={titleText}>{title}</h2>
          </List.Title>
          <List.Detail asChild>
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
          </List.Detail>
        </List.Content>
        {chipText ? (
          <List.Suffix>
            <span className={chip}>{chipText}</span>
          </List.Suffix>
        ) : null}
      </article>
    </List.Item>
  );
}
