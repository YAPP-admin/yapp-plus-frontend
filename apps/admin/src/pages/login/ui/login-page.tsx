import { LoginForm, type Login } from '~/features/login';

type LoginPageProps = {
  login: Login;
  onSuccess: () => void | Promise<void>;
};

export function LoginPage({ login, onSuccess }: LoginPageProps) {
  return <LoginForm login={login} onSuccess={onSuccess} />;
}
