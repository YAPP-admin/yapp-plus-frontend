/** 저장된 세션의 초기값을 수정 폼에 전달하며 저장·닫기는 부모 콜백에 맡깁니다. */
import { type ComponentProps } from 'react';
import type { CreateSessionInput, Session } from '../model/session';
import { SessionFormDialog } from './session-form-dialog';

type SessionEditDialogProps = Pick<
  ComponentProps<typeof SessionFormDialog>,
  'pending' | 'error' | 'errorAction'
> & {
  session: Session;
  onClose: () => void;
  onSubmit: (input: CreateSessionInput) => void;
};

export function SessionEditDialog({
  session,
  onSubmit,
  onClose,
  ...props
}: SessionEditDialogProps) {
  const { name, location, date, startTime, endTime, type } = session;
  return (
    <SessionFormDialog
      {...props}
      key={session.id}
      mode="edit"
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      initialValues={{ name, location, date, startTime, endTime, type }}
      onSubmit={(input) => onSubmit(input)}
    />
  );
}
