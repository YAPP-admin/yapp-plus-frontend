import { describe, expect, it } from 'vitest';
import { compareNative, type NativeSnapshot } from './delivery-policy';

const base: NativeSnapshot = {
  version: '1.0.9',
  fingerprint: 'a'.repeat(40),
  nativeBuildDigest: 'b'.repeat(64),
};

describe('모바일 네이티브 버전 규칙', () => {
  it('호환 JS 변경은 빌드를 요구하지 않는다', () => {
    expect(compareNative(base, { ...base })).toEqual({ nativeChanged: false, needsBuild: false });
  });
  it.each(['fingerprint', 'nativeBuildDigest'] as const)(
    '%s 변경에는 버전 증가를 요구한다',
    (field) => {
      const head = { ...base, [field]: 'c'.repeat(base[field].length) };
      expect(() => compareNative(base, head)).toThrow('앱 버전을 증가');
      expect(compareNative(base, { ...head, version: '1.0.10' }).needsBuild).toBe(true);
    },
  );
  it('JS만 바뀌어도 runtime이 증가하면 새 빌드가 필요하다', () => {
    expect(compareNative(base, { ...base, version: '1.1.0' }).needsBuild).toBe(true);
  });
  it.each(['1.0.8', '0.9.99'])('버전 감소 %s를 거부한다', (version) => {
    expect(() => compareNative(base, { ...base, version })).toThrow('감소');
  });
  it.each(['1.0', '01.0.9', '1.0.9-beta', '1.0.9007199254740992'])(
    '잘못된 버전 %s를 거부한다',
    (version) => {
      expect(() => compareNative(base, { ...base, version })).toThrow('버전');
    },
  );
  it('빈 지문을 호환으로 해석하지 않는다', () => {
    expect(() => compareNative(base, { ...base, fingerprint: '' })).toThrow('불완전');
  });
});
