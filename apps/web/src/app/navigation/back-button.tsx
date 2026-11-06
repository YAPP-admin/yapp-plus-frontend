'use client';

import { IconChevronLeftLine } from '@karrotmarket/react-monochrome-icon';
import type { InferActivityParams, RegisteredActivityName } from '@stackflow/config';
import { useFlow } from '@stackflow/react/future';
import { ActionButton, Icon } from '@yapp-plus/ui';
import { useActivity } from '@stackflow/react';
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
  const { isRoot } = useActivity();

  // 직접 접근의 부모 화면은 route.defaultHistory가 만들고, root에만 명시적 fallback을 씁니다.
  function handleClick() {
    if (isRoot) {
      flow.replace(fallbackActivityName, fallbackActivityParams);
    } else {
      flow.pop();
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
