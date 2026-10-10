import type { LoginInput } from './login';

type LoginField = {
  name: keyof LoginInput;
  label: string;
  type: 'text' | 'password';
  autoComplete: 'username' | 'current-password';
};

export const LOGIN_FIELDS = [
  { name: 'username', label: '아이디', type: 'text', autoComplete: 'username' },
  { name: 'password', label: '비밀번호', type: 'password', autoComplete: 'current-password' },
] as const satisfies readonly LoginField[];

export const UNAVAILABLE_MESSAGE = '로그인할 수 없어요. 잠시 후 다시 시도해주세요.';
