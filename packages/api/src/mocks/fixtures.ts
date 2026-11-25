import type {
  AdminGenerationListResponse,
  AdminMemberDetailResponse,
  AdminMemberListResponse,
  AdminMemberTeamOptionResponse,
  AdminPostDetailResponse,
  AdminPostListResponse,
  AdminPostRecipientListResponse,
  CurrentWeekSessionResponse,
  TeamMemberCandidateResponse,
  TeamResponse,
  SessionListResponse,
  StaffLoginResponse,
} from '../generated/types.gen';

// 실제 인증 정보나 회원 데이터가 아닌 개발 전용 합성 데이터입니다.
export const staffLogin = {
  staff: { id: 1, displayName: '개발 운영진' },
  accessToken: 'mock-staff-access-token',
} satisfies StaffLoginResponse;

export const adminGenerations = {
  generations: [
    { generationId: 33, generationNumber: 33, generationName: '33기' },
    { generationId: 32, generationNumber: 32, generationName: '32기' },
  ],
} satisfies AdminGenerationListResponse;

export const adminMembers = {
  items: [
    {
      memberId: 101,
      membershipId: 1001,
      name: '개발 회원 A',
      position: 'WEB',
      status: 'PLAYER',
      previousActivities: [{ generationNumber: 32, status: 'PLAYER', position: 'WEB' }],
      attendanceScore: 92,
      signedUpDate: '2026-09-01T00:00:00Z',
      teamName: 'Orbit',
    },
    {
      memberId: 102,
      membershipId: 1002,
      name: '개발 회원 B',
      position: 'DESIGN',
      status: 'PLAYER',
      previousActivities: [],
      attendanceScore: null,
      signedUpDate: '2026-09-02T00:00:00Z',
      teamName: null,
    },
    {
      memberId: 103,
      membershipId: 1003,
      name: '개발 회원 C',
      position: 'ANDROID',
      status: 'DEFERRED',
      previousActivities: [{ generationNumber: 31, status: 'COMPLETED_MEMBER', position: 'IOS' }],
      attendanceScore: 80,
      signedUpDate: '2026-09-03T00:00:00Z',
      teamName: 'Nova',
    },
  ],
  nextCursor: null,
} satisfies AdminMemberListResponse;

export const adminMemberTeams = [
  { teamId: 201, name: 'Orbit', playerMemberCount: 1 },
  { teamId: 202, name: 'Nova', playerMemberCount: 1 },
] satisfies AdminMemberTeamOptionResponse[];

const firstAdminMember = adminMembers.items[0];
if (firstAdminMember === undefined) {
  throw new Error('관리자 회원 모의 응답이 비어 있습니다.');
}

export const adminMemberDetail = {
  ...firstAdminMember,
  generationId: 33,
  phoneNumber: '010-1234-5678',
  revision: 1,
  changes: [
    {
      field: 'position',
      before: 'DESIGN',
      after: 'WEB',
      changedByStaffId: 7,
      changedAt: '2026-09-05T09:00:00Z',
    },
    {
      field: 'status',
      before: 'DEFERRED',
      after: 'PLAYER',
      changedByStaffId: 7,
      changedAt: '2026-09-06T09:30:00Z',
    },
  ],
} satisfies AdminMemberDetailResponse;

const teamDefinitions = [
  { teamId: 201, name: 'Orbit', serviceName: 'YAPP Orbit', membershipIds: [1, 2, 3, 4, 5, 6] },
  { teamId: 202, name: 'Pocket', serviceName: 'Pocket', membershipIds: [7, 8, 9, 10, 11, 12] },
  { teamId: 203, name: 'Mosaic', serviceName: 'Mosaic', membershipIds: [13, 14, 15, 16, 17, 18] },
  { teamId: 204, name: 'Nori', serviceName: 'Nori', membershipIds: [19, 20, 21, 22, 23, 29] },
  { teamId: 205, name: 'Loop', serviceName: 'Loop', membershipIds: [24, 25, 26, 27, 28, 33] },
  { teamId: 206, name: 'Canvas', serviceName: 'Canvas', membershipIds: [30, 31, 32, 34, 41, 42] },
  { teamId: 207, name: 'Beacon', serviceName: 'Beacon', membershipIds: [35, 36, 37, 38, 39] },
  {
    teamId: 208,
    name: '혼자서 준비하는 아주 긴 이름의 팀',
    serviceName: null,
    membershipIds: [40],
  },
] as const;

