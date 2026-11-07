export const tabNames = ['home', 'schedule', 'notices', 'my'] as const;

export type TabName = (typeof tabNames)[number];
export type NoticeCategory = 'ALL' | 'SESSION' | 'ASSIGNMENT' | 'OPERATION';

export type TabsState = {
  initialTab?: TabName;
  session?: 'team';
  attendance?: 'attended';
  noticeCategory?: NoticeCategory;
};

export function isTabName(value: unknown): value is TabName {
  return tabNames.some((tab) => tab === value);
}

export function isNoticeCategory(value: unknown): value is NoticeCategory {
  return value === 'ALL' || value === 'SESSION' || value === 'ASSIGNMENT' || value === 'OPERATION';
}

export function tabPath(tab: TabName): string {
  return tab === 'home' ? '/' : `/${tab}`;
}

export function tabUrl({
  initialTab = 'home',
  session,
  attendance,
  noticeCategory,
}: TabsState): string {
  const pathname = tabPath(initialTab);
  if (initialTab === 'notices') {
    return noticeCategory && noticeCategory !== 'ALL'
      ? `${pathname}?category=${noticeCategory}`
      : pathname;
  }
  if (initialTab !== 'home') {
    return pathname;
  }

  const searchParams = new URLSearchParams();
  if (session) {
    searchParams.set('session', session);
  }
  if (attendance) {
    searchParams.set('attendance', attendance);
  }

  const search = searchParams.toString();
  return search ? `${pathname}?${search}` : pathname;
}
