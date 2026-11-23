/** 좌표 Mutation의 설정 경계와 오류 전달을 검증합니다. */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { lookupCoordinates } from './coordinates';
import { coordinatesMutationOptions, lookupAddressCoordinates } from './coordinates-mutation';

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
it('조회 결과를 경위도로 반환하고 키는 Mutation key에 포함하지 않는다', async () => {
  const point = { latitude: 37.5, longitude: 127 };
  lookup.mockResolvedValueOnce({ status: 'success', data: point });
  expect(JSON.stringify(coordinatesMutationOptions.mutationKey)).not.toContain('private-test-key');
  await expect(lookupAddressCoordinates(reference)).resolves.toEqual(point);
  expect(lookup).toHaveBeenCalledWith(reference, 'private-test-key');
});
it('업무 실패를 Mutation 오류로 전달한다', async () => {
  lookup.mockResolvedValueOnce({ status: 'service-error', code: 'E0001' });
  await expect(lookupAddressCoordinates(reference)).rejects.toThrow('조회하지 못했습니다');
});
it('키 누락 시 요청하지 않는다', async () => {
  vi.stubEnv('VITE_JUSO_COORD_KEY', '');
  await expect(lookupAddressCoordinates(reference)).rejects.toThrow('설정');
  expect(lookup).not.toHaveBeenCalled();
});
