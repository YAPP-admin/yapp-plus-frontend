/** 관리자 화면에서 메시지와 표시 유형으로 SEED Snackbar를 구성합니다. */
import { Snackbar as SeedSnackbar } from '@seed-design/react';
import type { ComponentProps } from 'react';

type SnackbarProps = {
  message: string;
  variant?: ComponentProps<typeof SeedSnackbar.Root>['variant'];
};

export function Snackbar({ message, variant = 'default' }: SnackbarProps) {
  return (
    <SeedSnackbar.Root variant={variant}>
      <SeedSnackbar.Content>
        <SeedSnackbar.Message>{message}</SeedSnackbar.Message>
      </SeedSnackbar.Content>
      <SeedSnackbar.HiddenCloseButton>닫기</SeedSnackbar.HiddenCloseButton>
    </SeedSnackbar.Root>
  );
}
