import { useActions } from '@stackflow/react';
import { useHistoryTick } from '@stackflow/plugin-history-sync';
import { useFlow, useStepFlow } from '@stackflow/react/future';
import { type MouseEvent, type ReactNode } from 'react';
import { notifyNavigation, resolveStackflowRoute } from './routes';

export function Link({
  href,
  children,
  replace = false,
  onClick,
  ...props
}: {
  href: string;
  children: ReactNode;
  replace?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> & {
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  }) {
  const flow = useFlow();
  const actions = useActions();
  const { requestHistoryTick } = useHistoryTick();
  const tabsStep = useStepFlow('Tabs');
  const target = resolveStackflowRoute(href);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    const currentPathname = window.location.pathname.replace(/\/+$/, '') || '/';
    const targetIsTab = target.activityName === 'Tabs';
    const currentIsTab =
      currentPathname === '/' || /^\/(schedule|notices|my)\/?$/.test(currentPathname);

    if (targetIsTab && currentIsTab) {
      tabsStep.replaceStep(target.activityParams);
    } else if (targetIsTab && currentPathname === '/alerts') {
      actions.pop({ animate: false });
      tabsStep.replaceStep(target.activityParams);
    } else if (replace) {
      flow.replace(target.activityName, target.activityParams, { animate: false });
    } else {
      flow.push(target.activityName, target.activityParams, { animate: false });
    }

    const url = new URL(href, window.location.href);
    requestHistoryTick((resolve) => {
      if (targetIsTab || url.search || url.hash) {
        window.history.replaceState(
          window.history.state,
          '',
          `${url.pathname}${url.search}${url.hash}`,
        );
      }
      notifyNavigation();
      resolve();
    });
  }

  return (
    <a {...props} href={href} onClick={handleClick} draggable={false}>
      {children}
    </a>
  );
}

// oxlint-disable-next-line import/no-default-export
export default Link;
