export const navigationItems = {
  dashboard: { to: '/', label: '대시보드', section: '워크스페이스', exact: true },
  sessions: { to: '/sessions', label: '세션 관리', section: '활동 관리', exact: false },
  attendance: { to: '/attendance', label: '출석부', section: '활동 관리', exact: true },
  attendanceScores: {
    to: '/attendance/scores',
    label: '출석 총점',
    section: '활동 관리',
    exact: true,
  },
  members: { to: '/members', label: '회원 관리', section: '운영 관리', exact: false },
  notices: { to: '/notices', label: '공지 목록', section: '운영 관리', exact: false },
  notifications: {
    to: '/notifications',
    label: '알림 발송 내역',
    section: '운영 관리',
    exact: false,
  },
} as const;

type RouteNavigation = {
  menu: keyof typeof navigationItems;
  pageLabel: string;
};

declare module '@tanstack/react-router' {
  // TanStack Router의 선언 병합에는 interface가 필요합니다.
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface StaticDataRouteOption {
    navigation?: RouteNavigation;
  }
}
