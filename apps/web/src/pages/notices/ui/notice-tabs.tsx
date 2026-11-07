'use client';

import { tabList, tabTrigger, tabTriggerActive } from './notice-tabs.css';
import { Tabs } from '@seed-design/react';
import type { ReactNode } from 'react';

export type NoticeCategory = 'ALL' | 'SESSION' | 'ASSIGNMENT' | 'ETC';

export const NOTICE_CATEGORIES: { id: NoticeCategory; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'SESSION', label: '세션' },
  { id: 'ASSIGNMENT', label: '과제' },
  { id: 'ETC', label: '기타' },
];

export type NoticeTabsProps = {
  children: ReactNode;
  selected: NoticeCategory;
  onSelect: (category: NoticeCategory) => void;
};

export function NoticeTabs({ selected, onSelect, children }: NoticeTabsProps) {
  return (
    <Tabs.Root
      value={selected}
      onValueChange={(value) => {
        const category = NOTICE_CATEGORIES.find(({ id }) => id === value);
        if (category) {
          onSelect(category.id);
        }
      }}
      triggerLayout="hug"
    >
      <Tabs.List className={tabList} aria-label="게시판 카테고리">
        {NOTICE_CATEGORIES.map(({ id, label }) => (
          <Tabs.Trigger
            key={id}
            value={id}
            className={`${tabTrigger} ${selected === id ? tabTriggerActive : ''}`}
          >
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Content value={selected}>{children}</Tabs.Content>
    </Tabs.Root>
  );
}
