'use client';

import { IconChevronLeftLine } from '@karrotmarket/react-monochrome-icon';
import type { InferActivityParams, RegisteredActivityName } from '@stackflow/config';
import { useFlow } from '@stackflow/react/future';
import { ActionButton, Icon } from '@yapp-plus/ui';
import { useCanGoBack } from './navigation-history';
import { backButton, iconBackButton } from './back-button.css';

export function BackButton<ActivityName extends RegisteredActivityName>({
  fallbackActivityName,
  fallbackActivityParams,
  iconOnly = false,
}: {
  fallbackActivityName: ActivityName;
  fallbackActivityParams: InferActivityParams<ActivityName>;
  iconOnly?: boolean;
}) {
  const flow = useFlow();
  const canGoBack = useCanGoBack();

  function handleClick() {
    if (canGoBack.current()) {
      flow.pop();
    } else {
      flow.replace(fallbackActivityName, fallbackActivityParams);
    }
  }

  if (iconOnly) {
    return (
      <ActionButton
        type="button"
        className={iconBackButton}
        variant="ghost"
        size="medium"
        layout="iconOnly"
        aria-label="뒤로가기"
        onClick={handleClick}
      >
        <Icon svg={<IconChevronLeftLine />} />
      </ActionButton>
    );
  }

  return (
    <ActionButton
      type="button"
      className={backButton}
      variant="neutralWeak"
      size="medium"
      onClick={handleClick}
    >
      뒤로가기
    </ActionButton>
  );
}
