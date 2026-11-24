import { describe, expect, it } from 'vitest';
import {
  formatMemberPhoneNumber,
  memberPhoneNumberSchema,
  normalizeMemberPhoneNumber,
} from '../index';

describe('회원 전화번호', () => {
  it.each(['01000000000', '010-0000-0000', ' 010-0000-0000 '])(
    '허용된 입력 %s를 같은 비교 값과 표시 값으로 변환한다',
    (input) => {
      expect(memberPhoneNumberSchema.parse(input)).toBe('01000000000');
      expect(formatMemberPhoneNumber(input)).toBe('010-0000-0000');
    },
  );

  it.each(['1000000000', 1000000000, '', null, '010-00000000', '010 0000 0000', '010000000000'])(
    '잘못된 입력 %j를 추측해 복구하지 않는다',
    (input) => expect(memberPhoneNumberSchema.safeParse(input).success).toBe(false),
  );

  it('표시할 때도 유실된 앞자리를 복구하지 않는다', () => {
    expect(() => formatMemberPhoneNumber('1000000000')).toThrow('전화번호 형식을 확인해 주세요.');
  });

  it.each(['+821000000000', '+82-10-0000-0000', '01000000000'])(
    'API 전화번호 %s를 CSV 비교 형식으로 정규화한다',
    (input) => {
      expect(normalizeMemberPhoneNumber(input)).toBe('01000000000');
    },
  );

  it.each(['+82100000000', '821000000000', '010-000-0000'])(
    '지원하지 않는 API 전화번호 %s는 복구하지 않는다',
    (input) => {
      expect(normalizeMemberPhoneNumber(input)).toBeNull();
    },
  );
});
