import { fakeAdminSessionResponse } from '@yapp-plus/api/generated/faker';
import { expect, it } from 'vitest';
import { toCreateSessionRequest, toSessionInput, toSessionViewModel } from './session-api-model';

const response = {
  ...fakeAdminSessionResponse(),
  sessionId: 12,
  name: '정규 세션',
  location: '서울특별시 중구 세종대로 110 예시 교육장',
  startDate: '2026-11-20',
  endDate: '2026-11-21',
  startTime: '14:00:10',
  endTime: '14:00:30',
  type: 'REGULAR' as const,
  attendanceSummary: {
    status: 'STARTED' as const,
    totalCount: 10,
    presentCount: 7,
    absentCount: 1,
    undecidedCount: 2,
    lateCount: 1,
    reportCount: 3,
  },
  roadAddress: '서울특별시 중구 세종대로 110',
  detailAddress: '예시 교육장',
  latitude: 37.5665,
  longitude: 126.978,
};

it('조회 응답의 초 단위 시간과 출석 상태를 보존한다', () => {
  expect(toSessionViewModel(response)).toMatchObject({
    id: 12,
    startTime: '14:00:10',
    endTime: '14:00:30',
    attendance: {
      started: true,
      total: 10,
      present: 7,
      absent: 1,
      pending: 2,
      late: 1,
      reported: 3,
    },
  });
});

it('legacy 단일 날짜 응답은 동일한 시작일·종료일로 복원한다', () => {
  const { startDate: _startDate, endDate: _endDate, ...legacyResponse } = response;

  expect(toSessionViewModel({ ...legacyResponse, date: '2026-11-20' })).toMatchObject({
    startDate: '2026-11-20',
    endDate: '2026-11-20',
  });
});

it('수정 입력은 조회한 정규 장소와 초 단위 시간을 그대로 복원한다', () => {
  expect(toSessionInput(toSessionViewModel(response))).toEqual({
    name: '정규 세션',
    startDate: '2026-11-20',
    endDate: '2026-11-21',
    startTime: '14:00:10',
    endTime: '14:00:30',
    type: 'regular',
    location: {
      roadAddress: '서울특별시 중구 세종대로 110',
      detailAddress: '예시 교육장',
      latitude: 37.5665,
      longitude: 126.978,
    },
  });
});

it('정규 세션은 장소 전체를 API 요청으로 변환한다', () => {
  expect(
    toCreateSessionRequest({
      name: ' 정규 세션 ',
      startDate: '2026-11-20',
      endDate: '2026-11-21',
      startTime: '14:00',
      endTime: '15:00',
      type: 'regular',
      location: {
        roadAddress: '서울특별시 중구 세종대로 110',
        detailAddress: ' 예시 교육장 ',
        latitude: 0,
        longitude: 126.978,
      },
    }),
  ).toEqual({
    name: '정규 세션',
    location: '서울특별시 중구 세종대로 110 예시 교육장',
    startDate: '2026-11-20',
    endDate: '2026-11-21',
    startTime: '14:00',
    endTime: '15:00',
    type: 'REGULAR',
    roadAddress: '서울특별시 중구 세종대로 110',
    detailAddress: '예시 교육장',
    latitude: 0,
    longitude: 126.978,
  });
});

it('팀 세션은 장소 필드를 모두 null로 변환한다', () => {
  expect(
    toCreateSessionRequest({
      name: '팀 세션',
      startDate: '2026-11-20',
      endDate: '2026-11-21',
      startTime: '14:00',
      endTime: '15:00',
      type: 'team',
    }),
  ).toEqual({
    name: '팀 세션',
    location: null,
    startDate: '2026-11-20',
    endDate: '2026-11-21',
    startTime: '14:00',
    endTime: '15:00',
    type: 'TEAM',
    roadAddress: null,
    detailAddress: null,
    latitude: null,
    longitude: null,
  });
});

it('종료일이 다음 날이면 종료 시간이 더 빨라도 요청으로 변환한다', () => {
  expect(() =>
    toCreateSessionRequest({
      name: '야간 팀 세션',
      startDate: '2026-11-20',
      endDate: '2026-11-21',
      startTime: '23:00',
      endTime: '01:00',
      type: 'team',
    }),
  ).not.toThrow();
});
