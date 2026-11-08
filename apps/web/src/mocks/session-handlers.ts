import { createSessionFixtures } from './session-fixtures';
import { createMswHandlers } from '@yapp-plus/api/generated/msw';
import { delay, HttpResponse } from 'msw';

// 기존 화면 테스트는 고정된 주간을 사용하고 브라우저는 시작 시각으로 생성한다.
export const { currentWeekFixture, scheduleFixture } = createSessionFixtures(
  Date.parse('2026-11-07T12:00:00+09:00'),
);

export const createSessionHandlers = (
  baseUrl: string,
  scheduleState?: string | null,
  fixtures = createSessionFixtures(Date.now()),
) => {
  const { currentWeekFixture: currentWeek, scheduleFixture: schedule } = fixtures;
  let failNextScheduleRequest = scheduleState === 'error';
  const { pick } = createMswHandlers({ baseUrl });
  return [
    pick.verify(() => HttpResponse.json({ verified: true, checkedInAt: new Date().toISOString() })),
    pick.find3(() => HttpResponse.json(currentWeek)),
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
        scheduleState === 'empty' ? { ...schedule, sessions: [] } : schedule,
      );
    }),
  ];
};
