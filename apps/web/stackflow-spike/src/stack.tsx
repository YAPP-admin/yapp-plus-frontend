import { defineConfig, type ActivityBaseParams } from '@stackflow/config';
import type { StackflowPlugin } from '@stackflow/core';
import { historySyncPlugin } from '@stackflow/plugin-history-sync';
import { basicRendererPlugin } from '@stackflow/plugin-renderer-basic';
import { lazy, stackflow as createStackflow } from '@stackflow/react/future';
import { Primitive, seedPlugin } from '@seed-design/stackflow';
import { type ReactNode } from 'react';
import type { StackflowInitialContext } from './platform';
import { isTabName, tabPath, type TabName } from './tab';

type TabsParams = {
  initialTab?: TabName;
};

declare module '@stackflow/config' {
  // Stackflow의 module augmentation은 interface 병합이 필요합니다.
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface Register {
    Tabs: TabsParams;
    Alerts: EmptyActivityParams;
    NoticeDetail: {
      noticeId: string;
    };
    NotFound: EmptyActivityParams;
    Attendance: EmptyActivityParams;
    AttendanceRules: EmptyActivityParams;
    AttendanceComplete: EmptyActivityParams;
    Settings: EmptyActivityParams;
    TeamAttendanceUpload: EmptyActivityParams;
    TeamAttendanceError: EmptyActivityParams;
    TeamAttendanceComplete: EmptyActivityParams;
    Login: EmptyActivityParams;
    LoginError: EmptyActivityParams;
    Error: EmptyActivityParams;
    Signup: EmptyActivityParams;
    SignupStatus: EmptyActivityParams;
    SignupComplete: EmptyActivityParams;
    SignupUnregistered: EmptyActivityParams;
    DevRoutes: EmptyActivityParams;
  }
}

type EmptyActivityParams = ActivityBaseParams;

const components = {
  Tabs: lazy<TabsParams>(() =>
    import('./activities/legacy').then(({ LegacyTabsActivity }) => ({
      default: LegacyTabsActivity,
    })),
  ),
  Alerts: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacyAlertsActivity }) => ({
      default: LegacyAlertsActivity,
    })),
  ),
  NoticeDetail: lazy<{ noticeId: string }>(() =>
    import('./activities/legacy').then(({ LegacyNoticeDetailActivity }) => ({
      default: LegacyNoticeDetailActivity,
    })),
  ),
  NotFound: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacyNotFoundActivity }) => ({
      default: LegacyNotFoundActivity,
    })),
  ),
  Attendance: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacyAttendanceActivity }) => ({
      default: LegacyAttendanceActivity,
    })),
  ),
  AttendanceRules: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacyAttendanceRulesActivity }) => ({
      default: LegacyAttendanceRulesActivity,
    })),
  ),
  AttendanceComplete: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacyAttendanceCompleteActivity }) => ({
      default: LegacyAttendanceCompleteActivity,
    })),
  ),
  Settings: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacySettingsActivity }) => ({
      default: LegacySettingsActivity,
    })),
  ),
  TeamAttendanceUpload: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacyTeamAttendanceUploadActivity }) => ({
      default: LegacyTeamAttendanceUploadActivity,
    })),
  ),
  TeamAttendanceError: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacyTeamAttendanceErrorActivity }) => ({
      default: LegacyTeamAttendanceErrorActivity,
    })),
  ),
  TeamAttendanceComplete: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacyTeamAttendanceCompleteActivity }) => ({
      default: LegacyTeamAttendanceCompleteActivity,
    })),
  ),
  Login: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacyLoginActivity }) => ({
      default: LegacyLoginActivity,
    })),
  ),
  LoginError: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacyLoginErrorActivity }) => ({
      default: LegacyLoginErrorActivity,
    })),
  ),
  Error: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacyLoginErrorActivity }) => ({
      default: LegacyLoginErrorActivity,
    })),
  ),
  Signup: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacySignupActivity }) => ({
      default: LegacySignupActivity,
    })),
  ),
  SignupStatus: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacySignupStatusActivity }) => ({
      default: LegacySignupStatusActivity,
    })),
  ),
  SignupComplete: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacySignupCompleteActivity }) => ({
      default: LegacySignupCompleteActivity,
    })),
  ),
  SignupUnregistered: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacySignupUnregisteredActivity }) => ({
      default: LegacySignupUnregisteredActivity,
    })),
  ),
  DevRoutes: lazy<EmptyActivityParams>(() =>
    import('./activities/legacy').then(({ LegacyDevRoutesActivity }) => ({
      default: LegacyDevRoutesActivity,
    })),
  ),
};

const tabRoutes = [
  { path: '/', decode: () => ({ initialTab: 'home' as const }) },
  { path: '/schedule', decode: () => ({ initialTab: 'schedule' as const }) },
  { path: '/notices', decode: () => ({ initialTab: 'notices' as const }) },
  { path: '/my', decode: () => ({ initialTab: 'my' as const }) },
];

