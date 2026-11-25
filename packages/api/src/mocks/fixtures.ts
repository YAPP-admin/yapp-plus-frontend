import type {
  AdminGenerationListResponse,
  AdminMemberDetailResponse,
  AdminMemberListResponse,
  AdminMemberTeamOptionResponse,
  AdminPostDetailResponse,
  AdminPostListResponse,
  AdminPostRecipientListResponse,
  CurrentWeekSessionResponse,
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
