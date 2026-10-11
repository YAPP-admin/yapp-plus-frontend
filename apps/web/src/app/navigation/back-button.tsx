'use client';

import { ActionButton } from '@yapp-plus/ui';
import { useRouter } from 'next/navigation';
import { useCanGoBack } from './navigation-history';
import { backButton } from './back-button.css';

export function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  return (
    <ActionButton
      type="button"
      className={backButton}
      variant="neutralWeak"
      size="medium"
      onClick={() => {
        if (canGoBack.current()) {
          router.back();
        } else {
          router.replace(fallback);
        }
      }}
    >
      뒤로가기
    </ActionButton>
  );
}
