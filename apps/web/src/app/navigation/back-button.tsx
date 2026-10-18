'use client';

import { IconChevronLeftLine } from '@karrotmarket/react-monochrome-icon';
import { ActionButton, Icon } from '@yapp-plus/ui';
import { useRouter } from 'next/navigation';
import { useCanGoBack } from './navigation-history';
import { backButton, iconBackButton } from './back-button.css';

export function BackButton({
  fallback,
  iconOnly = false,
}: {
  fallback: string;
  iconOnly?: boolean;
}) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  function handleClick() {
    if (canGoBack.current()) {
      router.back();
    } else {
      router.replace(fallback);
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
