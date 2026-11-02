import { defineConfig, type ActivityBaseParams } from '@stackflow/config';
import { historySyncPlugin } from '@stackflow/plugin-history-sync';
import { basicRendererPlugin } from '@stackflow/plugin-renderer-basic';
import { lazy, stackflow as createStackflow } from '@stackflow/react/future';
import { Primitive, seedPlugin } from '@seed-design/stackflow';
import { useEffect, type ReactNode } from 'react';
import type { StackflowInitialContext } from './platform';
import type { TabName } from './tab';

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

function canonicalUrlPlugin() {
  return () => ({
    key: 'canonical-url',
    wrapStack({ stack }: { stack: { render: () => ReactNode } }) {
      return <CanonicalUrlBoundary>{stack.render()}</CanonicalUrlBoundary>;
    },
  });
}

function CanonicalUrlBoundary({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    if (url.pathname !== '/') {
      const canonicalPathname = url.pathname.replace(/\/+$/, '');
      window.history.replaceState(
        window.history.state,
        '',
        `${canonicalPathname}${url.search}${url.hash}`,
      );
    }
  });

  return children;
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
      canonicalUrlPlugin(),
    ],
  });
}

export const { Stack } = createStackflowApp();
