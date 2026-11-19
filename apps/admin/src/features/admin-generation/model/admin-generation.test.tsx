/** 관리자 기수 Provider의 기본 선택과 응답 검증 경계를 확인한다. */
import { Suspense, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CatchBoundary } from '@tanstack/react-router';
import { QueryClientProvider, QueryErrorResetBoundary } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { afterEach, expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '~/mocks/server';
import { createAdminQueryClient } from '~/query-client';
import { AdminGenerationProvider, useAdminGeneration } from './admin-generation';

const GENERATIONS = {
  generations: [
    { generationId: 33, generationNumber: 33, generationName: '33기' },
    { generationId: 32, generationNumber: 32, generationName: '32기' },
  ],
};

afterEach(() => {
  vi.unstubAllEnvs();
});

function renderProvider(children: ReactNode) {
  const queryClient = createAdminQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        {({ reset: resetQueryError }) => (
          <CatchBoundary
            getResetKey={() => 'admin-generation-test'}
            errorComponent={({ reset: resetBoundary }) => (
              <div role="alert">
                기수 조회 오류
                <button
                  type="button"
                  onClick={() => {
                    resetQueryError();
                    resetBoundary();
                  }}
                >
                  재시도
                </button>
              </div>
            )}
          >
            <Suspense fallback={<output>기수 조회 중</output>}>
              <AdminGenerationProvider>{children}</AdminGenerationProvider>
            </Suspense>
          </CatchBoundary>
        )}
      </QueryErrorResetBoundary>
    </QueryClientProvider>,
  );
}

function GenerationConsumer() {
  const { currentGeneration, selectGeneration } = useAdminGeneration();
  return (
    <>
      <output>{currentGeneration.generationName}</output>
      <button type="button" onClick={() => selectGeneration(32)}>
        32기 선택
      </button>
      <button type="button" onClick={() => selectGeneration(999)}>
        없는 기수 선택
      </button>
    </>
  );
}

it('목록 첫 기수를 기본으로 선택하고 목록에 있는 기수만 전환한다', async () => {
  const user = userEvent.setup();
  server.use(http.get(`${apiBaseUrl}/api/admin/generations`, () => HttpResponse.json(GENERATIONS)));

  renderProvider(<GenerationConsumer />);

  expect(await screen.findByText('33기')).toBeVisible();

  await user.click(screen.getByRole('button', { name: '32기 선택' }));
  expect(screen.getByText('32기')).toBeVisible();

  await user.click(screen.getByRole('button', { name: '없는 기수 선택' }));
  expect(screen.getByText('32기')).toBeVisible();
});

it('잘못된 목록 응답을 오류 경계로 전달한다', async () => {
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations`, () =>
      HttpResponse.json({ generations: [{ generationId: 33, generationNumber: 33 }] }),
    ),
  );

  renderProvider(<GenerationConsumer />);

  expect(await screen.findByRole('alert')).toHaveTextContent('기수 조회 오류');
});

it('조회 오류 후 재시도로 기수 목록을 다시 조회한다', async () => {
  const user = userEvent.setup();
  let requestCount = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations`, () => {
      requestCount += 1;
      if (requestCount === 1) {
        return HttpResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
      }
      return HttpResponse.json(GENERATIONS);
    }),
  );

  renderProvider(<GenerationConsumer />);

  await user.click(await screen.findByRole('button', { name: '재시도' }));

  expect(await screen.findByText('33기')).toBeVisible();
  expect(requestCount).toBe(2);
});
