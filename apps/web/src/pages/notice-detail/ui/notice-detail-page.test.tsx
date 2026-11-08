/** 공지 상세의 실제 조회·오류 복구·읽기 전용 동작을 검증한다. */
import { QueryClientProvider } from '@tanstack/react-query';
import { createAppQueryClient } from '@/app/providers';
import { NativeAuthSessionProvider } from '@/features/auth';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
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
  vi.useRealTimers();
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
  // fixture 마감일의 하루 전으로 고정해 실제 날짜에 따라 D-day가 바뀌지 않게 합니다.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-08T03:00:00Z'));
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
  expect(screen.getByRole('button', { name: '확인했어요' })).toBeEnabled();
});

it('읽음 저장 성공 뒤 서버 읽음 상태를 다시 조회하고 인원 수를 임의로 늘리지 않는다', async () => {
  const user = userEvent.setup();
  renderPage();

  await user.click(await screen.findByRole('button', { name: '확인했어요' }));

  await waitFor(() => expect(screen.getByRole('button', { name: '확인했어요' })).toBeDisabled());
  expect(screen.getByText('지금까지 13명이 확인했어요!')).toBeVisible();
});

it('저장 중 연속 클릭해도 읽음 PUT 요청은 한 번만 보낸다', async () => {
  const user = userEvent.setup();
  let requestCount = 0;
  server.use(
    http.put(`${apiBaseUrl}/api/posts/2/read`, async () => {
      requestCount += 1;
      await delay(50);
      return new HttpResponse(null, { status: 204 });
    }),
  );
  renderPage();

  const button = await screen.findByRole('button', { name: '확인했어요' });
  await user.click(button);
  await user.click(button);

  await waitFor(() => expect(requestCount).toBe(1));
});

it('이미 읽은 공지는 확인 버튼을 비활성화하고 PUT을 보내지 않는다', async () => {
  const requestSpy = vi.fn<() => void>();
  server.use(
    http.get(`${apiBaseUrl}/api/posts/2`, () =>
      HttpResponse.json({ ...memberNoticeDetailFixture, read: true }),
    ),
    http.put(`${apiBaseUrl}/api/posts/2/read`, () => {
      requestSpy();
      return new HttpResponse(null, { status: 204 });
    }),
  );
  renderPage();

  expect(await screen.findByRole('button', { name: '확인했어요' })).toBeDisabled();
  expect(requestSpy).not.toHaveBeenCalled();
});

it('오프라인에서는 확인 버튼을 비활성화하고 읽음 PUT을 예약하지 않는다', async () => {
  const online = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
  const requestSpy = vi.fn<() => void>();
  server.use(
    http.put(`${apiBaseUrl}/api/posts/2/read`, () => {
      requestSpy();
      return new HttpResponse(null, { status: 204 });
    }),
  );
  renderPage();

  expect(await screen.findByRole('button', { name: '확인했어요' })).toBeDisabled();
  expect(requestSpy).not.toHaveBeenCalled();
  online.mockRestore();
});

it('읽음 저장 실패는 기존 공지를 유지하고 사용자가 다시 시도할 수 있게 한다', async () => {
  const user = userEvent.setup();
  server.use(
    http.get(`${apiBaseUrl}/api/posts/2`, () => HttpResponse.json(memberNoticeDetailFixture)),
    http.put(`${apiBaseUrl}/api/posts/2/read`, () =>
      HttpResponse.json({ code: 'FAILED' }, { status: 503 }),
    ),
  );
  renderPage();

  await user.click(await screen.findByRole('button', { name: '확인했어요' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('확인 저장에 실패했어요.');
  expect(screen.getByRole('button', { name: '확인했어요' })).toBeEnabled();
  expect(screen.getByText('지금까지 13명이 확인했어요!')).toBeVisible();
});

it('읽음 PUT 응답이 유실되면 낙관적 상태를 복원하고 재시도를 허용한다', async () => {
  const user = userEvent.setup();
  server.use(http.put(`${apiBaseUrl}/api/posts/2/read`, () => HttpResponse.error()));
  renderPage();

  await user.click(await screen.findByRole('button', { name: '확인했어요' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('확인 저장에 실패했어요.');
  expect(screen.getByRole('button', { name: '확인했어요' })).toBeEnabled();
});

it('읽음 저장 뒤 상세 재조회가 실패해도 확인 상태와 본문을 유지한다', async () => {
  const user = userEvent.setup();
  let detailRequests = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/posts/2`, () => {
      detailRequests += 1;
      return detailRequests === 1
        ? HttpResponse.json(memberNoticeDetailFixture)
        : HttpResponse.json({ code: 'FAILED' }, { status: 503 });
    }),
  );
  renderPage();

  await user.click(await screen.findByRole('button', { name: '확인했어요' }));

  await waitFor(() => expect(detailRequests).toBe(2));
  expect(screen.getByRole('button', { name: '확인했어요' })).toBeDisabled();
  expect(screen.getByText('기한 안에 과제를 제출해 주세요.')).toBeVisible();
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
