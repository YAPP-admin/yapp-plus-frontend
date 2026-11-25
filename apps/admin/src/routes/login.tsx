import { createFileRoute, useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import { login } from '~/features/login';
import { LoginPage } from '~/pages/login';

export const Route = createFileRoute('/login')({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({ meta: [{ title: '로그인 | YAPP+ Admin' }] }),
  component: LoginRoute,
});

export function LoginRoute() {
  const router = useRouter({ warn: false });
  const redirect = router
    ? (new URLSearchParams(router.state.location.searchStr).get('redirect') ?? undefined)
    : undefined;

  return (
    <LoginPage
      login={login}
      onSuccess={() => {
        const target = redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';
        router?.history.push(target);
      }}
    />
  );
}
