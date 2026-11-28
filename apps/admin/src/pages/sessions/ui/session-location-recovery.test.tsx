/** 외부 검색·지도 장애와 수정 폼 저장 사이의 경계를 실제 컴포넌트로 검증합니다. */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import type * as KakaoMapsSdk from 'react-kakao-maps-sdk';
import { useKakaoLoader } from 'react-kakao-maps-sdk';
import { createAdminQueryClient } from '../../../query-client';
import type { SessionInput } from '../model/session-form';
import { SessionForm } from './session-form';
import { searchAddresses } from '../model/location/juso-search';
import { lookupCoordinates } from '../model/location/coordinates';

vi.mock('../model/location/juso-search', () => ({
  searchAddresses: vi.fn<typeof searchAddresses>(),
}));
vi.mock('../model/location/coordinates', () => ({
  lookupCoordinates: vi.fn<typeof lookupCoordinates>(),
}));

vi.mock('react-kakao-maps-sdk', async (importOriginal) => ({
  ...(await importOriginal<typeof KakaoMapsSdk>()),
  useKakaoLoader: vi.fn<typeof useKakaoLoader>(),
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.mocked(useKakaoLoader).mockReset();
  vi.mocked(searchAddresses).mockReset();
  vi.mocked(lookupCoordinates).mockReset();
});

it.each(['로딩', '실패'])(
  '검색 키 누락·지도 %s 중에도 복원한 유효 주소와 좌표로 저장한다',
  async (state) => {
    vi.stubEnv('SSR', false);
    vi.stubEnv('VITE_JUSO_SEARCH_KEY', '');
    vi.stubEnv('VITE_KAKAO_MAP_JS_KEY', 'test-map-key');
    vi.mocked(useKakaoLoader).mockReturnValue(
      state === '로딩' ? [true, undefined] : [false, new ErrorEvent('error')],
    );
    const initial: SessionInput = {
      name: '외부 장애 중 수정',
      startDate: '2020-01-01',
      endDate: '2020-01-01',
      startTime: '13:00',
      endTime: '17:00',
      type: 'regular',
      location: { roadAddress: '저장된 주소', detailAddress: '', latitude: 36, longitude: 128 },
    };
    const save = vi.fn<(value: SessionInput) => Promise<void>>().mockResolvedValue(undefined);
    render(
      <QueryClientProvider client={createAdminQueryClient()}>
        <SessionForm initialValues={initial} onSubmit={save} onClose={() => undefined} />
      </QueryClientProvider>,
    );
    expect(screen.getByRole('searchbox')).toBeDisabled();
    expect(screen.getByText('36.0000000')).toBeVisible();
    expect(
      screen.getByText(
        state === '로딩' ? '지도를 불러오고 있습니다.' : /지도를 불러오지 못했습니다/,
      ),
    ).toBeVisible();
    await userEvent.setup().click(screen.getByRole('button', { name: '저장' }));
    expect(save).toHaveBeenCalledExactlyOnceWith(initial);
    await userEvent.setup().click(screen.getByRole('button', { name: '장소 해제' }));
    expect(screen.queryByText('저장된 주소')).not.toBeInTheDocument();
    expect(screen.queryByText('36.0000000')).not.toBeInTheDocument();
    expect(screen.getByLabelText('상세주소 (선택)')).toHaveFocus();
  },
);

it('건물별 결과를 키보드로 선택하고 검색어를 보존하며 장소를 해제·재선택한다', async () => {
  vi.stubEnv('SSR', false);
  vi.stubEnv('VITE_JUSO_SEARCH_KEY', 'test-search-key');
  vi.stubEnv('VITE_JUSO_COORD_KEY', 'test-coordinate-key');
  vi.stubEnv('VITE_KAKAO_MAP_JS_KEY', '');
  const buildings = [
    '시립마포 실버케어센터',
    '창업허브 별관',
    '서울복지타운',
    '서울창업허브',
  ] as const;
  const roadAddress = '서울특별시 마포구 백범로31길 21 (공덕동)';
  vi.mocked(searchAddresses).mockResolvedValue({
    status: 'success',
    data: {
      items: buildings.map((buildingName, index) => ({
        roadAddress,
        buildingName,
        lookupReference: {
          administrativeAreaCode: '1',
          roadNameManagementNumber: '1',
          isUnderground: false,
          buildingMainNumber: '21',
          buildingSubNumber: '0',
          buildingManagementNumber: String(index),
        },
      })),
      page: 1,
      pageSize: 10,
      totalCount: 4,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  });
  vi.mocked(lookupCoordinates).mockResolvedValue({
    status: 'success',
    data: { latitude: 37, longitude: 127 },
  });
  render(
    <QueryClientProvider client={createAdminQueryClient()}>
      <SessionForm onSubmit={() => undefined} onClose={() => undefined} />
    </QueryClientProvider>,
  );
  const user = userEvent.setup();
  const searchbox = screen.getByRole('searchbox');
  await user.type(searchbox, '백범로31길 21');
  const resultList = await screen.findByRole('list', { name: '주소 검색 결과' });
  expect(within(resultList).getAllByRole('button')).toHaveLength(4);
  for (const name of buildings) {
    expect(
      within(resultList).getByRole('button', { name: `${name} ${roadAddress} 선택` }),
    ).toBeVisible();
  }
  await user.tab();
  await user.keyboard('{Enter}');
  await screen.findByText('37.0000000');
  expect(screen.getByRole('region', { name: '선택한 장소' })).toHaveTextContent(buildings[0]);
  expect(within(resultList).getByRole('button', { pressed: true })).toHaveTextContent(buildings[0]);
  await user.click(
    within(resultList).getByRole('button', { name: `서울창업허브 ${roadAddress} 선택` }),
  );
  await screen.findByText('37.0000000');
  expect(screen.getByRole('region', { name: '선택한 장소' })).toHaveTextContent('서울창업허브');
  expect(screen.getByLabelText('상세주소 (선택)')).toHaveValue('');
  await user.click(screen.getByRole('button', { name: '장소 해제' }));
  expect(searchbox).toHaveFocus();
  expect(searchbox).toHaveValue('백범로31길 21');
  expect(screen.queryByRole('region', { name: '선택한 장소' })).not.toBeInTheDocument();
  expect(screen.queryByText('37.0000000')).not.toBeInTheDocument();
  expect(within(resultList).queryByRole('button', { pressed: true })).not.toBeInTheDocument();
  await user.tab();
  await user.keyboard(' ');
  await screen.findByText('37.0000000');
  expect(lookupCoordinates).toHaveBeenCalledTimes(3);
});
