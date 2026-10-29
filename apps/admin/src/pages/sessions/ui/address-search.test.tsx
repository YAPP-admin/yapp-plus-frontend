/** 부모 폼 제출 방지와 검색·선택·요청 수명을 사용자 조작으로 검증합니다. */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useState, type ReactNode } from 'react';
import { onlineManager, QueryClientProvider } from '@tanstack/react-query';
import { searchAddresses, type AddressSearchResult } from '../model/location/juso-search';
import type { AddressSearchItemViewModel } from '../model/location/location-view-model';
import { createAdminQueryClient } from '../../../query-client';
import { AddressSearch } from './address-search';

vi.mock('../model/location/juso-search', () => ({
  searchAddresses: vi.fn<typeof searchAddresses>(),
}));
const search = vi.mocked(searchAddresses);
const address: AddressSearchItemViewModel = {
  roadAddress: '서울특별시 중구 세종대로 110',
  lookupReference: {
    administrativeAreaCode: '1114010000',
    roadNameManagementNumber: '111403100001',
    isUnderground: false,
    buildingMainNumber: '110',
    buildingSubNumber: '0',
    buildingManagementNumber: 'building-1',
  },
};
/** 페이지 이동 여부를 제어하는 화면 모델 fixture입니다. */
function result(page = 1, items = [address]): AddressSearchResult {
  return {
    status: 'success',
    data: {
      items,
      page,
      pageSize: 10,
      totalCount: items.length ? 11 : 0,
      hasPreviousPage: page > 1,
      hasNextPage: page === 1 && items.length > 0,
    },
  };
}
/** 늦게 완료되는 네트워크 응답의 순서를 직접 제어합니다. */
function deferred() {
  let resolve: ((value: AddressSearchResult) => void) | undefined;
  const promise = new Promise<AddressSearchResult>((done) => {
    resolve = done;
  });
  return { promise, resolve: (value: AddressSearchResult) => resolve?.(value) };
}
/** 실제 부모처럼 선택값을 제어하고 세션 저장 이벤트를 관찰합니다. */
function Harness({
  onSelect,
  onSubmit,
}: {
  onSelect: (item: AddressSearchItemViewModel) => void;
  onSubmit: () => void;
}) {
  const [value, setValue] = useState<AddressSearchItemViewModel | null>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <AddressSearch
        value={value}
        onSelect={(item) => {
          setValue(item);
          onSelect(item);
        }}
      />
      <button type="submit">세션 저장</button>
    </form>
  );
}
/** 각 폼 테스트의 Query 캐시를 격리합니다. */
function queryWrapper() {
  const client = createAdminQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}
/** 기본 입력 상태를 만들고 관찰용 콜백을 반환합니다. */
function setup() {
  const onSelect = vi.fn<(item: AddressSearchItemViewModel) => void>();
  const onSubmit = vi.fn<() => void>();
  const view = render(<Harness onSelect={onSelect} onSubmit={onSubmit} />, {
    wrapper: queryWrapper(),
  });
  return { user: userEvent.setup(), onSelect, onSubmit, ...view };
}
/** 검색창 입력으로 자동 조회를 실행합니다. */
function submit(keyword = '세종대로') {
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: keyword } });
}
beforeEach(() => {
  vi.stubEnv('VITE_JUSO_SEARCH_KEY', 'test-key=');
  search.mockResolvedValue(result());
});
afterEach(() => {
  onlineManager.setOnline(true);
  search.mockReset();
  vi.unstubAllEnvs();
});

