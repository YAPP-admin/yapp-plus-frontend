import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LoginForm } from '~/features/login/login-form';
import { login } from '~/features/login/login';

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: '로그인 | YAPP+ Admin' }] }),
  component: LoginPage,
});

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <LoginForm
      login={login}
      available={import.meta.env.DEV}
      onSuccess={() => navigate({ to: '/' })}
    />
  );
}
