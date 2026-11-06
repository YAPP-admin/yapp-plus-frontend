import * as SecureStore from 'expo-secure-store';

export type StoredSession = Readonly<{ refreshToken: string; userId: number }>;

const sessionKey = 'org.yapp.yappplus.auth.session';
const legacyTokenKey = 'org.yapp.yappplus.auth.refresh-token';

const parseSession = (value: string): StoredSession | null => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('version' in parsed) ||
    parsed.version !== 1 ||
    !('refreshToken' in parsed) ||
    typeof parsed.refreshToken !== 'string' ||
    parsed.refreshToken.trim().length === 0 ||
    !('userId' in parsed) ||
    typeof parsed.userId !== 'number' ||
    !Number.isSafeInteger(parsed.userId)
  ) {
    return null;
  }
  return { refreshToken: parsed.refreshToken, userId: parsed.userId };
};

/** 갱신 자격과 인증된 계정 ID를 한 값으로 저장합니다. access token은 저장하지 않습니다. */
export class AuthStorage {
  public async getSession(): Promise<StoredSession | null> {
    // 사용자 ID가 없는 이전 저장 형식은 갱신하지 않고 재로그인합니다.
    await SecureStore.deleteItemAsync(legacyTokenKey);
    const value = await SecureStore.getItemAsync(sessionKey);
    if (value === null) {
      return null;
    }
    const session = parseSession(value);
    if (!session) {
      await SecureStore.deleteItemAsync(sessionKey);
    }
    return session;
  }

  public async setSession(session: StoredSession): Promise<void> {
    await SecureStore.deleteItemAsync(legacyTokenKey);
    await SecureStore.setItemAsync(
      sessionKey,
      JSON.stringify({
        version: 1,
        refreshToken: session.refreshToken,
        userId: session.userId,
      }),
    );
  }

  public async clearSession(): Promise<void> {
    await SecureStore.deleteItemAsync(sessionKey);
    await SecureStore.deleteItemAsync(legacyTokenKey);
  }
}

export const authStorage = new AuthStorage();