export const stackflowConfig = defineConfig({
  activities: [
    { name: 'Tabs', route: tabRoutes },
    {
      name: 'Alerts',
      route: {
        path: '/alerts',
        defaultHistory: () => [
          {
            activityName: 'Tabs',
            activityParams: { initialTab: 'home' },
          },
        ],
      },
    },
    {
      name: 'NoticeDetail',
      route: {
        path: '/notices/:noticeId',
        defaultHistory: () => [{ activityName: 'Tabs', activityParams: { initialTab: 'notices' } }],
      },
    },
    {
      name: 'Attendance',
      route: {
        path: '/my/attendance',
        defaultHistory: () => [{ activityName: 'Tabs', activityParams: { initialTab: 'my' } }],
      },
    },
    {
      name: 'AttendanceRules',
      route: {
        path: '/my/attendance/rules',
        defaultHistory: () => [
          { activityName: 'Tabs', activityParams: { initialTab: 'my' } },
          { activityName: 'Attendance', activityParams: {} },
        ],
      },
    },
    {
      name: 'AttendanceComplete',
      route: {
        path: '/attendance/complete',
        defaultHistory: () => [{ activityName: 'Tabs', activityParams: { initialTab: 'home' } }],
      },
    },
    {
      name: 'Settings',
      route: {
        path: '/settings',
        defaultHistory: () => [{ activityName: 'Tabs', activityParams: { initialTab: 'my' } }],
      },
    },
    {
      name: 'TeamAttendanceUpload',
      route: {
        path: '/team-attendance/upload',
        defaultHistory: () => [{ activityName: 'Tabs', activityParams: { initialTab: 'home' } }],
      },
    },
    {
      name: 'TeamAttendanceError',
      route: {
        path: '/team-attendance/error',
        defaultHistory: () => [{ activityName: 'Tabs', activityParams: { initialTab: 'home' } }],
      },
    },
    {
      name: 'TeamAttendanceComplete',
      route: {
        path: '/team-attendance/complete',
        defaultHistory: () => [{ activityName: 'Tabs', activityParams: { initialTab: 'home' } }],
      },
    },
    { name: 'Login', route: '/login' },
    {
      name: 'LoginError',
      route: {
        path: '/login/error',
        defaultHistory: () => [{ activityName: 'Login', activityParams: {} }],
      },
    },
    {
      name: 'Error',
      route: {
        path: '/error',
        defaultHistory: () => [{ activityName: 'Login', activityParams: {} }],
      },
    },
    {
      name: 'Signup',
      route: {
        path: '/signup',
        defaultHistory: () => [{ activityName: 'Login', activityParams: {} }],
      },
    },
    {
      name: 'SignupStatus',
      route: {
        path: '/signup/status',
        defaultHistory: () => [{ activityName: 'Login', activityParams: {} }],
      },
    },
    { name: 'SignupComplete', route: '/signup/complete' },
    { name: 'SignupUnregistered', route: '/signup/unregistered' },
    { name: 'DevRoutes', route: '/dev/routes' },
    { name: 'NotFound', route: '*' },
  ],
  transitionDuration: 350,
});

function reducedMotionPlugin() {
  return () => ({
    key: 'reduced-motion',
    wrapStack({
      stack,
      initialContext,
    }: {
      stack: { render: () => ReactNode };
      initialContext: unknown;
    }) {
      const context = isStackflowInitialContext(initialContext)
        ? initialContext
        : { platform: 'web' as const, reducedMotion: false };
      const reducedMotion = context.reducedMotion;

      return (
        <div
          data-platform={context.platform}
          data-reduced-motion={reducedMotion ? 'true' : 'false'}
        >
          {reducedMotion ? (
            stack.render()
          ) : (
            <Primitive.GlobalInteraction>{stack.render()}</Primitive.GlobalInteraction>
          )}
        </div>
      );
    },
  });
}

function tabHistoryPlugin(): StackflowPlugin {
  return () => ({
    key: 'tab-history',
    onStepReplaced({ effect }) {
      if (effect.activity.name !== 'Tabs' || !effect.activity.isActive) {
        return;
      }

      queueMicrotask(() => replaceTabHistory(effect.step.params));
    },
  });
}

function replaceTabHistory(params: unknown) {
  if (typeof window === 'undefined' || !params || typeof params !== 'object') {
    return;
  }

  const initialTab = 'initialTab' in params ? params.initialTab : undefined;
  if (!isTabName(initialTab)) {
    return;
  }

  window.history.replaceState(window.history.state, '', tabPath(initialTab));
}

function canonicalHistoryPlugin(): StackflowPlugin {
  return () => ({
    key: 'canonical-history',
    onPushed: scheduleCanonicalPath,
    onReplaced: scheduleCanonicalPath,
    onStepPushed: scheduleCanonicalPath,
    onStepReplaced: scheduleCanonicalPath,
  });
}

function scheduleCanonicalPath() {
  queueMicrotask(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    if (url.pathname === '/' || !url.pathname.endsWith('/')) {
      return;
    }

    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname.replace(/\/+$/, '')}${url.search}${url.hash}`,
    );
  });
}

function isStackflowInitialContext(context: unknown): context is StackflowInitialContext {
  if (!context || typeof context !== 'object') {
    return false;
  }

  const candidate = context as Partial<StackflowInitialContext>;
  return (
    (candidate.platform === 'ios' ||
      candidate.platform === 'android' ||
      candidate.platform === 'web') &&
    typeof candidate.reducedMotion === 'boolean'
  );
}

export function createStackflowApp(options: { reducedMotion?: boolean } = {}) {
  const config = options.reducedMotion
    ? { ...stackflowConfig, transitionDuration: 0 }
    : stackflowConfig;

  return createStackflow({
    components,
    config,
    plugins: [
      basicRendererPlugin(),
      historySyncPlugin({
        config,
        fallbackActivity: () => 'NotFound',
      }),
      seedPlugin(({ initialContext }) => ({
        theme:
          isStackflowInitialContext(initialContext) && initialContext.platform === 'android'
            ? 'android'
            : 'cupertino',
      })),
      reducedMotionPlugin(),
      tabHistoryPlugin(),
      canonicalHistoryPlugin(),
    ],
  });
}
