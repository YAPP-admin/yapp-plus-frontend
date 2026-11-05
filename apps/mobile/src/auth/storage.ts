import * as SecureStore from 'expo-secure-store';

/** native 인증에 필요한 refresh token만 Keychain에 보관합니다. */
export class AuthStorage {
  private readonly refreshTokenKey = 'org.yapp.yappplus.auth.refresh-token';

  public async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(this.refreshTokenKey);
  }

  public async setRefreshToken(refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(this.refreshTokenKey, refreshToken);
  }

  public async clearSession(): Promise<void> {
    await SecureStore.deleteItemAsync(this.refreshTokenKey);
  }
}

export const authStorage = new AuthStorage();
