import { defineConfig, type ActivityBaseParams } from '@stackflow/config';
import type { StackflowPlugin } from '@stackflow/core';
import { LinkUrlResolverProvider } from '@stackflow/link';
import { historySyncPlugin, type Route } from '@stackflow/plugin-history-sync';
import { basicRendererPlugin } from '@stackflow/plugin-renderer-basic';
import { lazy, stackflow as createStackflow } from '@stackflow/react';
import { Primitive, seedPlugin } from '@seed-design/stackflow';
import { type ComponentProps, type ReactNode } from 'react';
import type { TabsState } from '@/app/navigation/tab';
import type { QueryClient } from '@tanstack/react-query';
import { accountBoundaryPlugin, nativeEntryGuard } from './account-boundary';
import type { StackflowInitialContext } from './platform';

type TabsParams = ActivityBaseParams & TabsState;
type BooleanQueryParams = ActivityBaseParams & { error?: 'true' };
type AlertsParams = ActivityBaseParams;
type SignupParams = ActivityBaseParams & { step?: 'phone' };

declare module '@stackflow/config' {
  // Stackflow의 module augmentation은 interface 병합이 필요합니다.
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface Register {
    Tabs: TabsParams;
    Alerts: AlertsParams;
    NoticeDetail: {
      noticeId: string;
    };
    NotFound: EmptyActivityParams;
    Attendance: EmptyActivityParams;
    AttendanceRules: EmptyActivityParams;
    AttendanceCode: EmptyActivityParams;
    AttendanceReport: EmptyActivityParams;
    TeamAttendanceGuide: EmptyActivityParams;
    AttendanceComplete: EmptyActivityParams;
    Settings: EmptyActivityParams;
    TeamAttendanceUpload: BooleanQueryParams;
    TeamAttendanceError: EmptyActivityParams;
    TeamAttendanceComplete: EmptyActivityParams;
    Login: BooleanQueryParams;
    LoginError: EmptyActivityParams;
    Error: EmptyActivityParams;
    Signup: SignupParams;
    SignupStatus: EmptyActivityParams;
    SignupComplete: EmptyActivityParams;
    SignupUnregistered: EmptyActivityParams;
    DevRoutes: EmptyActivityParams;
  }
}

type EmptyActivityParams = ActivityBaseParams;

