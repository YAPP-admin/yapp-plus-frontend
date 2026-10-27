/** 외부 검색·지도 장애와 수정 폼 저장 사이의 경계를 실제 컴포넌트로 검증합니다. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import type * as KakaoMapsSdk from 'react-kakao-maps-sdk';
import { useKakaoLoader } from 'react-kakao-maps-sdk';
import { createAdminQueryClient } from '../../../query-client';
import type { CreateSessionInput } from '../model/session';
import { SessionForm } from './session-form';

vi.mock('react-kakao-maps-sdk', async (importOriginal) => ({
  ...(await importOriginal<typeof KakaoMapsSdk>()),
  useKakaoLoader: vi.fn<typeof useKakaoLoader>(),
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.mocked(useKakaoLoader).mockReset();
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
    const initial: CreateSessionInput = {
      name: '외부 장애 중 수정',
      date: '2020-01-01',
      startTime: '13:00',
      endTime: '17:00',
      type: 'offline',
      location: { roadAddress: '저장된 주소', detailAddress: '', latitude: 36, longitude: 128 },
    };
    const save = vi.fn<(value: CreateSessionInput) => Promise<void>>().mockResolvedValue(undefined);
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
  },
);
