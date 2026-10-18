'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import type { ReactNode } from 'react';
import { BackButton } from '../navigation/back-button';
import { PageShell } from './page-shell';

// 가입 정보 입력 화면에서만 로그인으로 돌아가는 뒤로가기를 표시합니다.
export function AuthLayout({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const isSignupForm = segments?.join('/') === 'signup';

  return (
    <PageShell
      plain
      backButton={isSignupForm ? <BackButton fallback="/login" iconOnly /> : undefined}
    >
      {children}
    </PageShell>
  );
}
