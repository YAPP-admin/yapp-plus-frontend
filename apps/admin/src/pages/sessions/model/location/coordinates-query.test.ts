/** 좌표 Query의 설정 경계와 오류 전달을 검증합니다. */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createAdminQueryClient } from '../../../../query-client';
import { lookupCoordinates } from './coordinates';
import { coordinatesQueryOptions } from './coordinates-query';

vi.mock('./coordinates', () => ({ lookupCoordinates: vi.fn<typeof lookupCoordinates>() }));
const lookup = vi.mocked(lookupCoordinates);
const reference = {
  administrativeAreaCode: '1114010000',
  roadNameManagementNumber: '111403100001',
  isUnderground: false,
  buildingMainNumber: '110',
  buildingSubNumber: '0',
  buildingManagementNumber: '1',
};
beforeEach(() => {
  vi.stubEnv('SSR', false);
  vi.stubEnv('VITE_JUSO_COORD_KEY', 'private-test-key');
});
afterEach(() => {
  lookup.mockReset();
  vi.unstubAllEnvs();
});
it('조회 결과를 경위도로 반환하고 키는 Query key에 포함하지 않는다', async () => {
  const point = { latitude: 37.5, longitude: 127 };
  lookup.mockResolvedValueOnce({ status: 'success', data: point });
  const options = coordinatesQueryOptions(reference);
  expect(JSON.stringify(options.queryKey)).not.toContain('private-test-key');
  await expect(createAdminQueryClient().fetchQuery(options)).resolves.toEqual(point);
  expect(lookup).toHaveBeenCalledWith(reference, 'private-test-key');
});
it('업무 실패를 Query 오류로 전달한다', async () => {
  lookup.mockResolvedValueOnce({ status: 'service-error', code: 'E0001' });
  await expect(
    createAdminQueryClient().fetchQuery(coordinatesQueryOptions(reference)),
  ).rejects.toThrow('조회하지 못했습니다');
});
it('키 누락 시 요청하지 않는다', async () => {
  vi.stubEnv('VITE_JUSO_COORD_KEY', '');
  await expect(
    createAdminQueryClient().fetchQuery(coordinatesQueryOptions(reference)),
  ).rejects.toThrow('설정');
  expect(lookup).not.toHaveBeenCalled();
});
