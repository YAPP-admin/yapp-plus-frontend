import { describe, expect, it } from 'vitest';
import {
  locationResultSchema,
  locationPermissionResultSchema,
  openAppSettingsResultSchema,
} from '../src';

const sample = {
  latitude: 0,
  longitude: 0,
  accuracy: 10,
  timestamp: 1_800_000_000_000,
  precision: 'precise',
};

describe('위치 브리지 수신 계약', () => {
  it.each([10, 200, null])('오차 %s를 출석 기준으로 차단하지 않고 그대로 전달한다', (accuracy) => {
    const location = { ...sample, accuracy, precision: 'approximate' };
    expect(locationResultSchema.parse({ status: 'SUCCESS', location })).toEqual({
      status: 'SUCCESS',
      location,
    });
  });

  it.each([
    { latitude: -90, longitude: -180 },
    { latitude: 90, longitude: 180 },
  ])('좌표 경계 %j를 허용한다', (coordinates) => {
    expect(
      locationResultSchema.safeParse({ status: 'SUCCESS', location: { ...sample, ...coordinates } })
        .success,
    ).toBe(true);
  });

  it.each([
    { latitude: 91 },
    { longitude: -181 },
    { latitude: NaN },
    { longitude: Infinity },
    { accuracy: -1 },
    { accuracy: Infinity },
    { accuracy: NaN },
    { timestamp: 0 },
    { timestamp: 1.5 },
    { timestamp: Number.MAX_SAFE_INTEGER + 1 },
    { precision: 'high' },
    { latitude: '0' },
    { accuracy: undefined },
  ])('잘못된 위치 필드 %j를 거부한다', (fields) => {
    expect(
      locationResultSchema.safeParse({ status: 'SUCCESS', location: { ...sample, ...fields } })
        .success,
    ).toBe(false);
  });

  it('권한 거부에는 재요청 가능 여부가 필요하다', () => {
    const result = { status: 'ERROR', code: 'PERMISSION_DENIED' };
    expect(locationResultSchema.safeParse(result).success).toBe(false);
    expect(locationResultSchema.parse({ ...result, canAskAgain: false })).toEqual({
      ...result,
      canAskAgain: false,
    });
  });

  it('위치 실패와 설정 실패의 정규화된 결과를 허용한다', () => {
    expect(locationResultSchema.parse({ status: 'ERROR', code: 'TIMEOUT' })).toEqual({
      status: 'ERROR',
      code: 'TIMEOUT',
    });
    expect(
      openAppSettingsResultSchema.parse({ status: 'ERROR', code: 'LOCATION_UNAVAILABLE' }),
    ).toEqual({ status: 'ERROR', code: 'LOCATION_UNAVAILABLE' });
    expect(openAppSettingsResultSchema.parse({ status: 'SUCCESS' })).toEqual({ status: 'SUCCESS' });
  });

  it('권한 조회 성공을 위치 허용과 구분한다', () => {
    const permission = {
      status: 'denied',
      canAskAgain: false,
      precision: 'unknown',
      servicesEnabled: false,
    };
    expect(locationPermissionResultSchema.parse({ status: 'SUCCESS', permission })).toEqual({
      status: 'SUCCESS',
      permission,
    });
    expect(
      locationPermissionResultSchema.safeParse({
        status: 'SUCCESS',
        permission: { ...permission, status: 'allowed' },
      }).success,
    ).toBe(false);
  });

  it('예상하지 않은 상태·오류·필수 결과 누락을 거부한다', () => {
    for (const result of [
      { status: 'SUCCESS' },
      { status: 'OK', location: sample },
      { status: 'ERROR', code: 'UNSUPPORTED' },
    ]) {
      expect(locationResultSchema.safeParse(result).success).toBe(false);
    }
  });

  it('오류 원문과 추가 OS 필드를 검증 결과에서 제거한다', () => {
    expect(
      locationResultSchema.parse({ status: 'ERROR', code: 'TIMEOUT', message: '원문 오류' }),
    ).toEqual({ status: 'ERROR', code: 'TIMEOUT' });
    expect(
      locationResultSchema.parse({ status: 'SUCCESS', location: { ...sample, altitude: 100 } }),
    ).toEqual({ status: 'SUCCESS', location: sample });
  });
});
