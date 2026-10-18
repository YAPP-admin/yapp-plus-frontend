/** 빈 초기값으로 세션 생성 폼을 구성하며 성공 후 초기화 콜백을 전달합니다. */
import type { ComponentProps } from 'react';
import type { CreateSessionInput } from '../model/session';
import { SessionFormDialog } from './session-form-dialog';

const INITIAL_SESSION_VALUES: CreateSessionInput = {
  name: '',
  location: '',
  date: '',
  startTime: '',
  endTime: '',
  type: 'regular',
};

export function SessionCreateDialog(
  props: Omit<ComponentProps<typeof SessionFormDialog>, 'mode' | 'initialValues'>,
) {
  return <SessionFormDialog {...props} mode="create" initialValues={INITIAL_SESSION_VALUES} />;
}
