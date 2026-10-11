import { describe, expect, it } from 'vitest';
import {
  memberPartSchema,
  memberRoleSchema,
  memberSearchDefaults,
  memberSearchSchema,
  memberStatusSchema,
  memberTabSchema,
} from './member-search';

describe('회원 쿼리 검증', () => {
  it('누락 필드와 미정의 필드를 기본 상태로 처리한다', () => {
    expect(memberSearchSchema.parse({ page: 3 })).toEqual(memberSearchDefaults);
  });
  it.each([
    ['tab', memberTabSchema.options],
    ['part', memberPartSchema.options],
    ['role', memberRoleSchema.options],
    ['status', memberStatusSchema.options],
  ])('%s의 허용값을 유지한다', (field, values) => {
    for (const value of values) {
      expect(memberSearchSchema.parse({ [field]: value })).toEqual({
        ...memberSearchDefaults,
        [field]: value,
      });
    }
  });
  it.each([null, true, 123, ['web'], { q: '김' }])(
    '잘못된 외부 타입 %j를 기본값으로 처리한다',
    (value) => {
      expect(
        memberSearchSchema.parse({ tab: value, q: value, part: value, role: value, status: value }),
      ).toEqual(memberSearchDefaults);
    },
  );
  it('잘못된 필드만 초기화하고 이름 검색 문자열은 그대로 유지한다', () => {
    expect(
      memberSearchSchema.parse({
        tab: 'unknown',
        part: 'common',
        role: 'admin',
        status: 'unknown',
        q: '김 민수 & 123',
      }),
    ).toEqual({ ...memberSearchDefaults, role: 'admin', q: '김 민수 & 123' });
  });
});
