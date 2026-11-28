/** 실제 생성 Query를 MSW에 연결해 목록 cursor·필터와 상세 응답·실패를 확인합니다. */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { fakeAppAfterpartyListItemResponse } from '@yapp-plus/api/generated/faker';
import { apiBaseUrl, server } from '@/mocks/server';
import { DiningDetailPage } from './dining-detail-page';
import { DiningListPage } from './dining-list-page';

const goBack = vi.hoisted(() => vi.fn<() => void>());
vi.mock('@/app/navigation/back-button', () => ({
  BackButton: () => <button onClick={goBack}>뒤로가기</button>,
}));
vi.mock('@/app/navigation/activity-link', () => ({
  ActivityLink: ({
    children,
    activityParams,
  }: {
    children: React.ReactNode;
    activityParams: { diningId: string };
  }) => <a href={`/dining/${activityParams.diningId}`}>{children}</a>,
}));
const item = {
  ...fakeAppAfterpartyListItemResponse(),
  startsAtDisplay: undefined,
  afterpartyId: 42,
  title: '서버 회식',
  startsAt: '2026-12-01T11:00:00Z',
  deadline: '2026-11-30T12:00:00Z',
  respondedCount: 7,
  state: 'OPEN',
};
function mount(page: React.ReactNode) {
  vi.stubEnv('VITE_API_MOCKING', 'true');
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {page}
    </QueryClientProvider>,
  );
}
afterEach(() => {
  vi.unstubAllEnvs();
  goBack.mockClear();
});

it('서버의 상세 응답과 실제 시각을 표시하며 차수별 응답을 추정하지 않는다', async () => {
  server.use(
    http.get(`${apiBaseUrl}/api/afterparties/42`, () =>
      HttpResponse.json({ ...item, content: '안내', response: 'ATTENDING', attendingCount: 7 }),
    ),
  );
  mount(<DiningDetailPage diningId="42" />);
  expect(await screen.findByRole('heading', { name: '서버 회식' })).toBeVisible();
  expect(screen.getByText('2026.12.01 (화) 20:00')).toBeVisible();
  expect(screen.getByText('참석 7명')).toBeVisible();
  expect(screen.queryByText('1차')).not.toBeInTheDocument();
});

it('조회 실패 시 재시도로 상세 정보를 복구한다', async () => {
  server.use(
    http.get(`${apiBaseUrl}/api/afterparties/42`, () => new HttpResponse(null, { status: 503 })),
  );
  mount(<DiningDetailPage diningId="42" />);
  const retry = await screen.findByRole('button', { name: '다시 시도' });
  server.use(
    http.get(`${apiBaseUrl}/api/afterparties/42`, () =>
      HttpResponse.json({ ...item, content: '안내', response: 'UNANSWERED', attendingCount: null }),
    ),
  );
  await userEvent.click(retry);
  expect(await screen.findByRole('heading', { name: '서버 회식' })).toBeVisible();
  expect(screen.queryByText(/참석 \d+명/)).not.toBeInTheDocument();
});

it('목록 다음 페이지와 상태 필터를 서버에 전달한다', async () => {
  const requests: string[] = [];
  server.use(
    http.get(`${apiBaseUrl}/api/afterparties`, ({ request }) => {
      const url = new URL(request.url);
      requests.push(url.search);
      if (url.searchParams.get('filter') === 'CLOSED') {
        return HttpResponse.json({ items: [], nextCursor: null });
      }
      return HttpResponse.json(
        url.searchParams.has('cursor')
          ? { items: [{ ...item, afterpartyId: 43, title: '다음 회식' }], nextCursor: null }
          : { items: [item], nextCursor: 'next' },
      );
    }),
  );
  mount(<DiningListPage />);
  expect(await screen.findByText('7명 참여')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: '더 보기' }));
  expect(await screen.findByText('다음 회식')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: '투표 마감' }));
  expect(await screen.findByText('초대된 뒤풀이가 없어요.')).toBeVisible();
  expect(requests.some((query) => query.includes('cursor=next'))).toBe(true);
  expect(requests.some((query) => query.includes('filter=CLOSED'))).toBe(true);
});

it('개발 기본 모킹으로 목록과 상세를 조회한다', async () => {
  const list = mount(<DiningListPage />);
  expect(await screen.findByText('세션 뒤풀이')).toBeVisible();
  list.unmount();
  mount(<DiningDetailPage diningId="1" />);
  expect(await screen.findByRole('heading', { name: '세션 뒤풀이' })).toBeVisible();
  expect(screen.getByText('참석 7명')).toBeVisible();
});

it.each(['목록', '상세'] as const)(
  '%s 지연 조회는 전용 스켈레톤을 표시하고 상세 뒤로가기는 유지한다',
  async (view) => {
    const detail = view === '상세';
    let finish: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    server.use(
      http.get(`${apiBaseUrl}/api/afterparties${detail ? '/42' : ''}`, async () => {
        await pending;
        return HttpResponse.json(
          detail
            ? { ...item, content: '안내', response: 'ATTENDING', attendingCount: 7 }
            : { items: [item], nextCursor: null },
        );
      }),
    );
    mount(detail ? <DiningDetailPage diningId="42" /> : <DiningListPage />);
    const loading = await screen.findByRole('region', {
      name: `뒤풀이 ${detail ? '상세를' : '목록을'} 불러오고 있어요`,
    });
    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(loading.querySelector('.seed-skeleton')).toBeVisible();
    expect(within(loading).queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: '뒤로가기' })).toHaveLength(detail ? 1 : 0);
    if (detail) {
      await userEvent.click(screen.getByRole('button', { name: '뒤로가기' }));
    }
    expect(goBack).toHaveBeenCalledTimes(detail ? 1 : 0);
    await act(async () => {
      finish?.();
      await pending;
    });
    expect(await screen.findByText('서버 회식')).toBeVisible();
    expect(
      screen.queryByLabelText(`뒤풀이 ${detail ? '상세를' : '목록을'} 불러오고 있어요`),
    ).not.toBeInTheDocument();
  },
);

it('잘못된 상세 ID는 로딩에 머물지 않고 뒤로가기를 유지한다', () => {
  mount(<DiningDetailPage diningId="invalid" />);
  expect(screen.getByText('뒤풀이를 찾을 수 없어요.')).toBeVisible();
  expect(screen.getByRole('button', { name: '뒤로가기' })).toBeEnabled();
  expect(screen.queryByLabelText('뒤풀이 상세를 불러오고 있어요')).not.toBeInTheDocument();
});
