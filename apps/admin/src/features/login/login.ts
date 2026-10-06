export type LoginInput = { username: string; password: string };
export type LoginResult = { status: 'success' | 'invalid-credentials' | 'unavailable' };
export type Login = (input: LoginInput) => Promise<LoginResult>;

export const login: Login = async (input) => {
  if (import.meta.env.DEV) {
    const { mockLogin } = await import('./login.mock');

    return mockLogin(input);
  }

  return { status: 'unavailable' };
};
