'use client';

import { useMemo, useState } from 'react';
import { container, content, list, srOnly } from './notices-page.css';
import { NoticeEmpty } from './notice-empty';
import { NoticeItem, type NoticeItemProps } from './notice-item';
import { NoticeTabs, type NoticeCategory } from './notice-tabs';

export type Notice = NoticeItemProps;

export const DEFAULT_NOTICES: Notice[] = [
  {
    id: '1',
    category: 'ASSIGNMENT',
    categoryLabel: '과제',
    title: '팀빌딩 소개서 작성',
    date: '2026.09.30 (수)',
    dDay: 'D-2',
  },
  {
    id: '2',
    category: 'ASSIGNMENT',
    categoryLabel: '과제',
    title: '1차 UT 준비 과제',
    date: '2026.09.28 (월)',
    dDay: 'D-14',
  },
  {
    id: '3',
    category: 'SESSION',
    categoryLabel: '세션',
    title: '3주차 팀빌딩 세션 공지',
    date: '2026.09.24 (수)',
  },
  {
    id: '4',
    category: 'ETC',
    categoryLabel: '기타',
    title: '뒷풀이 참석 여부 수요 조사',
    date: '2026.09.20 (토)',
  },
];

export type NoticesPageProps = {
  notices?: Notice[];
  initialCategory?: NoticeCategory;
};

export function NoticesPage({
  notices = DEFAULT_NOTICES,
  initialCategory = 'ALL',
}: NoticesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory>(initialCategory);

  const filteredNotices = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return notices;
    }
    return notices.filter((notice) => notice.category === selectedCategory);
  }, [notices, selectedCategory]);

  return (
    <main className={container}>
      <h1 className={srOnly}>게시판</h1>

      <div className={content}>
        <NoticeTabs selected={selectedCategory} onSelect={setSelectedCategory} />

        {filteredNotices.length > 0 ? (
          <ul className={list} aria-label="공지사항 목록">
            {filteredNotices.map((notice) => (
              <li key={notice.id}>
                <NoticeItem {...notice} />
              </li>
            ))}
          </ul>
        ) : (
          <NoticeEmpty />
        )}
      </div>
    </main>
  );
}
