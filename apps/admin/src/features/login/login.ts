import { login as requestStaffLogin, zStaffLoginResponse } from '@yapp-plus/api/generated';
import { saveAdminAccessToken } from './admin-session';

export type LoginInput = { username: string; password: string };
export type LoginResult = { status: 'success' | 'invalid-credentials' | 'unavailable' };
export type Login = (input: LoginInput) => Promise<LoginResult>;

export const login: Login = async (input) => {
  try {
    const result = await requestStaffLogin({
      body: {
        loginId: input.username,
        password: input.password,
      },
    });

    if (result.response?.status === 401) {
      return { status: 'invalid-credentials' };
    }

    if (!result.data) {
      return { status: 'unavailable' };
    }

    const parsed = zStaffLoginResponse.safeParse(result.data);
    if (!parsed.success || !saveAdminAccessToken(parsed.data.accessToken)) {
      return { status: 'unavailable' };
    }

    return { status: 'success' };
  } catch {
    return { status: 'unavailable' };
  }
};
