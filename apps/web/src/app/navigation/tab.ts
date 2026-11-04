export const tabNames = ['home', 'schedule', 'notices', 'my'] as const;

export type TabName = (typeof tabNames)[number];

export type TabsState = {
  initialTab?: TabName;
  session?: 'team';
  attendance?: 'attended';
};

export function isTabName(value: unknown): value is TabName {
  return tabNames.some((tab) => tab === value);
}

export function tabPath(tab: TabName): string {
  return tab === 'home' ? '/' : `/${tab}`;
}

export function tabUrl({ initialTab = 'home', session, attendance }: TabsState): string {
  const pathname = tabPath(initialTab);
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
