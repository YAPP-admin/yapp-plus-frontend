'use client';

import { tabList, tabTrigger, tabTriggerActive } from './notice-tabs.css';

export type NoticeCategory = 'ALL' | 'SESSION' | 'ASSIGNMENT' | 'ETC';

export const NOTICE_CATEGORIES: { id: NoticeCategory; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'SESSION', label: '세션' },
  { id: 'ASSIGNMENT', label: '과제' },
  { id: 'ETC', label: '기타' },
];

export type NoticeTabsProps = {
  selected: NoticeCategory;
  onSelect: (category: NoticeCategory) => void;
};

export function NoticeTabs({ selected, onSelect }: NoticeTabsProps) {
  return (
    <ul className={tabList} role="tablist" aria-label="게시판 카테고리">
      {NOTICE_CATEGORIES.map(({ id, label }) => {
        const isSelected = selected === id;
        return (
          <li key={id} role="presentation">
            <button
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`${tabTrigger} ${isSelected ? tabTriggerActive : ''}`}
              onClick={() => onSelect(id)}
            >
              {label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
