/** 앱의 Google 설정이 plist 없이 iOS 초기화에 필요한 식별자를 전달하는지 검증합니다. */
import { expect, it, vi } from 'vitest';
import config from '../../app.config';
import { authenticateWithProvider } from './providers';

const google = vi.hoisted(() => ({
  configure: vi.fn<(input: { iosClientId?: string; webClientId: string; nonce: string }) => void>(),
  signIn: vi
    .fn<() => Promise<{ data: { idToken: string } }>>()
    .mockResolvedValue({ data: { idToken: 'test-id-token' } }),
}));
vi.mock('expo-apple-authentication', () => ({}));
vi.mock('expo-crypto', () => ({
  getRandomBytesAsync: () => Promise.resolve(new Uint8Array(32).fill(1)),
  digestStringAsync: () => Promise.resolve('test-hashed-nonce'),
  CryptoDigestAlgorithm: { SHA256: 'SHA256' },
  CryptoEncoding: { HEX: 'hex' },
}));
vi.mock('react-native-nitro-google-signin', () => ({
  GoogleOneTapSignIn: google,
  isCancelledResponse: () => false,
  isNoSavedCredentialFoundResponse: () => false,
  isSuccessResponse: () => true,
}));

it('iOS client ID와 대응하는 URL scheme을 구성하고 web audience와 nonce를 유지한다', async () => {
  await expect(authenticateWithProvider('google')).resolves.toMatchObject({
    provider: 'google',
    idToken: 'test-id-token',
  });
  const iosClientId = '47093355379-s1gkq650qpgjhvsb2bev9h4na5mlmnsi.apps.googleusercontent.com';
  expect(google.configure).toHaveBeenCalledWith({
    iosClientId,
    webClientId: '47093355379-bl1tgba0nj3sn5610bn01aeqc7mm4ljb.apps.googleusercontent.com',
    nonce: 'test-hashed-nonce',
  });
  expect(google.configure).toHaveBeenCalledBefore(google.signIn);
  expect(config.plugins).toContainEqual([
    'react-native-nitro-google-signin',
    { iosUrlScheme: iosClientId.split('.').toReversed().join('.') },
  ]);
});
