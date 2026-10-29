import { describe, expect, it } from 'vitest';
import { formatMemberPhoneNumber, memberPhoneNumberSchema } from '../index';

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
});
