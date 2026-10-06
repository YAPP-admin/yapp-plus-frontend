import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '~/features/login/login-form';

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: '로그인 | YAPP+ Admin' }] }),
  component: LoginPage,
});

export function LoginPage() {
  return <LoginForm />;
}