export const activityComponents = {
  Tabs: lazy<TabsParams>(() =>
    import('./activities/activities').then(({ TabsActivity }) => ({
      default: TabsActivity,
    })),
  ),
  Alerts: lazy<AlertsParams>(() =>
    import('./activities/activities').then(({ AlertsActivity }) => ({
      default: AlertsActivity,
    })),
  ),
  NoticeDetail: lazy<{ noticeId: string }>(() =>
    import('./activities/activities').then(({ NoticeDetailActivity }) => ({
      default: NoticeDetailActivity,
    })),
  ),
  NotFound: lazy<EmptyActivityParams>(() =>
    import('./activities/activities').then(({ NotFoundActivity }) => ({
      default: NotFoundActivity,
    })),
  ),
  Attendance: lazy<EmptyActivityParams>(() =>
    import('./activities/activities').then(({ AttendanceActivity }) => ({
      default: AttendanceActivity,
    })),
  ),
  AttendanceRules: lazy<EmptyActivityParams>(() =>
    import('./activities/activities').then(({ AttendanceRulesActivity }) => ({
      default: AttendanceRulesActivity,
    })),
  ),
  AttendanceCode: lazy<EmptyActivityParams>(() =>
    import('./activities/home-sheets').then((module) => ({
      default: module.AttendanceCodeActivity,
    })),
  ),
  AttendanceReport: lazy<EmptyActivityParams>(() =>
    import('./activities/home-sheets').then((module) => ({
      default: module.AttendanceReportActivity,
    })),
  ),
  TeamAttendanceGuide: lazy<EmptyActivityParams>(() =>
    import('./activities/home-sheets').then((module) => ({
      default: module.TeamAttendanceGuideActivity,
    })),
  ),
  AttendanceComplete: lazy<EmptyActivityParams>(() =>
    import('./activities/activities').then(({ AttendanceCompleteActivity }) => ({
      default: AttendanceCompleteActivity,
    })),
  ),
  Settings: lazy<EmptyActivityParams>(() =>
    import('./activities/activities').then(({ SettingsActivity }) => ({
      default: SettingsActivity,
    })),
  ),
  TeamAttendanceUpload: lazy<BooleanQueryParams>(() =>
    import('./activities/activities').then(({ TeamAttendanceUploadActivity }) => ({
      default: TeamAttendanceUploadActivity,
    })),
  ),
  TeamAttendanceError: lazy<EmptyActivityParams>(() =>
    import('./activities/activities').then(({ TeamAttendanceErrorActivity }) => ({
      default: TeamAttendanceErrorActivity,
    })),
  ),
  TeamAttendanceComplete: lazy<EmptyActivityParams>(() =>
    import('./activities/activities').then(({ TeamAttendanceCompleteActivity }) => ({
      default: TeamAttendanceCompleteActivity,
    })),
  ),
  Login: lazy<BooleanQueryParams>(() =>
    import('./activities/activities').then(({ LoginActivity }) => ({
      default: LoginActivity,
    })),
  ),
  LoginError: lazy<EmptyActivityParams>(() =>
    import('./activities/activities').then(({ LoginErrorActivity }) => ({
      default: LoginErrorActivity,
    })),
  ),
  Error: lazy<EmptyActivityParams>(() =>
    import('./activities/activities').then(({ LoginErrorActivity }) => ({
      default: LoginErrorActivity,
    })),
  ),
  Signup: lazy<SignupParams>(() =>
    import('./activities/activities').then(({ SignupActivity }) => ({
      default: SignupActivity,
    })),
  ),
  SignupStatus: lazy<EmptyActivityParams>(() =>
    import('./activities/activities').then(({ SignupStatusActivity }) => ({
      default: SignupStatusActivity,
    })),
  ),
  SignupComplete: lazy<EmptyActivityParams>(() =>
    import('./activities/activities').then(({ SignupCompleteActivity }) => ({
      default: SignupCompleteActivity,
    })),
  ),
  SignupUnregistered: lazy<EmptyActivityParams>(() =>
    import('./activities/activities').then(({ SignupUnregisteredActivity }) => ({
      default: SignupUnregisteredActivity,
    })),
  ),
  DevRoutes: lazy<EmptyActivityParams>(() =>
    import('./activities/activities').then(({ DevRoutesActivity }) => ({
      default: DevRoutesActivity,
    })),
  ),
};

const tabRoutes = [
  {
    path: '/',
    decode: ({ session, attendance }: Record<string, string | undefined>) => ({
      initialTab: 'home' as const,
      ...(session === 'team' ? { session } : {}),
      ...(attendance === 'attended' ? { attendance } : {}),
    }),
  },
  { path: '/schedule', decode: () => ({ initialTab: 'schedule' as const }) },
  {
    path: '/notices',
    decode: ({ category }: Record<string, string | undefined>) => ({
      initialTab: 'notices' as const,
      ...(category === 'SESSION' || category === 'ASSIGNMENT' || category === 'OPERATION'
        ? { noticeCategory: category }
        : {}),
    }),
  },
  { path: '/my', decode: () => ({ initialTab: 'my' as const }) },
];

/** 초기 부모 화면을 한 번에 구성해 가드가 차단한 뒤 추가 진입이 예약되지 않게 합니다. */
function initialHistory(history: NonNullable<Route<never>['defaultHistory']>): typeof history {
  return (...args) => {
    const result = history(...args);
    return {
      entries: Array.isArray(result) ? result : result.entries,
      skipDefaultHistorySetupTransition: true,
    };
  };
}

