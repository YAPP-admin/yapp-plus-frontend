import { client } from '@yapp-plus/api/generated';

const ACCESS_TOKEN_KEY = 'yapp-plus-admin.access-token.v1';

function getBrowserStorage(): Storage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function readAdminAccessToken(): string | undefined {
  const storage = getBrowserStorage();
  if (!storage) {
    return undefined;
  }

  try {
    const token = storage.getItem(ACCESS_TOKEN_KEY);
    if (token === null || token.length === 0) {
      return undefined;
    }
    return token;
  } catch {
    return undefined;
  }
}

export function saveAdminAccessToken(token: string): boolean {
  if (!token) {
    return false;
  }

  const storage = getBrowserStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch {
    return false;
  }
}

/** 브라우저에 남은 관리자 access token을 삭제하고 삭제 성공 여부를 반환한다. */
export function clearAdminAccessToken(): boolean {
  const storage = getBrowserStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(ACCESS_TOKEN_KEY);
    return true;
  } catch {
    return false;
  }
}

export function configureAdminApiClient(): void {
  client.setConfig({
    auth: (auth) => (auth.key === 'staffBearerAuth' ? readAdminAccessToken() : undefined),
  });
}
