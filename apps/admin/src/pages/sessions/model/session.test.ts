import { describe, expect, it } from 'vitest';
import {
  createSessionInputSchema,
  sessionAttendanceSummarySchema,
  sessionSchema,
  sortSessions,
} from '~/features/session-management';

const input = {
  name: '세션',
  location: {
    roadAddress: '서울특별시 중구 세종대로 110',
    detailAddress: '예시 교육장',
    latitude: 37.5665,
    longitude: 126.978,
  },
  date: '2028-02-29',
  startTime: '09:00',
  endTime: '10:00',
  type: 'offline',
};

const attendance = { present: 0, late: 0, absent: 0, pending: 0, reported: 0 };

describe('세션 입력 검증', () => {
  it('세션명의 앞뒤 공백을 제거한다', () => {
    const result = createSessionInputSchema.safeParse({ ...input, name: ' 세션 ' });

    expect(result.data?.name).toBe('세션');
  });

  it('장소의 앞뒤 공백을 제거한다', () => {
    const result = createSessionInputSchema.safeParse({
      ...input,
      location: {
        ...input.location,
        roadAddress: ' 서울특별시 중구 세종대로 110 ',
        detailAddress: ' 예시 교육장 ',
      },
    });

    expect(result.data?.location).toEqual(input.location);
  });

  it('윤년의 2월 29일을 허용한다', () => {
    const result = createSessionInputSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it('대상 직군과 출석받기 설정은 저장하지 않는다', () => {
    const result = createSessionInputSchema.safeParse({
      ...input,
      part: 'web',
      attendanceEnabled: true,
    });

    expect(result.data).toEqual(input);
  });

  it('공백만 있는 세션명을 거부한다', () => {
    const result = createSessionInputSchema.safeParse({ ...input, name: ' \n ' });

    expect(result.success).toBe(false);
  });

  it('공백만 있는 장소를 거부한다', () => {
    const result = createSessionInputSchema.safeParse({
      ...input,
      location: { ...input.location, roadAddress: ' ' },
    });

    expect(result.success).toBe(false);
  });

  it('평년의 2월 29일을 거부한다', () => {
    const result = createSessionInputSchema.safeParse({ ...input, date: '2027-02-29' });

    expect(result.success).toBe(false);
  });

  it('4월 31일을 거부한다', () => {
    const result = createSessionInputSchema.safeParse({ ...input, date: '2026-04-31' });

    expect(result.success).toBe(false);
  });

  it('13월을 거부한다', () => {
    const result = createSessionInputSchema.safeParse({ ...input, date: '2026-13-01' });

    expect(result.success).toBe(false);
  });

  it('월이 한 자리인 날짜를 거부한다', () => {
    const result = createSessionInputSchema.safeParse({ ...input, date: '2026-1-01' });

    expect(result.success).toBe(false);
  });

  it('24시를 시작 시간으로 사용할 수 없다', () => {
    const result = createSessionInputSchema.safeParse({ ...input, startTime: '24:00' });

    expect(result.success).toBe(false);
  });

  it('시가 한 자리인 시간을 거부한다', () => {
    const result = createSessionInputSchema.safeParse({ ...input, startTime: '9:00' });

    expect(result.success).toBe(false);
  });

  it('60분을 종료 시간으로 사용할 수 없다', () => {
    const result = createSessionInputSchema.safeParse({ ...input, endTime: '10:60' });

    expect(result.success).toBe(false);
  });

  it('시작과 종료 시간이 같으면 거부한다', () => {
    const result = createSessionInputSchema.safeParse({ ...input, endTime: '09:00' });

    expect(result.success).toBe(false);
  });

  it('종료 시간이 시작보다 빠르면 거부한다', () => {
    const result = createSessionInputSchema.safeParse({ ...input, endTime: '08:59' });

    expect(result.success).toBe(false);
  });

  it('자정을 넘어 다음 날 종료하는 세션을 거부한다', () => {
    const result = createSessionInputSchema.safeParse({
      ...input,
      startTime: '23:00',
      endTime: '01:00',
    });

    expect(result.success).toBe(false);
  });

  it('필터용 전체 값은 세션 유형으로 사용할 수 없다', () => {
    const result = createSessionInputSchema.safeParse({ ...input, type: 'all' });

    expect(result.success).toBe(false);
  });

  it('시간 역전 오류를 종료 시간에 연결한다', () => {
    const result = createSessionInputSchema.safeParse({ ...input, endTime: '08:00' });

    expect(result.error?.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ['endTime'] })]),
    );
  });
});

