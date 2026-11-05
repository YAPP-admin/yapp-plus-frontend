'use client';

import { BackButton } from '@/app/navigation/back-button';
import {
  DialogAction,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  SwitchControl,
  SwitchHiddenInput,
  SwitchRoot,
  SwitchThumb,
} from '@seed-design/react';
import { Image } from '@/app/navigation/image';
import { useFlow } from '@stackflow/react/future';
import { useState } from 'react';
import {
  useNativeAuthSession,
  useNativeSignOutMutation,
  useNativeWithdrawMutation,
} from '@/features/auth';
import { ActionButton, Snackbar, useSnackbarAdapter } from '@yapp-plus/ui';
import {
  body,
  bottomSection,
  container,
  dialogBackdrop,
  dialogCancelButton,
  dialogConfirmButton,
  dialogContent,
  dialogDescription,
  dialogFooter,
  dialogHeader,
  dialogPositioner,
  dialogTitle,
  header,
  headerSpacer,
  headerTitle,
  logoutButton,
  menuChevron,
  menuItem,
  menuLabel,
  menuList,
  switchControl,
  switchRoot,
  switchThumb,
} from './settings-page.css';

const SETTINGS_LINKS = [
  {
    id: 'privacy',
    label: '개인정보 처리 방침',
    href: 'https://yapp.co.kr/privacy',
  },
  {
    id: 'terms',
    label: '이용 약관',
    href: 'https://yapp.co.kr/terms',
  },
];

export function SettingsPage() {
  const flow = useFlow();
  const { isNative } = useNativeAuthSession();
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const snackbar = useSnackbarAdapter();
  const withdrawMutation = useNativeWithdrawMutation();
  const signOutMutation = useNativeSignOutMutation();
  const isAccountActionPending = withdrawMutation.isPending || signOutMutation.isPending;

  const showAccountError = (message: string): void => {
    snackbar.create({
      render: () => <Snackbar variant="critical" message={message} />,
    });
  };

  const handleWithdraw = () => {
    if (!isNative) {
      flow.push('Login', {});
      return;
    }

    withdrawMutation.mutate(undefined, {
      onSuccess: (result) => {
        if (result?.status === 'WITHDRAWN') {
          flow.replace('Login', {});
          return;
        }
        showAccountError('탈퇴 처리 결과를 확인하지 못했어요. 다시 시도해 주세요.');
      },
      onError: () => showAccountError('탈퇴 처리 중 문제가 발생했어요. 다시 시도해 주세요.'),
    });
  };

  const handleLogout = () => {
    if (!isNative) {
      flow.push('Login', {});
      return;
    }

    signOutMutation.mutate(undefined, {
      onSuccess: (result) => {
        if (result?.status === 'SIGNED_OUT') {
          flow.replace('Login', {});
          return;
        }
        showAccountError('로그아웃 처리 결과를 확인하지 못했어요. 다시 시도해 주세요.');
      },
      onError: () => showAccountError('로그아웃 중 문제가 발생했어요. 다시 시도해 주세요.'),
    });
  };

  return (
    <div className={container}>
      <header className={header}>
        <BackButton
          fallbackActivityName="Tabs"
          fallbackActivityParams={{ initialTab: 'my' }}
          iconOnly
        />
        <h1 className={headerTitle}>설정</h1>
        <div className={headerSpacer} aria-hidden="true" />
      </header>

      <main className={body}>
        <section className={menuList} aria-label="설정 메뉴">
          <div className={menuItem}>
            <span className={menuLabel}>알림</span>
            <SwitchRoot
              className={switchRoot}
              checked={isNotificationEnabled}
              onCheckedChange={setIsNotificationEnabled}
            >
              <SwitchHiddenInput />
              <SwitchControl className={switchControl}>
                <SwitchThumb className={switchThumb} />
              </SwitchControl>
            </SwitchRoot>
          </div>

          {SETTINGS_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={menuItem}
            >
              <span className={menuLabel}>{link.label}</span>
              <Image
                src="/images/my/chevron-right.svg"
                alt=""
                width={24}
                height={24}
                className={menuChevron}
              />
            </a>
          ))}

          {/* 회원 탈퇴 다이얼로그 (Figma #222:48187) */}
          <DialogRoot>
            <DialogTrigger asChild>
              <button type="button" className={menuItem}>
                <span className={menuLabel}>회원 탈퇴</span>
                <Image
                  src="/images/my/chevron-right.svg"
                  alt=""
                  width={24}
                  height={24}
                  className={menuChevron}
                />
              </button>
            </DialogTrigger>
            <DialogBackdrop className={dialogBackdrop} />
            <DialogPositioner className={dialogPositioner}>
              <DialogContent className={dialogContent}>
                <DialogHeader className={dialogHeader}>
                  <DialogTitle className={dialogTitle}>정말 탈퇴하시겠어요?</DialogTitle>
                  <DialogDescription className={dialogDescription}>
                    탈퇴하시면 모든 정보가 삭제돼요.
                  </DialogDescription>
                </DialogHeader>
                <div className={dialogFooter}>
                  <DialogAction asChild>
                    <ActionButton
                      type="button"
                      size="medium"
                      variant="neutralWeak"
                      className={dialogCancelButton}
                    >
                      취소
                    </ActionButton>
                  </DialogAction>
                  <DialogAction asChild>
                    <ActionButton
                      type="button"
                      size="medium"
                      variant="brandSolid"
                      className={dialogConfirmButton}
                      disabled={isAccountActionPending}
                      onClick={handleWithdraw}
                    >
                      탈퇴하기
                    </ActionButton>
                  </DialogAction>
                </div>
              </DialogContent>
            </DialogPositioner>
          </DialogRoot>
        </section>

        {/* 로그아웃 다이얼로그 (Figma #222:48244) */}
        <section className={bottomSection} aria-label="계정 관리">
          <DialogRoot>
            <DialogTrigger asChild>
              <button type="button" className={logoutButton}>
                로그아웃
              </button>
            </DialogTrigger>
            <DialogBackdrop className={dialogBackdrop} />
            <DialogPositioner className={dialogPositioner}>
              <DialogContent className={dialogContent}>
                <DialogHeader className={dialogHeader}>
                  <DialogTitle className={dialogTitle}>로그아웃 할까요?</DialogTitle>
                </DialogHeader>
                <div className={dialogFooter}>
                  <DialogAction asChild>
                    <ActionButton
                      type="button"
                      size="medium"
                      variant="neutralWeak"
                      className={dialogCancelButton}
                    >
                      취소
                    </ActionButton>
                  </DialogAction>
                  <DialogAction asChild>
                    <ActionButton
                      type="button"
                      size="medium"
                      variant="brandSolid"
                      className={dialogConfirmButton}
                      disabled={isAccountActionPending}
                      onClick={handleLogout}
                    >
                      로그아웃
                    </ActionButton>
                  </DialogAction>
                </div>
              </DialogContent>
            </DialogPositioner>
          </DialogRoot>
        </section>
      </main>
    </div>
  );
}
