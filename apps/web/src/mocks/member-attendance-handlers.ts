import type { MyAttendanceScoreResponse } from '@yapp-plus/api/generated';
import { createMswHandlers } from '@yapp-plus/api/generated/msw';
import { delay, HttpResponse } from 'msw';

export const scoreFixture = {
  generationId: 28,
  totalScore: 92,
  attendanceCount: 3,
  lateCount: 1,
  absentCount: 0,
  earlyLeaveCount: 0,
} satisfies MyAttendanceScoreResponse;

export const createMemberAttendanceHandlers = (baseUrl: string, myState?: string | null) => {
  let failNextRequest = myState === 'error';
  const { pick } = createMswHandlers({ baseUrl });
  return [
    pick.mine(async () => {
      if (myState === 'loading') {
        await delay(5_000);
      }
      if (myState === 'ineligible' || myState === 'no-generation') {
        return HttpResponse.json(
          {
            code:
              myState === 'ineligible'
                ? 'ATTENDANCE_SCORE_NOT_ELIGIBLE'
                : 'CURRENT_GENERATION_NOT_FOUND',
            message: '개발용 조회 대상 없음',
          },
          { status: myState === 'ineligible' ? 403 : 404 },
        );
      }
      if (failNextRequest) {
        failNextRequest = false;
        return HttpResponse.json(
          { code: 'ATTENDANCE_UNAVAILABLE', message: '개발용 조회 실패' },
          { status: 500 },
        );
      }
      return HttpResponse.json(scoreFixture);
    }),
  ];
};
