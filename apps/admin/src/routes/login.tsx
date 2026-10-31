import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { login } from '~/features/login';
import { LoginPage } from '~/pages/login';

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: '로그인 | YAPP+ Admin' }] }),
  component: LoginRoute,
});

export function LoginRoute() {
  const navigate = useNavigate();

  return <LoginPage login={login} onSuccess={() => navigate({ to: '/' })} />;
}
