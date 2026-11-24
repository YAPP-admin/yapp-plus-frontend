/** 팀 매핑 화면을 재현하는 환경 공통 합성 fixture를 정의한다. */
import {
  teamMappingSnapshotSchema,
  type TeamMappingMember,
  type TeamMappingPart,
  type TeamMappingSnapshot,
  type TeamMappingStatus,
  type TeamMappingTeam,
} from './team-mapping';

const GENERATION = 12;
const CONFIRMED_AT = '2026-10-17T09:00:00.000Z';

function member(
  activityId: string,
  name: string,
  part: TeamMappingPart,
  previousGenerations: readonly number[] = [],
): TeamMappingMember {
  return { activityId, name, part, previousGenerations };
}

function team(
  id: string,
  name: string,
  serviceName: string | null,
  memberActivityIds: readonly string[],
): TeamMappingTeam {
  return {
    id,
    name,
    serviceName,
    memberActivityIds,
    leaderActivityId: memberActivityIds[0] ?? null,
  };
}

const members: readonly TeamMappingMember[] = [
  member('member-01', '김민서', 'pm', [10]),
  member('member-02', '이서윤', 'design', [11]),
  member('member-03', '박지훈', 'android'),
  member('member-04', '최하늘', 'web', [9]),
  member('member-05', '정도윤', 'server'),
  member('member-06', '한유진', 'ios', [10]),
  member('member-07', '김도현', 'pm'),
  member('member-08', '장하은', 'design'),
  member('member-09', '오세훈', 'android', [11]),
  member('member-10', '윤서아', 'web'),
  member('member-11', '강민재', 'server'),
  member('member-12', '황지민', 'ios'),
  member('member-13', '전유나', 'pm', [10]),
  member('member-14', '배수빈', 'design'),
  member('member-15', '임건우', 'android'),
  member('member-16', '송지호', 'web'),
  member('member-17', '문지아', 'server'),
  member('member-18', '조은채', 'ios', [11]),
  member('member-19', '정다은', 'pm'),
  member('member-20', '이주원', 'design', [10]),
  member('member-21', '김태윤', 'ios'),
  member('member-22', '박서연', 'web'),
  member('member-23', '이현우', 'server'),
  member('member-24', '김가람', 'pm'),
  member('member-25', '서유진', 'design'),
  member('member-26', '김태윤', 'android', [11]),
  member('member-27', '신예은', 'web'),
  member('member-28', '노준혁', 'server'),
  member('member-29', '강예린', 'ios'),
  member('member-30', '권예린', 'pm', [10]),
  member('member-31', '조현우', 'design'),
  member('member-32', '남도윤', 'android'),
  member('member-33', '이채원', 'ios'),
  member('member-34', '윤지호', 'server'),
  member('member-35', '한서준', 'pm'),
  member('member-36', '김나연', 'design', [11]),
  member('member-37', '배준서', 'web'),
  member('member-38', '최준영', 'server'),
  member('member-39', '황도경', 'android'),
  member('member-40', '김하늘아주긴이름을가진회원입니다', 'pm', [10]),
  member('member-41', '고은우', 'ios'),
  member('member-42', '류다빈', 'web'),
  member('member-43', '이도윤', 'server'),
  member('member-44', '차유림', 'pm'),
  member('member-45', '정하림', 'design'),
  member('member-46', '서준호', 'android'),
  member('member-47', '김서현', 'web'),
  member('member-48', '문예린', 'server'),
  member('member-49', '유건우', 'ios'),
  member('member-50', '박다온', 'pm'),
  member('member-51', '오유진', 'design'),
  member('member-52', '신도현', 'web'),
];

const draftTeams: readonly TeamMappingTeam[] = [
  team('team-01', 'Orbit', 'YAPP Orbit', [
    'member-01',
    'member-02',
    'member-03',
    'member-04',
    'member-05',
    'member-06',
  ]),
  team('team-02', 'Pocket', 'Pocket', [
    'member-07',
    'member-08',
    'member-09',
    'member-10',
    'member-11',
    'member-12',
  ]),
  team('team-03', 'Mosaic', 'Mosaic', [
    'member-13',
    'member-14',
    'member-15',
    'member-16',
    'member-17',
    'member-18',
  ]),
  team('team-04', 'Nori', 'Nori', [
    'member-19',
    'member-20',
    'member-21',
    'member-22',
    'member-23',
    'member-29',
  ]),
  team('team-05', 'Loop', 'Loop', [
    'member-24',
    'member-25',
    'member-26',
    'member-27',
    'member-28',
    'member-33',
  ]),
  team('team-06', 'Canvas', 'Canvas', [
    'member-30',
    'member-31',
    'member-32',
    'member-34',
    'member-41',
    'member-42',
  ]),
  team('team-07', 'Beacon', 'Beacon', [
    'member-35',
    'member-36',
    'member-37',
    'member-38',
    'member-39',
  ]),
  team('team-08', '혼자서 준비하는 아주 긴 이름의 팀', null, ['member-40']),
];

const confirmedTeams: readonly TeamMappingTeam[] = [
  ...draftTeams.slice(0, 7),
  team('team-08', 'Swell', 'Swell', ['member-40', 'member-45']),
];

function snapshot(
  status: TeamMappingStatus,
  teams: readonly TeamMappingTeam[],
  confirmation: TeamMappingSnapshot['confirmation'],
): TeamMappingSnapshot {
  return teamMappingSnapshotSchema.parse({
    generation: GENERATION,
    status,
    members,
    teams,
    confirmation,
  });
}

/** 팀 빌딩 전 상태는 팀 없이 모든 후보가 미배정이다. */
export const teamMappingBeforeFixture = snapshot('before', [], null);

/** 배정 중 상태는 8팀·42명 배정·10명 미배정 사례를 담는다. */
export const teamMappingDraftFixture = snapshot('draft', draftTeams, null);

/** 확정됨 상태는 고정된 합성 확정 이력과 팀원 관계를 담는다. */
export const teamMappingConfirmedFixture = snapshot('confirmed', confirmedTeams, {
  confirmedAt: CONFIRMED_AT,
  actorName: '운영자 김관리',
});

/** 모든 환경에서 같은 preview 입력을 사용할 수 있는 읽기 전용 fixture 묶음이다. */
export const teamMappingFixtures: Readonly<Record<TeamMappingStatus, TeamMappingSnapshot>> = {
  before: teamMappingBeforeFixture,
  draft: teamMappingDraftFixture,
  confirmed: teamMappingConfirmedFixture,
};

/** URL preview에 해당하는 합성 snapshot을 반환한다. 실제 저장이나 API 요청은 하지 않는다. */
export function getTeamMappingFixture(status: TeamMappingStatus = 'before'): TeamMappingSnapshot {
  return teamMappingFixtures[status];
}
