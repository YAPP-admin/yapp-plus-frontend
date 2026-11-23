import { sessionNameSchema } from '@yapp-plus/app-bridge';
import * as SecureStore from 'expo-secure-store';

import { traceNativeSessionStorage } from './diagnostics';

export type StoredSession = Readonly<{ refreshToken: string; userId: number; name?: string }>;

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
  return {
    refreshToken: parsed.refreshToken,
    userId: parsed.userId,
    name: sessionNameSchema.parse('name' in parsed ? parsed.name : undefined),
  };
};

/** 갱신 자격과 인증된 계정 ID를 한 값으로 저장합니다. access token은 저장하지 않습니다. */
export class AuthStorage {
  public async getSession(): Promise<StoredSession | null> {
    // 사용자 ID가 없는 이전 저장 형식은 갱신하지 않고 재로그인합니다.
    const deleteLegacySession = SecureStore.deleteItemAsync(legacyTokenKey);
    traceNativeSessionStorage('legacy-delete', 'started');
    try {
      await deleteLegacySession;
      traceNativeSessionStorage('legacy-delete', 'succeeded');
    } catch (error) {
      traceNativeSessionStorage('legacy-delete', 'failed', error);
    }

    traceNativeSessionStorage('session-read', 'started');
    let value: string | null;
    try {
      value = await SecureStore.getItemAsync(sessionKey);
      traceNativeSessionStorage('session-read', 'succeeded');
    } catch (error) {
      traceNativeSessionStorage('session-read', 'failed', error);
      throw error;
    }
    if (value === null) {
      return null;
    }
    const session = parseSession(value);
    if (!session) {
      traceNativeSessionStorage('invalid-session-delete', 'started');
      try {
        await SecureStore.deleteItemAsync(sessionKey);
        traceNativeSessionStorage('invalid-session-delete', 'succeeded');
      } catch (error) {
        traceNativeSessionStorage('invalid-session-delete', 'failed', error);
        throw error;
      }
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
        name: session.name,
      }),
    );
  }

  public async clearSession(): Promise<void> {
    await SecureStore.deleteItemAsync(sessionKey);
    await SecureStore.deleteItemAsync(legacyTokenKey);
  }
}

export const authStorage = new AuthStorage();
