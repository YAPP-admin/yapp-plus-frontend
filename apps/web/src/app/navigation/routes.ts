import type { TabName } from './tab';

export type StackflowRouteTarget =
  | { activityName: 'Tabs'; activityParams: { initialTab: TabName } }
  | { activityName: 'Alerts'; activityParams: Record<string, never> }
  | { activityName: 'NoticeDetail'; activityParams: { noticeId: string } }
  | { activityName: 'Attendance'; activityParams: Record<string, never> }
  | { activityName: 'AttendanceRules'; activityParams: Record<string, never> }
  | { activityName: 'AttendanceComplete'; activityParams: Record<string, never> }
  | { activityName: 'Settings'; activityParams: Record<string, never> }
  | { activityName: 'TeamAttendanceUpload'; activityParams: Record<string, never> }
  | { activityName: 'TeamAttendanceError'; activityParams: Record<string, never> }
  | { activityName: 'TeamAttendanceComplete'; activityParams: Record<string, never> }
  | { activityName: 'Login'; activityParams: Record<string, never> }
  | { activityName: 'LoginError'; activityParams: Record<string, never> }
  | { activityName: 'Error'; activityParams: Record<string, never> }
  | { activityName: 'Signup'; activityParams: Record<string, never> }
  | { activityName: 'SignupStatus'; activityParams: Record<string, never> }
  | { activityName: 'SignupComplete'; activityParams: Record<string, never> }
  | { activityName: 'SignupUnregistered'; activityParams: Record<string, never> }
  | { activityName: 'DevRoutes'; activityParams: Record<string, never> }
  | { activityName: 'NotFound'; activityParams: Record<string, never> };

const tabByPath: Record<string, TabName> = {
  '/': 'home',
  '/schedule': 'schedule',
  '/notices': 'notices',
  '/my': 'my',
};

export function mapHrefToStackflowTarget(href: string): StackflowRouteTarget {
  const url = new URL(href, 'http://yapp.local');
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const initialTab = tabByPath[pathname];

  if (initialTab) {
    return { activityName: 'Tabs', activityParams: { initialTab } };
  }
  if (pathname === '/alerts') {
    return { activityName: 'Alerts', activityParams: {} };
  }
  if (pathname.startsWith('/notices/')) {
    return {
      activityName: 'NoticeDetail',
      activityParams: { noticeId: pathname.slice('/notices/'.length) },
    };
  }

  const routes: Record<string, StackflowRouteTarget> = {
    '/my/attendance': { activityName: 'Attendance', activityParams: {} },
    '/my/attendance/rules': { activityName: 'AttendanceRules', activityParams: {} },
    '/attendance/complete': { activityName: 'AttendanceComplete', activityParams: {} },
    '/settings': { activityName: 'Settings', activityParams: {} },
    '/team-attendance/upload': { activityName: 'TeamAttendanceUpload', activityParams: {} },
    '/team-attendance/error': { activityName: 'TeamAttendanceError', activityParams: {} },
    '/team-attendance/complete': { activityName: 'TeamAttendanceComplete', activityParams: {} },
    '/login': { activityName: 'Login', activityParams: {} },
    '/login/error': { activityName: 'LoginError', activityParams: {} },
    '/error': { activityName: 'Error', activityParams: {} },
    '/signup': { activityName: 'Signup', activityParams: {} },
    '/signup/status': { activityName: 'SignupStatus', activityParams: {} },
    '/signup/complete': { activityName: 'SignupComplete', activityParams: {} },
    '/signup/unregistered': { activityName: 'SignupUnregistered', activityParams: {} },
    '/dev/routes': { activityName: 'DevRoutes', activityParams: {} },
  };

  return routes[pathname] ?? { activityName: 'NotFound', activityParams: {} };
}

export function notifyNavigation() {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new Event('yapp:navigation'));
}
