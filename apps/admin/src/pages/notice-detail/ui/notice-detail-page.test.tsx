/** 실제 조회 훅·읽기 전용 본문·정렬 표를 함께 검증한다. */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createRootRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { Providers } from '~/providers';
import * as service from '~/features/notice-management/model/notices';
import { createNoticeStore } from '~/features/notice-management/model/notices.mock';
import { getNoticeReaders, type Member } from '~/features/notice-management';
import { NoticeDetailPage } from './notice-detail-page';
import { NoticeReaders } from './notice-readers';

vi.mock('~/features/notice-management/model/notices', () => ({
  listNotices: vi.fn<typeof service.listNotices>(),
  getNotice: vi.fn<typeof service.getNotice>(),
  listNoticeMembers: vi.fn<typeof service.listNoticeMembers>(),
}));
const store = createNoticeStore();
beforeEach(() => {
  vi.stubEnv('DEV', true);
  vi.mocked(service.getNotice).mockResolvedValue(store.getNotice('demo-session'));
  vi.mocked(service.listNoticeMembers).mockResolvedValue(store.listMembers());
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

/** 테스트마다 독립된 Query 캐시와 라우터를 준비한다. */
async function renderPage() {
  const root = createRootRoute({
    component: () => (
      <Providers>
        <NoticeDetailPage noticeId="demo-session" tab="readers" />
      </Providers>
    ),
  });
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  return render(<RouterProvider router={router} />);
}

it('목록과 같은 집계·대상 전원·읽기 전용 본문을 표시한다', async () => {
  await renderPage();
  expect(await screen.findByRole('table')).toBeVisible();
  expect(screen.getByText('대상 4명 · 읽음 1명 · 미열람 3명 · 읽음 비율 25%')).toBeVisible();
  const body = await screen.findByRole('document', { name: '공지 본문' });
  expect(body).toHaveAttribute('contenteditable', 'false');
  expect(body).toHaveTextContent('화면 검증용 예시 공지입니다.');
  expect(screen.getAllByRole('row')).toHaveLength(5);
  expect(rowNames()[0]).toBe('예시 웹회원');
});

it.each(['notice', 'members'] as const)('%s 조회 실패는 재시도로 복구한다', async (source) => {
  if (source === 'notice') {
    vi.mocked(service.getNotice).mockRejectedValueOnce(new Error('실패'));
  } else {
    vi.mocked(service.listNoticeMembers).mockRejectedValueOnce(new Error('실패'));
  }
  await renderPage();
  expect(await screen.findByRole('alert')).toHaveTextContent('불러오지 못했습니다');
  await userEvent.setup().click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByRole('table')).toBeVisible();
});

it('없는 공지는 조회 실패·빈 대상과 구별한다', async () => {
  vi.mocked(service.getNotice).mockResolvedValue(null);
  await renderPage();
  expect(await screen.findByText('공지를 찾을 수 없습니다.')).toBeVisible();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: '공지 수정' })).not.toBeInTheDocument();
});

it('조회 중에는 없는 공지로 표시하지 않는다', async () => {
  vi.mocked(service.getNotice).mockReturnValue(new Promise(() => undefined));
  await renderPage();
  expect(await screen.findByText('공지 정보를 불러오는 중입니다.')).toBeVisible();
  expect(screen.queryByText('공지를 찾을 수 없습니다.')).not.toBeInTheDocument();
});

it('대상 0명은 집계 0과 대상 없음 안내를 표시한다', async () => {
  vi.mocked(service.listNoticeMembers).mockResolvedValue([]);
  await renderPage();
  expect(await screen.findByText('대상 회원이 없습니다.')).toBeVisible();
  expect(screen.getByText('대상 0명 · 읽음 0명 · 미열람 0명 · 읽음 비율 0%')).toBeVisible();
});

it('프로덕션에서는 모의 조회하지 않는다', async () => {
  vi.stubEnv('DEV', false);
  await renderPage();
  expect(screen.getByText('공지 관리 기능을 준비 중입니다.')).toBeVisible();
  expect(service.getNotice).not.toHaveBeenCalled();
  expect(service.listNoticeMembers).not.toHaveBeenCalled();
});

const members: Member[] = [
  { id: 'b', name: '나회원', cohort: 10, job: 'Web', membership: 'active' },
  { id: 'a', name: '가회원', cohort: 2, job: 'Design', membership: 'completed' },
  { id: 'c', name: '다회원', cohort: 3, job: 'Server', membership: 'regular' },
];
const readers = getNoticeReaders(members, { b: '2026-10-21T00:00:00Z', a: '2026-10-20T00:00:00Z' });

/** 헤더를 제외한 데이터 행의 이름으로 표시 순서를 확인한다. */
function rowNames() {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent);
}

it.each([
  ['이름', ['가회원', '나회원', '다회원'], ['다회원', '나회원', '가회원']],
  ['기수', ['가회원', '다회원', '나회원'], ['나회원', '다회원', '가회원']],
  ['직군', ['가회원', '다회원', '나회원'], ['나회원', '다회원', '가회원']],
  ['회원 구분', ['가회원', '다회원', '나회원'], ['나회원', '다회원', '가회원']],
  ['읽음 여부', ['다회원', '나회원', '가회원'], ['나회원', '가회원', '다회원']],
  ['확인 시각', ['가회원', '나회원', '다회원'], ['나회원', '가회원', '다회원']],
])(
  '%s는 키보드로 오름차순·내림차순·기본 순서 전환이 가능하다',
  async (label, ascending, descending) => {
    render(<NoticeReaders readers={readers} />);
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: label });
    const header = screen.getByRole('columnheader', { name: label });
    button.focus();
    await user.keyboard('{Enter}');
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(rowNames()).toEqual(ascending);
    await user.keyboard(' ');
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(rowNames()).toEqual(descending);
    await user.keyboard('{Enter}');
    expect(header).toHaveAttribute('aria-sort', 'none');
    expect(rowNames()).toEqual(['나회원', '가회원', '다회원']);
    expect(screen.getAllByText('—')).toHaveLength(1);
  },
);

it('동률은 기본 순서를 유지하며 8명 이후 회원도 표시한다', async () => {
  const many = Array.from({ length: 10 }, (_, index): Member => ({
    id: String(index),
    name: `회원${index}`,
    cohort: 30,
    job: 'Web',
    membership: 'active',
  }));
  const data = getNoticeReaders(many.toReversed(), {});
  render(<NoticeReaders readers={data} />);
  expect(screen.getAllByRole('row')).toHaveLength(11);
  await userEvent.setup().click(screen.getByRole('button', { name: '기수' }));
  expect(rowNames()).toEqual(data.map((row) => row.member.name));
});

it('제출 공지의 마감과 선택한 제출 방법을 표시한다', async () => {
  const notice = store.getNotice('demo-submission');
  if (notice?.category !== 'submission') {
    throw new Error('제출 예시가 필요합니다.');
  }
  vi.mocked(service.getNotice).mockResolvedValue({
    ...notice,
    submission: {
      ...notice.submission,
      method: { name: '과제 제출', url: 'https://example.com/submit' },
    },
  });
  await renderPage();
  expect(await screen.findByRole('link', { name: '과제 제출' })).toHaveAttribute(
    'href',
    'https://example.com/submit',
  );
  expect(screen.getByRole('region', { name: '제출 안내' })).toHaveTextContent('2026. 11. 1.');
  expect(screen.getByText('대상 2명 · 읽음 0명 · 미열람 2명 · 읽음 비율 0%')).toBeVisible();
});