describe('출석 집계 검증', () => {
  it('음수 집계를 거부한다', () => {
    const result = sessionAttendanceSummarySchema.safeParse({ ...attendance, present: -1 });

    expect(result.success).toBe(false);
  });

  it('소수 집계를 거부한다', () => {
    const result = sessionAttendanceSummarySchema.safeParse({ ...attendance, present: 0.5 });

    expect(result.success).toBe(false);
  });

  it('NaN 집계를 거부한다', () => {
    const result = sessionAttendanceSummarySchema.safeParse({ ...attendance, present: Number.NaN });

    expect(result.success).toBe(false);
  });

  it('무한대 집계를 거부한다', () => {
    const result = sessionAttendanceSummarySchema.safeParse({ ...attendance, present: Infinity });

    expect(result.success).toBe(false);
  });
});

describe('조회 세션 검증', () => {
  it('id가 누락된 세션을 거부한다', () => {
    const result = sessionSchema.safeParse({ ...input, attendance });

    expect(result.success).toBe(false);
  });

  it('id가 빈 문자열인 세션을 거부한다', () => {
    const result = sessionSchema.safeParse({ ...input, id: '', attendance });

    expect(result.success).toBe(false);
  });

  it('출석 집계가 누락된 세션을 거부한다', () => {
    const result = sessionSchema.safeParse({ ...input, id: 'session' });

    expect(result.success).toBe(false);
  });
});

describe('세션 정렬', () => {
  const morning = sessionSchema.parse({ ...input, id: 'morning', attendance });
  const afternoon = sessionSchema.parse({
    ...input,
    id: 'afternoon',
    startTime: '14:00',
    endTime: '15:00',
    attendance,
  });
  const previousDay = sessionSchema.parse({
    ...input,
    id: 'previous-day',
    date: '2028-02-28',
    startTime: '23:00',
    endTime: '23:59',
    attendance,
  });

  it('시작 시간보다 날짜를 우선하여 최신 날짜부터 정렬한다', () => {
    const result = sortSessions([previousDay, morning]);

    expect(result).toEqual([morning, previousDay]);
  });

  it('같은 날짜에서는 시작 시간이 늦은 세션부터 정렬한다', () => {
    const result = sortSessions([morning, afternoon]);

    expect(result).toEqual([afternoon, morning]);
  });

  it('날짜와 시작 시간이 같으면 입력 순서를 유지한다', () => {
    const sameTime = { ...morning, id: 'same-time' };

    const result = sortSessions([morning, sameTime]);

    expect(result).toEqual([morning, sameTime]);
  });

  it('원본 배열의 순서를 변경하지 않는다', () => {
    const sessions = [previousDay, afternoon, morning];

    sortSessions(sessions);

    expect(sessions).toEqual([previousDay, afternoon, morning]);
  });
});

describe('유형별 장소 경계', () => {
  it('상세주소가 비어 있어도 주소와 좌표로 저장한다', () => {
    expect(
      createSessionInputSchema.safeParse({
        ...input,
        location: { ...input.location, detailAddress: '' },
      }).success,
    ).toBe(true);
  });
  it('팀 안내 공백은 빈 값으로 저장하고 오프라인 필드는 제거한다', () => {
    const result = createSessionInputSchema.parse({
      ...input,
      type: 'team',
      location: { ...input.location, guide: '  ' },
    });
    expect(result.location).toEqual({ guide: '' });
  });
  it('오프라인 장소만 가진 팀 입력을 거부한다', () => {
    expect(createSessionInputSchema.safeParse({ ...input, type: 'team' }).success).toBe(false);
  });
  it.each([undefined, '', '37.5', NaN, Infinity, -Infinity, -90.1, 90.1])(
    '잘못된 위도 %s를 거부한다',
    (latitude) => {
      expect(
        createSessionInputSchema.safeParse({ ...input, location: { ...input.location, latitude } })
          .success,
      ).toBe(false);
    },
  );
  it.each([undefined, '', '127', NaN, Infinity, -Infinity, -180.1, 180.1])(
    '잘못된 경도 %s를 거부한다',
    (longitude) => {
      expect(
        createSessionInputSchema.safeParse({ ...input, location: { ...input.location, longitude } })
          .success,
      ).toBe(false);
    },
  );
  it.each([
    [0, 0],
    [-90, -180],
    [90, 180],
  ])('좌표 경계 %s/%s를 허용한다', (latitude, longitude) => {
    expect(
      createSessionInputSchema.safeParse({
        ...input,
        location: { ...input.location, latitude, longitude },
      }).success,
    ).toBe(true);
  });
  it('저장된 세션도 시간 역전을 거부한다', () => {
    expect(
      sessionSchema.safeParse({ ...input, id: 'invalid', attendance, endTime: '08:00' }).success,
    ).toBe(false);
  });
});
