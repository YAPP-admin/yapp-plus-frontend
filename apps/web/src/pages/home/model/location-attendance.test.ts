/** 출석 위치 판정의 경계와 실패 정규화를 검증합니다. */
import { describe, expect, it } from 'vitest';
import { assessAttendanceLocation, isAttendanceDistanceAllowed } from './location-attendance';

const sessionLocation = { latitude: 0, longitude: 0 };
const currentLocation = {
  latitude: 0.000904369,
  longitude: 0,
  accuracy: 50,
  precision: 'precise' as const,
};

describe('출석 위치 판정', () => {
  it('정확한 권한, 오차 50m, 거리 100m 이내면 허용한다', () => {
    expect(assessAttendanceLocation(currentLocation, sessionLocation)).toEqual({
      status: 'ALLOWED',
    });
  });

  it('0인 좌표와 오차를 유효하게 처리한다', () => {
    expect(
      assessAttendanceLocation({ ...currentLocation, latitude: 0, accuracy: 0 }, sessionLocation),
    ).toEqual({ status: 'ALLOWED' });
  });

  it.each(['approximate', 'unknown'] as const)('%s 정밀 권한은 차단한다', (precision) => {
    expect(assessAttendanceLocation({ ...currentLocation, precision }, sessionLocation)).toEqual({
      status: 'BLOCKED',
      reason: 'PRECISE_LOCATION_REQUIRED',
    });
  });

  it('오차를 확인할 수 없으면 차단한다', () => {
    expect(
      assessAttendanceLocation({ ...currentLocation, accuracy: null }, sessionLocation),
    ).toEqual({ status: 'BLOCKED', reason: 'LOCATION_ACCURACY_UNAVAILABLE' });
  });

  it('50m를 초과한 오차는 차단한다', () => {
    expect(
      assessAttendanceLocation({ ...currentLocation, accuracy: 50.01 }, sessionLocation),
    ).toEqual({ status: 'BLOCKED', reason: 'LOCATION_ACCURACY_TOO_LOW' });
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1])(
    '잘못된 오차 %s가 포함된 위치 표본은 판정할 수 없다',
    (accuracy) => {
      expect(assessAttendanceLocation({ ...currentLocation, accuracy }, sessionLocation)).toEqual({
        status: 'UNAVAILABLE',
        reason: 'INVALID_CURRENT_LOCATION',
      });
    },
  );

  it('100m를 조금이라도 초과하면 반올림 없이 차단한다', () => {
    expect(
      assessAttendanceLocation({ ...currentLocation, latitude: 0.00090437 }, sessionLocation),
    ).toEqual({ status: 'BLOCKED', reason: 'OUT_OF_RANGE' });
  });

  it.each([
    { latitude: null, longitude: 0 },
    { latitude: 0, longitude: null },
    { latitude: 91, longitude: 0 },
    { latitude: 0, longitude: 181 },
    { latitude: Number.NaN, longitude: 0 },
    { latitude: 0, longitude: Number.POSITIVE_INFINITY },
  ])('잘못된 세션 좌표 $latitude, $longitude는 판정할 수 없다', (invalidSessionLocation) => {
    expect(assessAttendanceLocation(currentLocation, invalidSessionLocation)).toEqual({
      status: 'UNAVAILABLE',
      reason: 'INVALID_SESSION_LOCATION',
    });
  });

  it.each([
    { latitude: 91, longitude: 0 },
    { latitude: 0, longitude: 181 },
    { latitude: Number.NaN, longitude: 0 },
    { latitude: 0, longitude: Number.POSITIVE_INFINITY },
  ])('잘못된 현재 좌표 $latitude, $longitude는 판정할 수 없다', (invalidCurrentLocation) => {
    expect(
      assessAttendanceLocation({ ...currentLocation, ...invalidCurrentLocation }, sessionLocation),
    ).toEqual({ status: 'UNAVAILABLE', reason: 'INVALID_CURRENT_LOCATION' });
  });

  it('타원체 거리 계산이 수렴하지 않으면 판정할 수 없다', () => {
    expect(
      assessAttendanceLocation(
        { ...currentLocation, latitude: 0, longitude: 180 },
        sessionLocation,
      ),
    ).toEqual({ status: 'UNAVAILABLE', reason: 'DISTANCE_UNAVAILABLE' });
  });
});

describe('거리 경계', () => {
  it.each([
    [0, true],
    [100, true],
    [100.000001, false],
    [-1, false],
    [Number.NaN, false],
    [Number.POSITIVE_INFINITY, false],
  ])('%s 미터의 허용 여부는 %s다', (distance, allowed) => {
    expect(isAttendanceDistanceAllowed(distance)).toBe(allowed);
  });
});