export const stackflowConfig = defineConfig({
  activities: [
    { name: 'Tabs', route: tabRoutes },
    {
      name: 'AttendanceCode',
      route: {
        path: '/attendance/code',
        defaultHistory: initialHistory(() => [
          { activityName: 'Tabs', activityParams: { initialTab: 'home' } },
        ]),
      },
    },
    {
      name: 'AttendanceReport',
      route: {
        path: '/attendance/report',
        defaultHistory: initialHistory(() => [
          { activityName: 'Tabs', activityParams: { initialTab: 'home' } },
        ]),
      },
    },
    {
      name: 'TeamAttendanceGuide',
      route: {
        path: '/team-attendance/guide',
        defaultHistory: initialHistory(() => [
          { activityName: 'Tabs', activityParams: { initialTab: 'home' } },
        ]),
      },
    },
    {
      name: 'Alerts',
      route: {
        path: '/alerts',
        defaultHistory: initialHistory(() => [
          {
            activityName: 'Tabs',
            activityParams: { initialTab: 'home' },
          },
        ]),
      },
    },
    {
      name: 'NoticeDetail',
      route: {
        path: '/notices/:noticeId',
        defaultHistory: initialHistory(() => [
          { activityName: 'Tabs', activityParams: { initialTab: 'notices' } },
        ]),
      },
    },
    {
      name: 'Attendance',
      route: {
        path: '/my/attendance',
        defaultHistory: initialHistory(() => [
          { activityName: 'Tabs', activityParams: { initialTab: 'my' } },
        ]),
      },
    },
    {
      name: 'AttendanceRules',
      route: {
        path: '/my/attendance/rules',
        defaultHistory: initialHistory(() => [
          { activityName: 'Tabs', activityParams: { initialTab: 'my' } },
          { activityName: 'Attendance', activityParams: {} },
        ]),
      },
    },
    {
      name: 'AttendanceComplete',
      route: {
        path: '/attendance/complete',
        defaultHistory: initialHistory(() => [
          { activityName: 'Tabs', activityParams: { initialTab: 'home' } },
        ]),
      },
    },
    {
      name: 'Settings',
      route: {
        path: '/settings',
        defaultHistory: initialHistory(() => [
          { activityName: 'Tabs', activityParams: { initialTab: 'my' } },
        ]),
      },
    },
    {
      name: 'TeamAttendanceUpload',
      route: {
        path: '/team-attendance/upload',
        defaultHistory: initialHistory(() => [
          { activityName: 'Tabs', activityParams: { initialTab: 'home' } },
        ]),
      },
    },
    {
      name: 'TeamAttendanceError',
      route: {
        path: '/team-attendance/error',
        defaultHistory: initialHistory(() => [
          { activityName: 'Tabs', activityParams: { initialTab: 'home' } },
        ]),
      },
    },
    {
      name: 'TeamAttendanceComplete',
      route: {
        path: '/team-attendance/complete',
        defaultHistory: initialHistory(() => [
          { activityName: 'Tabs', activityParams: { initialTab: 'home' } },
        ]),
      },
    },
    { name: 'Login', route: '/login' },
    {
      name: 'LoginError',
      route: {
        path: '/login/error',
        defaultHistory: initialHistory(() => [{ activityName: 'Login', activityParams: {} }]),
      },
    },
    {
      name: 'Error',
      route: {
        path: '/error',
        defaultHistory: initialHistory(() => [{ activityName: 'Login', activityParams: {} }]),
      },
    },
    {
      name: 'Signup',
      route: {
        path: '/signup',
        defaultHistory: initialHistory(() => [{ activityName: 'Login', activityParams: {} }]),
      },
    },
    {
      name: 'SignupStatus',
      route: {
        path: '/signup/status',
        defaultHistory: initialHistory(() => [{ activityName: 'Login', activityParams: {} }]),
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

function canonicalHistoryPlugin(): StackflowPlugin {
  return () => ({
    key: 'canonical-history',
    onInit: scheduleCanonicalPath,
    // history-sync 2는 전환이 끝난 Stack 변경에서 URL을 확정합니다.
    onChanged: scheduleCanonicalPath,
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

export function createStackflowApp(
  options: { reducedMotion?: boolean; queryClient?: QueryClient } = {},
) {
  const config = options.reducedMotion
    ? { ...stackflowConfig, transitionDuration: 0 }
    : stackflowConfig;

  const historySync = historySyncPlugin({ config, fallbackActivity: () => 'NotFound' });
  const app = createStackflow({
    components: activityComponents,
    config,
    plugins: [
      basicRendererPlugin(),
      accountBoundaryPlugin(),
      historySync,
      ...(options.queryClient ? [nativeEntryGuard(options.queryClient, config.activities)] : []),
      seedPlugin(({ initialContext }) => ({
        theme:
          isStackflowInitialContext(initialContext) && initialContext.platform === 'android'
            ? 'android'
            : 'cupertino',
      })),
      reducedMotionPlugin(),
      canonicalHistoryPlugin(),
    ],
  });
  // Link 3은 탐색 플러그인의 URL resolver를 명시적으로 전달받습니다.
  return {
    ...app,
    Stack: (props: ComponentProps<typeof app.Stack>) => (
      <LinkUrlResolverProvider resolver={historySync.urlResolver}>
        <app.Stack {...props} />
      </LinkUrlResolverProvider>
    ),
  };
}
