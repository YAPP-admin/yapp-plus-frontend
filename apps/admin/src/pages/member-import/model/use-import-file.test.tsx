import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it } from 'vitest';
import type { PropsWithChildren } from 'react';
import { memberImportHeaders } from './import-file';
import { useImportFile } from './use-import-file';

const csv = (name: string, memberName: string) =>
  new File(
    [`${memberImportHeaders.join(',')}\n${memberName},01012345678,33,pm,active-member`],
    name,
    { type: 'text/csv' },
  );

function wrapper({ children }: PropsWithChildren) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

it('파일 선택을 mutation으로 읽고 성공 결과를 화면 수명 안에 반환한다', async () => {
  const { result } = renderHook(() => useImportFile(), { wrapper });

  act(() => result.current.selectFile(csv('members.csv', '홍길동')));

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.rows[0]?.values[0]).toBe('홍길동');
  expect(result.current.data?.fileName).toBe('members.csv');
});

it('파일을 교체하면 이전 결과를 초기화하고 최신 파일만 표시한다', async () => {
  const { result } = renderHook(() => useImportFile(), { wrapper });

  act(() => result.current.selectFile(csv('first.csv', '첫 번째')));
  await waitFor(() => expect(result.current.data?.rows[0]?.values[0]).toBe('첫 번째'));

  act(() => result.current.selectFile(csv('second.csv', '두 번째')));

  await waitFor(() => expect(result.current.data?.rows[0]?.values[0]).toBe('두 번째'));
  expect(result.current.data?.fileName).toBe('second.csv');
});

it('다시 올리기와 화면 이탈에서 mutation 상태를 초기화한다', async () => {
  const { result, unmount } = renderHook(() => useImportFile(), { wrapper });

  act(() => result.current.selectFile(csv('members.csv', '홍길동')));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  act(() => result.current.reset());
  await waitFor(() => {
    expect(result.current.data).toBeNull();
    expect(result.current.isError).toBe(false);
  });

  unmount();
});