it('빈 입력에서는 조회하지 않고 입력하면 자동 검색한다', async () => {
  const { onSubmit } = setup();
  expect(search).not.toHaveBeenCalled();
  submit('  세종대로  ');
  await screen.findByRole('list');
  expect(search).toHaveBeenCalledWith({ keyword: '세종대로', page: 1, approvalKey: 'test-key=' });
  fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' });
  fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter', isComposing: true });
  expect(onSubmit).not.toHaveBeenCalled();
  expect(search).toHaveBeenCalledTimes(1);
});
it('페이지 이동 후 검색어를 바꾸면 1페이지부터 조회한다', async () => {
  setup();
  submit();
  await screen.findByRole('button', { name: '다음' });
  search.mockResolvedValueOnce(result(2));
  fireEvent.click(screen.getByRole('button', { name: '다음' }));
  await waitFor(() =>
    expect(search.mock.calls[1]?.[0]).toMatchObject({ keyword: '세종대로', page: 2 }),
  );
  await screen.findByText(/2페이지/);
  submit('부산');
  await waitFor(() =>
    expect(search.mock.calls[2]?.[0]).toMatchObject({ keyword: '부산', page: 1 }),
  );
});
it('이전 검색이 늦게 완료되어도 현재 검색 결과를 덮지 않는다', async () => {
  const old = deferred();
  search.mockReturnValueOnce(old.promise);
  setup();
  submit('서울');
  await waitFor(() => expect(search).toHaveBeenCalledOnce());
  search.mockResolvedValueOnce(result(1, [{ ...address, roadAddress: '부산 중앙대로' }]));
  submit('부산');
  await screen.findByRole('button', { name: /부산 중앙대로/ });
  await act(async () => {
    old.resolve(result());
    await old.promise;
  });
  expect(screen.queryByRole('button', { name: /세종대로/ })).not.toBeInTheDocument();
});
it('같은 주소를 다시 선택해도 부모를 초기화하지 않고 입력을 지워도 선택을 유지한다', async () => {
  const { user, onSelect } = setup();
  submit();
  const option = await screen.findByRole('button', { name: /세종대로 110/ });
  await user.click(option);
  await user.click(option);
  expect(onSelect).toHaveBeenCalledTimes(1);
  submit(' ');
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
  expect(screen.getByText(address.roadAddress)).toBeInTheDocument();
  expect(search).toHaveBeenCalledTimes(1);
});
it('실패한 페이지의 결과를 숨기고 재시도 중 오류 안내를 지운다', async () => {
  const { user } = setup();
  submit();
  await user.click(await screen.findByRole('button', { name: /세종대로 110/ }));
  await screen.findByRole('button', { name: '다음' });
  search.mockRejectedValueOnce(new Error('secret-url?confmKey=secret'));
  fireEvent.click(screen.getByRole('button', { name: '다음' }));
  await screen.findByRole('alert');
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
  expect(screen.getByText(address.roadAddress)).toBeVisible();
  expect(screen.queryByText(/secret/)).not.toBeInTheDocument();
  const pending = deferred();
  search.mockReturnValueOnce(pending.promise);
  fireEvent.click(screen.getByRole('button', { name: '다시 검색' }));
  await screen.findByText('주소를 검색하고 있습니다.');
  expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByRole('button', { name: /세종대로 110/ })).toBeDisabled();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(search.mock.calls[2]?.[0]).toMatchObject({ keyword: '세종대로', page: 2 });
  await act(async () => {
    pending.resolve(result(2));
    await pending.promise;
  });
  await screen.findByRole('list');
});
it('업무 오류는 검색어 수정 안내를 제공한다', async () => {
  search.mockResolvedValueOnce({ status: 'service-error', code: 'E0006' });
  setup();
  submit();
  expect(await screen.findByRole('alert')).toHaveTextContent('구체적으로');
  expect(screen.queryByRole('button', { name: '다시 검색' })).not.toBeInTheDocument();
});
it('빈 결과를 안내한다', async () => {
  search.mockResolvedValueOnce(result(1, []));
  setup();
  submit();
  expect(await screen.findByText(/검색 결과가 없습니다/)).toBeInTheDocument();
});
it('키가 없으면 입력을 막고 부모 저장에는 영향을 주지 않는다', () => {
  vi.stubEnv('VITE_JUSO_SEARCH_KEY', '');
  setup();
  expect(screen.getByRole('searchbox')).toBeDisabled();
  expect(screen.getByRole('alert')).toHaveTextContent('설정이 준비되지');
  expect(screen.getByRole('button', { name: '세션 저장' })).toBeEnabled();
  expect(search).not.toHaveBeenCalled();
});

it.each(['검색어', '페이지'])(
  '%s 변경 중 이전 목록을 유지하고 완료 후 새 결과로 교체한다',
  async (change) => {
    const { user, onSelect } = setup();
    submit();
    await screen.findByRole('button', { name: /세종대로 110/ });
    const pending = deferred();
    search.mockReturnValueOnce(pending.promise);
    if (change === '검색어') {
      submit('부산');
    } else {
      await user.click(screen.getByRole('button', { name: '다음' }));
    }
    await screen.findByText('주소를 검색하고 있습니다.');
    const previous = screen.getByRole('button', { name: /세종대로 110/ });
    expect(previous).toBeDisabled();
    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled();
    await user.click(previous);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByText(/검색 결과 11개/)).not.toBeInTheDocument();
    await act(async () => {
      pending.resolve(
        result(change === '페이지' ? 2 : 1, [{ ...address, roadAddress: '부산 중앙대로' }]),
      );
      await pending.promise;
    });
    expect(await screen.findByRole('button', { name: /부산 중앙대로/ })).toBeEnabled();
    expect(screen.queryByRole('button', { name: /세종대로 110/ })).not.toBeInTheDocument();
    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'false');
  },
);

it('연속 입력은 마지막 입력에서 300ms 후 한 번 조회하고 비우면 조회하지 않는다', async () => {
  vi.useFakeTimers();
  try {
    setup();
    submit('세');
    await act(() => vi.advanceTimersByTimeAsync(200));
    submit('세종대로');
    await act(() => vi.advanceTimersByTimeAsync(299));
    expect(search).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(search).toHaveBeenCalledExactlyOnceWith({
      keyword: '세종대로',
      page: 1,
      approvalKey: 'test-key=',
    });
    submit('세종대로 110');
    submit('');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(search).toHaveBeenCalledOnce();
  } finally {
    vi.useRealTimers();
  }
});

it('새 검색이 오프라인 대기 중이면 이전 결과를 새 결과로 안내하지 않는다', async () => {
  setup();
  submit('세종대로');
  await screen.findByText(/“세종대로” 검색 결과/);
  act(() => onlineManager.setOnline(false));
  submit('다른 도로');
  expect(await screen.findByText('네트워크 연결을 기다리고 있습니다.')).toBeVisible();
  expect(screen.queryByText(/“다른 도로” 검색 결과/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /서울특별시 중구 세종대로 110/ })).toBeDisabled();
  expect(search).toHaveBeenCalledTimes(1);
  act(() => onlineManager.setOnline(true));
  expect(await screen.findByText(/“다른 도로” 검색 결과/)).toBeVisible();
  expect(search).toHaveBeenCalledTimes(2);
});
