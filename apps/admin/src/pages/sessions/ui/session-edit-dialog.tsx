/** 저장된 세션의 초기값을 수정 폼에 전달하며 실제 저장은 부모 콜백에 맡깁니다. */
import { useState, type ComponentProps } from 'react';
import type { CreateSessionInput, Session } from '../model/session';
import { SessionFormDialog } from './session-form-dialog';

type SessionEditDialogProps = Pick<
  ComponentProps<typeof SessionFormDialog>,
  'trigger' | 'pending' | 'error'
> & {
  session: Session;
  onSubmit: (input: CreateSessionInput) => void;
};

export function SessionEditDialog({ session, onSubmit, ...props }: SessionEditDialogProps) {
  const [open, setOpen] = useState(false);
  const { name, location, date, startTime, endTime, type } = session;
  return (
    <SessionFormDialog
      {...props}
      key={session.id}
      mode="edit"
      initialValues={{ name, location, date, startTime, endTime, type }}
      open={open}
      onOpenChange={setOpen}
      onSubmit={(input) => onSubmit(input)}
    />
  );
}
