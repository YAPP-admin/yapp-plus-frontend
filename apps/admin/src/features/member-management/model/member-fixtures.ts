import { memberSchema, type MemberPart } from './member';

// 실제 회원 정보를 사용하지 않는 고정 합성 입력이다.
const parts: readonly MemberPart[] = ['pm', 'design', 'android', 'ios', 'web', 'server'];
const members = memberSchema
  .array()
  .readonly()
  .parse(
    parts.map((part, index) => ({
      id: `preview-member-${index + 1}`,
      name: `예시 회원 ${index + 1}`,
      phoneNumber: `0100000000${index + 1}`,
      activities: [
        ...(index === 0
          ? [
              {
                id: 'preview-activity-32-1',
                generation: 32,
                part,
                role: 'regular-member',
                status: 'inactive',
                joinedAt: '2026-01-01T00:00:00Z',
                team: null,
                attendance: { score: 80, hasRecords: true },
                changes: [],
              },
            ]
          : []),
        {
          id: `preview-activity-33-${index + 1}`,
          generation: 33,
          part,
          role: [
            'admin',
            'active-member',
            'active-member',
            'active-member',
            'active-member',
            'regular-member',
          ][index],
          status: index === 5 ? 'inactive' : 'active',
          joinedAt: '2026-09-01T00:00:00Z',
          team:
            index === 5
              ? null
              : {
                  id: `preview-team-${index < 3 ? 1 : 2}`,
                  name: index < 3 ? '예시 1팀' : '예시 2팀',
                  isLeader: index === 0 || index === 3,
                },
          attendance: { score: index === 5 ? null : index * 10, hasRecords: index !== 5 },
          changes:
            index === 0
              ? [
                  {
                    occurredAt: '2026-09-02T00:00:00Z',
                    actorName: '예시 운영자',
                    field: 'role',
                    previousValue: 'active-member',
                    nextValue: 'admin',
                  },
                ]
              : [],
        },
      ],
    })),
  );

const common = { currentGeneration: 33, generations: Object.freeze([32, 33]) };
export const memberPreviewAfterMapping = Object.freeze({
  ...common,
  teamMapping: 'after',
  members,
});
export const memberPreviewBeforeMapping = Object.freeze({
  ...common,
  teamMapping: 'before',
  members: memberSchema
    .array()
    .readonly()
    .parse(
      members.map((member) => ({
        ...member,
        activities: member.activities.map((activity) => ({ ...activity, team: null })),
      })),
    ),
});
export const memberPreviewEmpty = Object.freeze({
  ...common,
  teamMapping: 'before',
  members: Object.freeze([]),
});