const candidateNames = [
  '김민서',
  '이서윤',
  '박지훈',
  '최하늘',
  '정도윤',
  '한유진',
  '김도현',
  '장하은',
  '오세훈',
  '윤서아',
  '강민재',
  '황지민',
  '전유나',
  '배수빈',
  '임건우',
  '송지호',
  '문지아',
  '조은채',
  '정다은',
  '이주원',
  '김태윤',
  '박서연',
  '이현우',
  '김가람',
  '서유진',
  '김태윤',
  '신예은',
  '노준혁',
  '강예린',
  '권예린',
  '조현우',
  '남도윤',
  '이채원',
  '윤지호',
  '한서준',
  '김나연',
  '배준서',
  '최준영',
  '황도경',
  '김하늘아주긴이름을가진회원입니다',
  '고은우',
  '류다빈',
  '이도윤',
  '차유림',
  '정하림',
  '서준호',
  '김서현',
  '문예린',
  '유건우',
  '박다온',
  '오유진',
  '신도현',
] as const;

const candidatePositions = ['PM', 'DESIGN', 'ANDROID', 'WEB', 'SERVER', 'IOS'] as const;

const teamIdByMembershipId = new Map<number, number>(
  teamDefinitions.flatMap((team) =>
    team.membershipIds.map((membershipId) => [membershipId, team.teamId]),
  ),
);

export const adminTeamMemberCandidates = candidateNames.map((name, index) => {
  const membershipId = index + 1;
  const teamId = teamIdByMembershipId.get(membershipId) ?? null;
  const position = candidatePositions[index % candidatePositions.length] ?? 'WEB';
  const team = teamDefinitions.find((candidate) => candidate.teamId === teamId);
  return {
    membershipId,
    name,
    position,
    assigned: teamId !== null,
    currentTeam: team === undefined || teamId === null ? null : { teamId, name: team.name },
  } satisfies TeamMemberCandidateResponse;
});

export const adminTeams = teamDefinitions.map((team) => ({
  teamId: team.teamId,
  name: team.name,
  serviceName: team.serviceName,
  totalMemberCount: team.membershipIds.length,
  version: 1,
  members: team.membershipIds.flatMap((membershipId) => {
    const candidate = adminTeamMemberCandidates[membershipId - 1];
    return candidate === undefined
      ? []
      : [{ membershipId, name: candidate.name, position: candidate.position }];
  }),
})) satisfies TeamResponse[];

export const sessions = {
  totalCount: 2,
  allCount: 2,
  regularCount: 1,
  teamCount: 1,
  sessions: [
    {
      roadAddress: '서울특별시 중구 세종대로 110',
      latitude: 37.5665,
      longitude: 126.978,
      detailAddress: '개발용 교육장',
      sessionId: 101,
      name: '정규 세션',
      location: '개발용 교육장',
      date: '2026-10-31',
      startTime: '14:00:00',
      endTime: '18:00:00',
      type: 'REGULAR',
      attendanceSummary: {
        status: 'STARTED',
        totalCount: 3,
        presentCount: 1,
        absentCount: 1,
        undecidedCount: 1,
        lateCount: 0,
        reportCount: 0,
      },
    },
    {
      roadAddress: null,
      latitude: null,
      longitude: null,
      detailAddress: null,
      sessionId: 102,
      name: '팀 세션',
      location: null,
      date: '2026-11-07',
      startTime: '14:00:00',
      endTime: '18:00:00',
      type: 'TEAM',
      attendanceSummary: {
        status: 'NOT_STARTED',
        totalCount: 3,
        presentCount: 0,
        absentCount: 0,
        undecidedCount: 3,
        lateCount: 0,
        reportCount: 0,
      },
    },
  ],
} satisfies SessionListResponse;

export const currentWeek = {
  weekStartDate: '2026-10-25',
  weekEndDate: '2026-10-31',
  session: {
    roadAddress: null,
    latitude: null,
    longitude: null,
    detailAddress: null,
    sessionId: 101,
    name: '정규 세션',
    date: '2026-10-31',
    startTime: '14:00:00',
    endTime: '18:00:00',
    type: 'REGULAR',
    location: '개발용 교육장',
    attendanceStatus: 'AVAILABLE',
  },
} satisfies CurrentWeekSessionResponse;

