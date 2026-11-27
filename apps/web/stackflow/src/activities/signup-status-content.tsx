/** 승인 대기 화면의 복귀 확인과 native 정리 결과를 Activity 탐색에 연결합니다. */
import { useState } from 'react';
import { useFlow } from '@stackflow/react';
import { IconChevronLeftLine } from '@karrotmarket/react-monochrome-icon';
import {
  DialogRoot,
  DialogTrigger,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Portal,
} from '@seed-design/react';
import { ActionButton, Icon } from '@yapp-plus/ui';
import { useNativeAuthSession, useNativeSignOutMutation } from '@/features/auth';
import { SignupStatusPage } from '@/pages/signup-status';
import { PageShell } from '@/app/layouts/page-shell';
import { iconBackButton } from '@/app/navigation/back-button.css';
import * as styles from './signup-status-content.css';

/** native 정리 후 탐색은 인증 경계에 맡기며 실패하면 확인창에서 재시도할 수 있습니다. */
export function SignupStatusContent() {
  const flow = useFlow();
  const { isNative } = useNativeAuthSession();
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const mutation = useNativeSignOutMutation({
    onFailure: () => setFailed(true),
  });

  function confirm() {
    if (mutation.isPending) {
      return;
    }
    if (!isNative) {
      flow.replace('Login', {});
      return;
    }
    setFailed(false);
    mutation.mutate(undefined);
  }

  return (
    <DialogRoot
      open={open}
      onOpenChange={(next) => {
        if (!mutation.isPending) {
          setOpen(next);
          setFailed(false);
        }
      }}
    >
      <PageShell
        plain
        backButton={
          <DialogTrigger asChild>
            <ActionButton
              type="button"
              className={iconBackButton}
              variant="ghost"
              size="medium"
              layout="iconOnly"
              aria-label="뒤로가기"
            >
              <Icon svg={<IconChevronLeftLine />} />
            </ActionButton>
          </DialogTrigger>
        }
      >
        <SignupStatusPage />
      </PageShell>
      <Portal>
        <DialogBackdrop className={styles.backdrop} />
        <DialogPositioner className={styles.positioner}>
          <DialogContent width="full" maxWidth="346px">
            <DialogHeader>
              <DialogTitle>로그인 화면으로 돌아갈까요?</DialogTitle>
              <DialogDescription>다시 로그인하면 승인 상태를 확인할 수 있어요.</DialogDescription>
            </DialogHeader>
            {failed && <p role="alert">로그인 화면으로 돌아가지 못했어요. 다시 시도해 주세요.</p>}
            <DialogFooter>
              <ActionButton
                type="button"
                variant="neutralWeak"
                disabled={mutation.isPending}
                onClick={() => setOpen(false)}
              >
                취소
              </ActionButton>
              <ActionButton
                type="button"
                variant="brandSolid"
                disabled={mutation.isPending}
                onClick={confirm}
              >
                로그인으로 돌아가기
              </ActionButton>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </DialogRoot>
  );
}
