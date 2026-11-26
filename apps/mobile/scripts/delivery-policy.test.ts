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

// 실제 승인 구성의 공개 해시를 고정해 일반 버전 감소 허용으로 넓어지는 회귀를 막습니다.
const restoreBase: NativeSnapshot = {
  version: '1.0.9',
  fingerprint: 'a1819243df7163808e9fca08ac295f867fc1d192',
  nativeBuildDigest: '656aaf1559491a07f8920ecafda8ef5132a08fbd29ee92edacb84742324b61c4',
};
const restoreHead: NativeSnapshot = {
  version: '1.0.8',
  fingerprint: 'ca9c8ab0ccc6a233e198555d8371b3d82a6921a0',
  nativeBuildDigest: '6a9145e5aca883724482fb6fb39710e529a202fb0e665f2804b9326b0cd1238f',
};

describe('승인된 1.0.8 runtime 복구', () => {
  it('정확한 구성 복구만 허용하고 새 빌드 판정은 보수적으로 유지한다', () => {
    expect(compareNative(restoreBase, restoreHead)).toEqual({
      nativeChanged: true,
      needsBuild: true,
    });
  });
  it.each(['base', 'head'] as const)('%s의 지문·설정·버전 중 하나라도 다르면 거부한다', (side) => {
    for (const field of ['version', 'fingerprint', 'nativeBuildDigest'] as const) {
      const original = side === 'base' ? restoreBase : restoreHead;
      const changed = {
        ...original,
        [field]:
          field === 'version'
            ? { base: '1.0.10', head: '1.0.7' }[side]
            : 'f'.repeat(original[field].length),
      };
      expect(() =>
        compareNative(
          side === 'base' ? changed : restoreBase,
          side === 'head' ? changed : restoreHead,
        ),
      ).toThrow('감소');
    }
  });
});
