import {
  fakeCurrentWeekSessionResponse,
  fakeCurrentWeekSessionDetailResponse,
  fakeCurrentGenerationSessionsResponse,
} from '@yapp-plus/api/generated/faker';
import { createMswHandlers } from '@yapp-plus/api/generated/msw';
import { delay, HttpResponse } from 'msw';

// 생성 faker에서 서로 독립적인 날짜·시간만 실제 주간/일정 범위에 맞춥니다.
export const currentWeekFixture = {
  ...fakeCurrentWeekSessionResponse(),
  weekStartDate: '2026-11-01',
  weekEndDate: '2026-11-07',
  session: { ...fakeCurrentWeekSessionDetailResponse(), date: '2026-11-07', startTime: '13:30:00' },
};
const schedule = fakeCurrentGenerationSessionsResponse();
export const scheduleFixture = {
  ...schedule,
  sessions: schedule.sessions.map((session) => ({
    ...session,
    date: '2026-11-07',
    dayOfWeek: 'SATURDAY' as const,
    startTime: '13:30:00',
    endTime: '18:00:00',
  })),
};

export const createSessionHandlers = (baseUrl: string, scheduleState?: string | null) => {
  let failNextScheduleRequest = scheduleState === 'error';
  const { pick } = createMswHandlers({ baseUrl });
  return [
    pick.find3(() => HttpResponse.json(currentWeekFixture)),
    pick.find4(async () => {
      if (scheduleState === 'loading') {
        await delay(5_000);
      }
      if (failNextScheduleRequest) {
        failNextScheduleRequest = false;
        return HttpResponse.json(
          { code: 'CURRENT_GENERATION_NOT_FOUND', message: '개발용 조회 실패' },
          { status: 500 },
        );
      }
      return HttpResponse.json(
        scheduleState === 'empty' ? { ...scheduleFixture, sessions: [] } : scheduleFixture,
      );
    }),
  ];
};
