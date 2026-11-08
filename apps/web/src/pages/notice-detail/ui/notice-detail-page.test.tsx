/** 공지 상세의 실제 조회·오류 복구·읽기 전용 동작을 검증한다. */
import { QueryClientProvider } from '@tanstack/react-query';
import { createAppQueryClient } from '@/app/providers';
import { NativeAuthSessionProvider } from '@/features/auth';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import { memberNoticeDetailFixture } from '../../../mocks/member-notice-handlers';
import { NoticeDetailPage } from './notice-detail-page';

const navigation = vi.hoisted(() => ({ isRoot: true, pop: vi.fn<() => void>() }));
vi.mock('@stackflow/react', () => ({
  useFlow: () => navigation,
  useActivity: () => ({ isRoot: navigation.isRoot }),
}));

beforeEach(() => {
  vi.stubEnv('VITE_API_MOCKING', 'true');
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function renderPage(noticeId = '2') {
  const client = createAppQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <NativeAuthSessionProvider>
        <NoticeDetailPage noticeId={noticeId} />
      </NativeAuthSessionProvider>
    </QueryClientProvider>,
  );
}

it('API 공지의 Markdown·제출 안내·첨부 이미지를 표시한다', async () => {
  renderPage();

  expect(
    await screen.findByRole('heading', { level: 1, name: '사용자 테스트 결과 제출' }),
  ).toBeVisible();
  expect(screen.getByText('D-1')).toBeVisible();
  expect(screen.getByText('WEB, ANDROID')).toBeVisible();
  expect(screen.getByRole('link', { name: /제출 페이지/ })).toHaveAttribute(
    'href',
    'https://example.com/submissions',
  );
  expect(screen.getByRole('heading', { level: 2, name: '제출 안내' })).toBeVisible();
  expect(screen.getByRole('img', { name: 'assignment-guide.png' })).toHaveAttribute(
    'src',
    'https://images.example.com/notice-1.png',
  );
  expect(screen.getByRole('button', { name: '확인 기능 준비 중' })).toBeDisabled();
});

it('첨부 이미지 로드 실패 시 대체 안내를 표시한다', async () => {
  renderPage();
  const image = await screen.findByRole('img', { name: 'assignment-guide.png' });

  fireEvent.error(image);

  expect(screen.getByText('이미지를 표시하지 못했어요.')).toBeVisible();
});

it('초기 조회 실패 후 오류 경계의 재시도로 상세를 복구한다', async () => {
  const user = userEvent.setup();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const url = `${apiBaseUrl}/api/posts/2`;
  server.use(http.get(url, () => HttpResponse.json({ code: 'FAILED' }, { status: 500 })));
  renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent('공지 상세를 불러오지 못했어요');
  server.use(http.get(url, () => HttpResponse.json(memberNoticeDetailFixture)));
  await user.click(screen.getByRole('button', { name: '다시 시도' }));

  expect(
    await screen.findByRole('heading', { level: 1, name: '사용자 테스트 결과 제출' }),
  ).toBeVisible();
});

it('존재하지 않는 공지의 404 응답을 상세 오류 경계로 표시한다', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  renderPage('999');

  expect(await screen.findByRole('alert')).toHaveTextContent('공지 상세를 불러오지 못했어요');
});

it('잘못된 ID는 네트워크 요청 없이 오류 콘텐츠를 표시한다', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  renderPage('invalid');

  expect(
    await screen.findByRole('heading', { level: 1, name: '앗, 오류가 발생했어요!' }),
  ).toBeVisible();
  expect(fetchSpy).not.toHaveBeenCalled();
});
