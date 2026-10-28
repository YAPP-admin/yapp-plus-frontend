'use client';

import {
  DialogAction,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
} from '@seed-design/react';
import { ActionButton, PrefixIcon, Text } from '@yapp-plus/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  buttonGroup,
  container,
  content,
  dialogBackdrop,
  dialogCancelButton,
  dialogConfirmButton,
  dialogContent,
  dialogDescription,
  dialogFooter,
  dialogHeader,
  dialogPositioner,
  dialogTitle,
  illustrationSection,
  socialButton,
} from './login-page.css';
import { LoginIllustration } from './login-illustration';
import { appleIcon, googleIcon } from './social-login-icons';

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isErrorOpen, setIsErrorOpen] = useState(searchParams?.get('error') === 'true');

  function handleGoogleLogin() {
    setIsErrorOpen(true);
  }

  function handleAppleLogin() {
    router.push('/signup');
  }

  return (
    <main className={container}>
      <Text as="h1" textStyle="t10Bold" color="fg.neutral" whiteSpace="pre-line">
        당신의 작은 아이디어가
        {'\n'}
        세상을 바꿉니다
      </Text>

      <div className={content}>
        <section className={illustrationSection} aria-label="YAPP 마스코트 일러스트">
          <LoginIllustration />
        </section>

        <section className={buttonGroup} aria-label="소셜 로그인">
          <ActionButton
            type="button"
            size="large"
            variant="neutralOutline"
            className={socialButton}
            onClick={handleGoogleLogin}
          >
            <PrefixIcon svg={googleIcon} />
            구글로 계속하기
          </ActionButton>

          <ActionButton
            type="button"
            size="large"
            variant="neutralSolid"
            className={socialButton}
            onClick={handleAppleLogin}
          >
            <PrefixIcon svg={appleIcon} />
            애플로 계속하기
          </ActionButton>
        </section>
      </div>

      {/* 에러 팝업 (Figma #375:11225) */}
      <DialogRoot open={isErrorOpen} onOpenChange={setIsErrorOpen}>
        <DialogBackdrop className={dialogBackdrop} />
        <DialogPositioner className={dialogPositioner}>
          <DialogContent className={dialogContent}>
            <DialogHeader className={dialogHeader}>
              <DialogTitle className={dialogTitle}>앗, 예기치 못한 오류가 발생했어요!</DialogTitle>
              <DialogDescription className={dialogDescription}>
                계속해서 같은 문제가 발생한다면{'\n'}운영팀에 제보해주세요
              </DialogDescription>
            </DialogHeader>
            <div className={dialogFooter}>
              <DialogAction asChild>
                <button
                  type="button"
                  className={dialogCancelButton}
                  onClick={() => setIsErrorOpen(false)}
                >
                  닫기
                </button>
              </DialogAction>
              <DialogAction asChild>
                <a
                  href="https://pf.kakao.com/_xkxmxjxd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={dialogConfirmButton}
                  onClick={() => setIsErrorOpen(false)}
                >
                  제보하기
                </a>
              </DialogAction>
            </div>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>
    </main>
  );
}
