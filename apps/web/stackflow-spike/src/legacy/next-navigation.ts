import { useActions } from '@stackflow/react';
import { useFlow } from '@stackflow/react/future';
import { useSyncExternalStore } from 'react';
import { notifyNavigation, resolveStackflowRoute } from './routes';

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }
  window.addEventListener('popstate', onChange);
  window.addEventListener('yapp:navigation', onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener('yapp:navigation', onChange);
  };
}

function getPathname() {
  return typeof window === 'undefined' ? '/' : window.location.pathname;
}

function getSearch() {
  return typeof window === 'undefined' ? '' : window.location.search;
}

export function usePathname() {
  return useSyncExternalStore(subscribe, getPathname, () => '/');
}

export function useSearchParams() {
  const search = useSyncExternalStore(subscribe, getSearch, () => '');
  return new URLSearchParams(search);
}

export function useParams() {
  const pathname = usePathname();
  const noticeMatch = /^\/notices\/([^/]+)\/?$/.exec(pathname);
  return { noticeId: noticeMatch?.[1] };
}

export function useSelectedLayoutSegments() {
  return usePathname().split('/').filter(Boolean);
}

export function useRouter() {
  const flow = useFlow();
  const actions = useActions();

  return {
    push(href: string) {
      const target = resolveStackflowRoute(href);
      flow.push(target.activityName, target.activityParams, { animate: false });
      queueMicrotask(notifyNavigation);
    },
    replace(href: string) {
      const target = resolveStackflowRoute(href);
      flow.replace(target.activityName, target.activityParams, { animate: false });
      queueMicrotask(notifyNavigation);
    },
    back() {
      actions.pop({ animate: false });
      queueMicrotask(notifyNavigation);
    },
  };
}
