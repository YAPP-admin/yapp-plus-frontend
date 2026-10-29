import { describe, expect, it } from 'vitest';
import { memberSchema } from '../index';

const activity = {
  id: 'activity-32',
  generation: 32,
  part: 'web',
  role: 'regular-member',
  status: 'inactive',
  joinedAt: '2026-01-01T00:00:00Z',
  team: null,
  attendance: { score: null, hasRecords: false },
  changes: [],
};
const input = { id: 'member-demo', name: '예시 회원', phoneNumber: '010-0000-0000' };

describe('회원 화면 입력', () => {
  it('과거 비활동과 다음 기수 운영진 활동을 분리하고 원본 입력을 보존한다', () => {
    const current = {
      ...activity,
      id: 'activity-33',
      generation: 33,
      role: 'admin',
      status: 'active',
      attendance: { score: 0, hasRecords: true },
    };
    const member = memberSchema.parse({ ...input, activities: [activity, current] });
    expect(member.activities).toEqual([activity, current]);
    expect(member.phoneNumber).toBe('01000000000');
    expect(input.phoneNumber).toBe('010-0000-0000');
  });

  it('같은 기수의 활동 중복을 정확한 행의 오류로 알린다', () => {
    const result = memberSchema.safeParse({
      ...input,
      activities: [activity, { ...activity, id: 'duplicate' }],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['activities', 1, 'generation']);
  });
});
