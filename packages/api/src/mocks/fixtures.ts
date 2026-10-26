import type {
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

export const sessions = {
  totalCount: 2,
  allCount: 2,
  regularCount: 1,
  teamCount: 1,
  sessions: [
    {
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
      },
    },
    {
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
      },
    },
  ],
} satisfies SessionListResponse;

export const currentWeek = {
  weekStartDate: '2026-10-25',
  weekEndDate: '2026-10-31',
  session: {
    sessionId: 101,
    name: '정규 세션',
    date: '2026-10-31',
    startTime: '14:00:00',
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
