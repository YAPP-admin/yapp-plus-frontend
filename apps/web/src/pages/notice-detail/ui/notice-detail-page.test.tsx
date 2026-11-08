/** 공지 상세의 API 조회 경계와 기본 표시 상태를 검증한다. */
import { QueryClientProvider } from '@tanstack/react-query';
import { createAppQueryClient } from '@/app/providers';
import { NativeAuthSessionProvider } from '@/features/auth';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
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
  return render(
    <QueryClientProvider client={createAppQueryClient()}>
      <NativeAuthSessionProvider>
        <NoticeDetailPage noticeId={noticeId} />
      </NativeAuthSessionProvider>
    </QueryClientProvider>,
  );
}

it('API 공지의 기본 정보와 Markdown 본문을 표시한다', async () => {
  renderPage();

  expect(
    await screen.findByRole('heading', { level: 1, name: '사용자 테스트 결과 제출' }),
  ).toBeVisible();
  expect(screen.getAllByText('과제')).not.toHaveLength(0);
  expect(screen.getByRole('heading', { level: 2, name: '제출 안내' })).toBeVisible();
});

it('잘못된 ID는 네트워크 요청 없이 오류 콘텐츠를 표시한다', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  renderPage('invalid');

  expect(
    await screen.findByRole('heading', { level: 1, name: '앗, 오류가 발생했어요!' }),
  ).toBeVisible();
  expect(fetchSpy).not.toHaveBeenCalled();
});
