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
  }
}

type EmptyActivityParams = ActivityBaseParams;

const components = {
  Tabs: lazy<TabsParams>(() =>
    import('./activities/tabs').then(({ TabsActivity }) => ({ default: TabsActivity })),
  ),
  Alerts: lazy<EmptyActivityParams>(() =>
    import('./activities/alerts').then(({ AlertsActivity }) => ({ default: AlertsActivity })),
  ),
  NoticeDetail: lazy<{ noticeId: string }>(() =>
    import('./activities/notice-detail').then(({ NoticeDetailActivity }) => ({
      default: NoticeDetailActivity,
    })),
  ),
  NotFound: lazy<EmptyActivityParams>(() =>
    import('./activities/not-found').then(({ NotFoundActivity }) => ({
      default: NotFoundActivity,
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
