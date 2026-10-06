import type { Login } from './login';

// 실제 인증 정보가 아닌 개발 화면 검증용 공개 입력입니다.
export const mockLogin: Login = async ({ username, password }) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 400));

  return {
    status:
      username === 'admin-demo' && password === 'demo-password' ? 'success' : 'invalid-credentials',
  };
};
