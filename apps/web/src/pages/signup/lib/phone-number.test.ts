import { describe, expect, it } from 'vitest';
import { formatPhoneNumber, isMobilePhoneNumber } from './phone-number';

describe('formatPhoneNumber', () => {
  it.each([
    ['010', '010'],
    ['0101234', '010-1234'],
    ['0101234567', '010-123-4567'],
    ['01012345678', '010-1234-5678'],
    ['010-1234-56789', '010-1234-5678'],
    ['010 abc 1234', '010-1234'],
  ])('%s를 %s로 표시한다', (input, expected) => {
    expect(formatPhoneNumber(input)).toBe(expected);
  });
});

describe('isMobilePhoneNumber', () => {
  it.each(['010-1234-5678', '011-123-4567', '01012345678'])(
    '%s는 휴대폰 번호 형식이다',
    (value) => {
      expect(isMobilePhoneNumber(value)).toBe(true);
    },
  );

  it.each(['', '010-1234', '02-123-4567', '012-1234-5678'])(
    '%s는 휴대폰 번호 형식이 아니다',
    (value) => {
      expect(isMobilePhoneNumber(value)).toBe(false);
    },
  );
});
