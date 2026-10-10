import { LoginForm, type Login } from '~/features/login';

type LoginPageProps = {
  login: Login;
  onSuccess: () => void | Promise<void>;
  available: boolean;
};

export function LoginPage({ login, onSuccess, available }: LoginPageProps) {
  return <LoginForm login={login} onSuccess={onSuccess} available={available} />;
}
