import * as SecureStore from 'expo-secure-store';
import { beforeEach, expect, it, vi } from 'vitest';
import { AuthStorage } from './storage';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn<typeof SecureStore.getItemAsync>(),
  setItemAsync: vi.fn<typeof SecureStore.setItemAsync>(),
  deleteItemAsync: vi.fn<typeof SecureStore.deleteItemAsync>(),
}));

const sessionKey = 'org.yapp.yappplus.auth.session';
const legacyKey = 'org.yapp.yappplus.auth.refresh-token';
let values: Map<string, string>;
const storage = new AuthStorage();

beforeEach(() => {
  vi.resetAllMocks();
  values = new Map();
  vi.mocked(SecureStore.getItemAsync).mockImplementation((key) =>
    Promise.resolve(values.get(key) ?? null),
  );
  vi.mocked(SecureStore.setItemAsync).mockImplementation((key, value) => {
    values.set(key, value);
    return Promise.resolve();
  });
  vi.mocked(SecureStore.deleteItemAsync).mockImplementation((key) => {
    values.delete(key);
    return Promise.resolve();
  });
});

it.each([undefined, '테스트 사용자'])(
  '이름 유무와 관계없이 같은 계정을 복원한다 (%s)',
  async (name) => {
    const session = { refreshToken: 'refresh-test', userId: 7, name };
    await storage.setSession(session);
    expect(JSON.parse(values.get(sessionKey) ?? '')).toEqual({ version: 1, ...session });
    await expect(new AuthStorage().getSession()).resolves.toEqual(session);
  },
);

it('이전 토큰 단독 저장은 삭제하고 재로그인으로 전환한다', async () => {
  values.set(legacyKey, 'legacy-refresh');
  await expect(storage.getSession()).resolves.toBeNull();
  expect(values.has(legacyKey)).toBe(false);
});

it.each([
  'broken-json',
  'null',
  '[]',
  JSON.stringify({ version: 2, refreshToken: 'test', userId: 7 }),
  JSON.stringify({ version: 1, refreshToken: 'test' }),
  JSON.stringify({ version: 1, refreshToken: ' ', userId: 7 }),
  JSON.stringify({ version: 1, refreshToken: 'test', userId: '7' }),
  JSON.stringify({ version: 1, refreshToken: 'test', userId: 1.5 }),
  JSON.stringify({ version: 1, refreshToken: 'test', userId: Number.MAX_SAFE_INTEGER + 1 }),
])('손상된 저장값은 사용하지 않고 삭제한다 (%#)', async (value) => {
  values.set(sessionKey, value);
  await expect(storage.getSession()).resolves.toBeNull();
  expect(values.has(sessionKey)).toBe(false);
});

it('저장소 접근 실패는 로그아웃으로 숨기지 않는다', async () => {
  vi.mocked(SecureStore.getItemAsync).mockRejectedValueOnce(new Error('storage'));
  await expect(storage.getSession()).rejects.toThrow('storage');
});

it('새 로그인은 구 형식을 지우고 로그아웃은 두 형식을 모두 제거한다', async () => {
  values.set(legacyKey, 'legacy-refresh');
  await storage.setSession({ refreshToken: 'refresh-test', userId: 7 });
  expect(values.has(legacyKey)).toBe(false);
  values.set(legacyKey, 'legacy-refresh');
  await storage.clearSession();
  expect(values.size).toBe(0);
});

it.each([null, 7, '  '])('잘못된 이름만 무시하고 로그인 자격은 유지한다 (%s)', async (name) => {
  values.set(sessionKey, JSON.stringify({ version: 1, refreshToken: 'test', userId: 7, name }));
  await expect(storage.getSession()).resolves.toEqual({ refreshToken: 'test', userId: 7 });
  expect(values.has(sessionKey)).toBe(true);
});
