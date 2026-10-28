import { LoginPage } from '@/pages/login';
import { Suspense } from 'react';

export const metadata = {
  title: '로그인 | YAPP+',
};

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
