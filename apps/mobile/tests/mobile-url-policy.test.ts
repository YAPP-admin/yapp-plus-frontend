import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateMobileWebUrl } from '../src/mobile-url-policy.ts';

for (const value of [
  undefined,
  '',
  'not-a-url',
  'http://example.com',
  'https://localhost',
  'https://127.0.0.1',
  'https://127.1',
  'https://2130706433',
  'https://[::1]',
  'https://localhost.',
  'https://web.localhost',
  'https://10.0.2.2',
  'https://user:password@example.com',
  'javascript:alert(1)',
]) {
  void test(`배포 URL 거부: ${String(value)}`, () => {
    assert.throws(() => validateMobileWebUrl(value, false));
  });
}
void test('배포 HTTPS 주소는 경로·쿼리를 유지한다', () => {
  assert.equal(
    validateMobileWebUrl(' https://web.example.com/app?mode=preview ', false),
    'https://web.example.com/app?mode=preview',
  );
});
void test('개발에서만 누락과 로컬 HTTP를 허용한다', () => {
  assert.equal(validateMobileWebUrl(undefined, true), undefined);
  assert.equal(validateMobileWebUrl('http://localhost:3000', true), 'http://localhost:3000/');
  assert.throws(() => validateMobileWebUrl('https://user:pass@example.com', true));
});
