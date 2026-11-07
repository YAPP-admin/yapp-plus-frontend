'use client';

import { IconClockFill, IconLocationpinFill } from '@karrotmarket/react-monochrome-icon';
import { Badge } from '@yapp-plus/ui';
import { HStack, List, VStack } from '@seed-design/react';
import { chip, dateText, item, itemPast, metaIcon, metaText, titleText } from './schedule-item.css';

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
            <VStack gap="x1">
              <HStack gap="x1" align="center">
                <span className={metaIcon} aria-hidden="true">
                  <IconLocationpinFill width={12} height={12} />
                </span>
                <span className={metaText}>{location}</span>
              </HStack>
              <HStack gap="x1" align="center">
                <span className={metaIcon} aria-hidden="true">
                  <IconClockFill width={12} height={12} />
                </span>
                <span className={metaText}>{time}</span>
              </HStack>
            </VStack>
          </List.Detail>
        </List.Content>
        {chipText ? (
          <List.Suffix>
            <Badge variant="weak" tone="warning" className={chip}>
              {chipText}
            </Badge>
          </List.Suffix>
        ) : null}
      </article>
    </List.Item>
  );
}
