import type { TabName, TabsState } from './tab';

export type StackflowRouteTarget =
  | { activityName: 'Tabs'; activityParams: TabsState & { initialTab: TabName } }
  | { activityName: 'Alerts'; activityParams: { empty?: 'true' } }
  | { activityName: 'NoticeDetail'; activityParams: { noticeId: string } }
  | {
      activityName: 'Attendance';
      activityParams: { mode?: 'none' | 'active' | 'warning' };
    }
  | { activityName: 'AttendanceRules'; activityParams: Record<string, never> }
  | { activityName: 'AttendanceComplete'; activityParams: Record<string, never> }
  | { activityName: 'Settings'; activityParams: Record<string, never> }
  | { activityName: 'TeamAttendanceUpload'; activityParams: { error?: 'true' } }
  | { activityName: 'TeamAttendanceError'; activityParams: Record<string, never> }
  | { activityName: 'TeamAttendanceComplete'; activityParams: Record<string, never> }
  | { activityName: 'Login'; activityParams: { error?: 'true' } }
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
  const attendanceMode = parseAttendanceMode(url.searchParams.get('mode'));

  if (initialTab) {
    return {
      activityName: 'Tabs',
      activityParams: {
        initialTab,
        ...(url.searchParams.get('session') === 'team' ? { session: 'team' as const } : {}),
        ...(url.searchParams.get('attendance') === 'attended'
          ? { attendance: 'attended' as const }
          : {}),
      },
    };
  }
  if (pathname === '/alerts') {
    return {
      activityName: 'Alerts',
      activityParams: url.searchParams.get('empty') === 'true' ? { empty: 'true' } : {},
    };
  }
  if (pathname.startsWith('/notices/')) {
    return {
      activityName: 'NoticeDetail',
      activityParams: { noticeId: pathname.slice('/notices/'.length) },
    };
  }

  const routes: Record<string, StackflowRouteTarget> = {
    '/my/attendance': {
      activityName: 'Attendance',
      activityParams: attendanceMode ? { mode: attendanceMode } : {},
    },
    '/my/attendance/rules': { activityName: 'AttendanceRules', activityParams: {} },
    '/attendance/complete': { activityName: 'AttendanceComplete', activityParams: {} },
    '/settings': { activityName: 'Settings', activityParams: {} },
    '/team-attendance/upload': {
      activityName: 'TeamAttendanceUpload',
      activityParams: url.searchParams.get('error') === 'true' ? { error: 'true' } : {},
    },
    '/team-attendance/error': { activityName: 'TeamAttendanceError', activityParams: {} },
    '/team-attendance/complete': { activityName: 'TeamAttendanceComplete', activityParams: {} },
    '/login': {
      activityName: 'Login',
      activityParams: url.searchParams.get('error') === 'true' ? { error: 'true' } : {},
    },
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

function parseAttendanceMode(value: string | null): 'none' | 'active' | 'warning' | undefined {
  if (value === 'none' || value === 'active' || value === 'warning') {
    return value;
  }
  return undefined;
}
