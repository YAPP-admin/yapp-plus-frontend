import { memberSchema, type MemberPart } from './member';
// 사용하지 않는 운영 빌드에서 합성 입력 생성까지 제거할 수 있도록 부수 효과를 격리한다.
function createMemberFixtures() {
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
  const memberPreviewAfterMapping = Object.freeze({
    ...common,
    teamMapping: 'after',
    members,
  });
  const memberPreviewBeforeMapping = Object.freeze({
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
  const memberPreviewEmpty = Object.freeze({
    ...common,
    teamMapping: 'before',
    members: Object.freeze([]),
  });

  return { memberPreviewAfterMapping, memberPreviewBeforeMapping, memberPreviewEmpty };
}

const fixtures = /* @__PURE__ */ createMemberFixtures();
export const memberPreviewAfterMapping = /* @__PURE__ */ (() =>
  fixtures.memberPreviewAfterMapping)();
export const memberPreviewBeforeMapping = /* @__PURE__ */ (() =>
  fixtures.memberPreviewBeforeMapping)();
export const memberPreviewEmpty = /* @__PURE__ */ (() => fixtures.memberPreviewEmpty)();