export const postRecipients = {
  asOf: '2026-10-26T02:00:00Z',
  recipientCount: 2,
  readCount: 1,
  items: [
    {
      userId: 11,
      name: '개발 회원 A',
      generationNumber: 30,
      position: 'WEB',
      read: true,
      readAt: '2026-10-26T01:00:00Z',
    },
    {
      userId: 12,
      name: '개발 회원 B',
      generationNumber: null,
      position: null,
      read: false,
      readAt: null,
    },
  ],
  nextCursor: null,
} satisfies AdminPostRecipientListResponse;

export const adminPosts = {
  totalPostCount: 3,
  nextCursor: null,
  items: [
    {
      postId: 101,
      title: '세션 안내',
      publishedAt: '2026-10-20T00:00:00Z',
      type: 'SESSION',
      audience: { type: 'GROUP', target: 'ALL_USERS', positions: [] },
      recipientCount: 4,
      readCount: 1,
      deadlineDate: null,
      daysUntilDeadline: null,
    },
    {
      postId: 102,
      title: '제출 안내',
      publishedAt: '2026-10-21T00:00:00Z',
      type: 'ASSIGNMENT',
      audience: { type: 'GROUP', target: 'PLAYER', positions: [] },
      recipientCount: 4,
      readCount: 2,
      deadlineDate: '2026-11-01',
      daysUntilDeadline: 7,
    },
    {
      postId: 103,
      title: '운영 안내',
      publishedAt: '2026-10-22T00:00:00Z',
      type: 'OPERATION',
      audience: { type: 'GROUP', target: 'COMPLETED_MEMBER', positions: [] },
      recipientCount: 2,
      readCount: 0,
      deadlineDate: null,
      daysUntilDeadline: null,
    },
  ],
} satisfies AdminPostListResponse;

export const adminPostDetails: Record<number, AdminPostDetailResponse> = {
  101: {
    postId: 101,
    title: '세션 안내',
    contentMarkdown: '이번 세션 안내입니다.',
    type: 'SESSION',
    audience: { type: 'GROUP', target: 'ALL_USERS', positions: [] },
    createdAt: '2026-10-20T00:00:00Z',
    publishedAt: '2026-10-20T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
    recipientCount: 2,
    readCount: 1,
    assignment: null,
    images: [],
  },
  102: {
    postId: 102,
    title: '제출 안내',
    contentMarkdown: '제출 방법을 안내합니다.',
    type: 'ASSIGNMENT',
    audience: { type: 'GROUP', target: 'PLAYER', positions: [] },
    createdAt: '2026-10-21T00:00:00Z',
    publishedAt: '2026-10-21T00:00:00Z',
    updatedAt: '2026-10-21T00:00:00Z',
    recipientCount: 2,
    readCount: 1,
    assignment: {
      deadlineDate: '2026-11-01',
      daysUntilDeadline: 7,
      submissionUrl: 'https://example.com/submit',
      submissionLinkText: '제출 방법',
    },
    images: [],
  },
  103: {
    postId: 103,
    title: '운영 안내',
    contentMarkdown: '운영 관련 안내입니다.',
    type: 'OPERATION',
    audience: { type: 'GROUP', target: 'COMPLETED_MEMBER', positions: [] },
    createdAt: '2026-10-22T00:00:00Z',
    publishedAt: '2026-10-22T00:00:00Z',
    updatedAt: '2026-10-22T00:00:00Z',
    recipientCount: 2,
    readCount: 0,
    assignment: null,
    images: [],
  },
};

export const emptySessions = {
  totalCount: 0,
  allCount: 0,
  regularCount: 0,
  teamCount: 0,
  sessions: [],
} satisfies SessionListResponse;
export const emptyWeek = { ...currentWeek, session: null } satisfies CurrentWeekSessionResponse;
export const emptyRecipients = {
  ...postRecipients,
  recipientCount: 0,
  readCount: 0,
  items: [],
} satisfies AdminPostRecipientListResponse;
