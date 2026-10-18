'use client';

import { ActionButton, PrefixIcon, Text } from '@yapp-plus/ui';
import { useRouter } from 'next/navigation';
import {
  buttonGroup,
  container,
  content,
  illustrationSection,
  socialButton,
} from './login-page.css';
import { LoginIllustration } from './login-illustration';
import { appleIcon, googleIcon } from './social-login-icons';

function handleGoogleLogin() {
  // 향후 Google OAuth SDK / API 연동
}

export function LoginPage() {
  const router = useRouter();

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
    </main>
  );
}
