export const tabNames = ['home', 'schedule', 'notices', 'my'] as const;

export type TabName = (typeof tabNames)[number];

export function isTabName(value: unknown): value is TabName {
  return tabNames.some((tab) => tab === value);
}

export function tabPath(tab: TabName): string {
  return tab === 'home' ? '/' : `/${tab}`;
}
