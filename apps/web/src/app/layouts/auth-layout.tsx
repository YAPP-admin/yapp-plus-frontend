'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import type { ReactNode } from 'react';
import { BackButton } from '../navigation/back-button';
import { PageShell } from './page-shell';

// 라우팅 정책상 로그인으로 복귀하는 가입 정보 입력·승인 상태 화면에만 뒤로가기를 표시합니다.
const BACK_TO_LOGIN = new Set(['signup', 'signup/status']);

export function AuthLayout({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const showBack = BACK_TO_LOGIN.has(segments?.join('/') ?? '');

  return (
    <PageShell plain backButton={showBack ? <BackButton fallback="/login" iconOnly /> : undefined}>
      {children}
    </PageShell>
  );
}
