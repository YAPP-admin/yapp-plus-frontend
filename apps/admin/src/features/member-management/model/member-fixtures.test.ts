import { describe, expect, it } from 'vitest';
import {
  memberPreviewAfterMapping,
  memberPreviewBeforeMapping,
  memberPreviewEmpty,
} from './member-fixtures';

describe('회원 화면 합성 사례', () => {
  it('매핑 전후 명단과 빈 명단을 제공하며 기존 명단을 변경하지 않는다', () => {
    expect(memberPreviewEmpty.members).toEqual([]);
    expect(memberPreviewBeforeMapping.teamMapping).toBe('before');
    expect(memberPreviewAfterMapping.teamMapping).toBe('after');
    expect(
      memberPreviewBeforeMapping.members
        .flatMap((member) => member.activities)
        .every((activity) => activity.team === null),
    ).toBe(true);
    expect(memberPreviewAfterMapping.members[0]?.activities[1]?.team?.isLeader).toBe(true);
    expect(memberPreviewBeforeMapping.members.map((member) => member.id)).toEqual(
      memberPreviewAfterMapping.members.map((member) => member.id),
    );
  });

  it('과거 기수·비활동·점수 없음과 0점 기록을 구분한다', () => {
    const first = memberPreviewAfterMapping.members[0];
    expect(first?.activities.map(({ generation, status }) => ({ generation, status }))).toEqual([
      { generation: 32, status: 'inactive' },
      { generation: 33, status: 'active' },
    ]);
    expect(first?.activities[1]?.attendance).toEqual({ score: 0, hasRecords: true });
    expect(memberPreviewAfterMapping.members[5]?.activities[0]).toMatchObject({
      status: 'inactive',
      team: null,
      attendance: { score: null, hasRecords: false },
    });
  });
});
