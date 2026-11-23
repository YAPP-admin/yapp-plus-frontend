/** 세션 폼의 모달 셸과 제출·취소 영역을 조합합니다. */
import type { FormEventHandler, ReactNode } from 'react';
import { Dialog, Portal } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import { X } from 'lucide-react';
import * as styles from './session-form.css';

type Props = {
  title: string;
  pending: boolean;
  submitDisabled: boolean;
  submitError: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

/** 본문은 children으로 받고 모달의 닫기·제출 상태만 일관되게 표현합니다. */
export function SessionFormDialog({
  title,
  pending,
  submitDisabled,
  submitError,
  children,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Dialog.Root
      open
      closeOnInteractOutside={false}
      closeOnEscape={!pending}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          {/* Portal 밖의 어드민 셸과 같은 다크 테마를 적용합니다. */}
          <Dialog.Content className={styles.dialog} data-seed-color-mode="dark-only">
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>
                일정, 유형과 정규 세션에 필요한 장소를 입력해 주세요.
              </Dialog.Description>
              <Dialog.CloseButton disabled={pending} aria-label="닫기">
                <X size={20} aria-hidden="true" />
              </Dialog.CloseButton>
            </Dialog.Header>
            <form className={styles.form} aria-label="세션 입력" noValidate onSubmit={onSubmit}>
              <Dialog.Body className={styles.body}>
                {children}
                {submitError && <p role="alert">{submitError}</p>}
              </Dialog.Body>
              <Dialog.Footer className={styles.actions}>
                <ActionButton
                  type="button"
                  variant="neutralWeak"
                  disabled={pending}
                  onClick={onClose}
                >
                  취소
                </ActionButton>
                <ActionButton type="submit" loading={pending} disabled={pending || submitDisabled}>
                  {pending ? '저장 중' : '저장'}
                </ActionButton>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
