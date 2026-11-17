import { afterEach, expect, it, vi } from 'vitest';
import { getSessionGenerationId } from './session-config';

afterEach(() => {
  vi.unstubAllEnvs();
});

it('기수 ID 설정이 없으면 null을 반환한다', () => {
  vi.stubEnv('VITE_ADMIN_GENERATION_ID', '');

  expect(getSessionGenerationId()).toBeNull();
});

it('기수 ID 설정값을 숫자로 반환한다', () => {
  vi.stubEnv('VITE_ADMIN_GENERATION_ID', '25');

  expect(getSessionGenerationId()).toBe(25);
});

it('숫자가 아닌 기수 ID 설정은 null을 반환한다', () => {
  vi.stubEnv('VITE_ADMIN_GENERATION_ID', 'current');

  expect(getSessionGenerationId()).toBeNull();
});
