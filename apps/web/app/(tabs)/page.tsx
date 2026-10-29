import { HomePage } from '@/pages/home';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  );
}
