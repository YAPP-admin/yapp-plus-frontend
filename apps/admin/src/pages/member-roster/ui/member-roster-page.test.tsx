/** 명단 조회의 응답 표시·커서 복구·기수별 캐시 경계를 검증합니다. */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type * as Router from '@tanstack/react-router';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fakeGenerationRosterListEntryResponse } from '@yapp-plus/api/generated/faker';
import type { ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '~/mocks/server';
import { MemberRosterPage } from './member-roster-page';

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof Router>()),
  Link: ({ children }: { children: ReactNode }) => <a href="/members/import">{children}</a>,
}));
const ENDPOINT = `${apiBaseUrl}/api/admin/generations/:generationId/roster-entries`;
const ENTRY = {
  ...fakeGenerationRosterListEntryResponse(),
  rosterEntryId: 1,
  generationId: 33,
  name: '명단 회원',
  phoneNumber: '+821012345678',
  position: 'WEB',
  role: 'PLAYER',
};
function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<MemberRosterPage generationId={33} generationNumber={33} />, { wrapper });
}

it('조회한 행과 null 표시를 유지하며 다음 커서 실패를 재시도한다', async () => {
  const user = userEvent.setup();
  const cursors: (string | null)[] = [];
  let failNext = true;
  server.use(
    http.get(ENDPOINT, ({ request }) => {
      const cursor = new URL(request.url).searchParams.get('cursor');
      cursors.push(cursor);
      if (cursor === null) {
        return HttpResponse.json({ items: [ENTRY], nextCursor: 'page-2' });
      }
      if (failNext) {
        return new HttpResponse(null, { status: 503 });
      }
      return HttpResponse.json({
        items: [{ ...ENTRY, rosterEntryId: 2, name: '직군 미등록', position: null, role: null }],
        nextCursor: null,
      });
    }),
  );
  renderPage();
  expect(screen.getByText('업로드 명단을 불러오는 중입니다.')).toBeVisible();
  const table = await screen.findByRole('table', { name: '33기 업로드 명단' });
  expect(within(table).getByText('010-1234-5678')).toBeVisible();
  expect(within(table).getByText('Web')).toBeVisible();
  expect(within(table).getByText('활동회원')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '더 보기' }));
  expect(await screen.findByText('다음 명단을 불러오지 못했어요.')).toBeVisible();
  expect(within(table).getByText('명단 회원')).toBeVisible();
  failNext = false;
  await user.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByText('조회된 명단 2명')).toBeVisible();
  expect(screen.getAllByText('미지정')).toHaveLength(2);
  expect(screen.queryByRole('button', { name: '더 보기' })).not.toBeInTheDocument();
  expect(cursors).toEqual([null, 'page-2', 'page-2']);
});

it('잘못된 응답은 최초 오류로 처리하고 재시도 후 빈 상태를 표시한다', async () => {
  const user = userEvent.setup();
  server.use(http.get(ENDPOINT, () => HttpResponse.json({ items: [{}], nextCursor: null })));
  renderPage();
  expect(await screen.findByText('업로드 명단을 불러오지 못했어요.')).toBeVisible();
  server.use(http.get(ENDPOINT, () => HttpResponse.json({ items: [], nextCursor: null })));
  await user.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByRole('heading', { name: '조회할 업로드 명단이 없어요' })).toBeVisible();
  expect(screen.getByText('조회된 명단 0명')).toBeVisible();
});

it('기수를 바꾸면 이전 행과 커서를 새 기수에 사용하지 않는다', async () => {
  const requests: string[] = [];
  server.use(
    http.get(ENDPOINT, ({ request, params }) => {
      requests.push(
        `${String(params.generationId)}:${new URL(request.url).searchParams.get('cursor')}`,
      );
      return HttpResponse.json({
        items: [
          {
            ...ENTRY,
            generationId: Number(params.generationId),
            name: `${String(params.generationId)}기 명단`,
          },
        ],
        nextCursor: 'another-page',
      });
    }),
  );
  const { rerender } = renderPage();
  expect(await screen.findByText('33기 명단')).toBeVisible();
  rerender(<MemberRosterPage generationId={34} generationNumber={34} />);
  expect(await screen.findByText('34기 명단')).toBeVisible();
  expect(screen.queryByText('33기 명단')).not.toBeInTheDocument();
  expect(requests).toEqual(['33:null', '34:null']);
});

it('새로고침 실패는 기존 목록을 유지하고 최신 조회 오류로 안내한다', async () => {
  const user = userEvent.setup();
  server.use(http.get(ENDPOINT, () => HttpResponse.json({ items: [ENTRY], nextCursor: null })));
  renderPage();
  expect(await screen.findByText('명단 회원')).toBeVisible();
  server.use(http.get(ENDPOINT, () => new HttpResponse(null, { status: 503 })));
  await user.click(screen.getByRole('button', { name: '새로고침' }));
  expect(await screen.findByText('최신 명단을 불러오지 못했어요.')).toBeVisible();
  expect(screen.getByText('명단 회원')).toBeVisible();
  server.use(http.get(ENDPOINT, () => HttpResponse.json({ items: [], nextCursor: null })));
  await user.click(screen.getByRole('button', { name: '다시 시도' }));
  await waitFor(() => expect(screen.queryByText('명단 회원')).not.toBeInTheDocument());
});
