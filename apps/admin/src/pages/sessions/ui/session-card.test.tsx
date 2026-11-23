import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SessionCard } from './session-card';

it('정규 세션의 장소와 초 단위 일정을 표시 형식으로 변환한다', () => {
  render(
    <SessionCard
      session={{
        id: 1,
        name: '정규 세션',
        type: 'offline',
        date: '2026-12-31',
        startTime: '09:05:10',
        endTime: '18:30:20',
        location: {
          roadAddress: '서울특별시 중구 세종대로 110',
          detailAddress: '예시 교육장',
          latitude: 37.5,
          longitude: 127,
        },
        attendance: {
          started: false,
          total: 1,
          present: 1,
          absent: 0,
          pending: 0,
          late: 0,
          reported: 0,
        },
      }}
    />,
  );
  expect(screen.getByText('서울특별시 중구 세종대로 110 예시 교육장')).toBeVisible();
  expect(screen.getByText('2026.12.31 · 09:05')).toBeVisible();
});

it('팀 세션은 장소 입력 없이 자율 장소로 표시한다', () => {
  render(
    <SessionCard
      session={{
        id: 2,
        name: '팀 세션',
        type: 'team',
        date: '2026-12-31',
        startTime: '09:00:00',
        endTime: '10:00:00',
        location: null,
        attendance: {
          started: false,
          total: 0,
          present: 0,
          absent: 0,
          pending: 0,
          late: 0,
          reported: 0,
        },
      }}
    />,
  );
  expect(screen.getByText('팀별 자율 장소')).toBeVisible();
});
