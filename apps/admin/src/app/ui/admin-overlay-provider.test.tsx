/** 실제 SEED 모달과 Overlay Kit으로 열기·콜백·페이지 수명을 검증합니다. */
import { useState } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentDialog, Portal } from '@seed-design/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
  useLocation,
} from '@tanstack/react-router';
import { expect, it, vi } from 'vitest';
import { overlay } from 'overlay-kit';
import { Providers } from '../../providers';
import { AdminOverlayProvider } from './admin-overlay-provider';

function TestDialog({
  onConfirm,
  onClose,
}: {
  onConfirm: (value: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState('');
  const client = useQueryClient();
  const pathname = useLocation({ select: (location) => location.pathname });

  return (
    <ContentDialog.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Portal>
        <ContentDialog.Backdrop />
        <ContentDialog.Positioner>
          <ContentDialog.Content>
            <ContentDialog.Header>
              <ContentDialog.Title>연결 확인</ContentDialog.Title>
            </ContentDialog.Header>
            <ContentDialog.Body>
              <p>
                {pathname}: {client.getQueryData<string>(['overlay-test'])}
              </p>
              <label>
                선택값
                <input value={draft} onChange={(event) => setDraft(event.target.value)} />
              </label>
            </ContentDialog.Body>
            <ContentDialog.Footer>
              <button type="button" onClick={onClose}>
                취소
              </button>
              <button type="button" onClick={() => onConfirm(draft)}>
                확인
              </button>
            </ContentDialog.Footer>
          </ContentDialog.Content>
        </ContentDialog.Positioner>
      </Portal>
    </ContentDialog.Root>
  );
}

async function setup() {
  const onConfirm = vi.fn<(value: string) => void>();
  function Launcher() {
    const client = useQueryClient();
    return (
      <button
        type="button"
        onClick={() => {
          client.setQueryData(['overlay-test'], '공유 캐시');
          overlay.open(({ unmount }) => (
            <TestDialog
              onClose={unmount}
              onConfirm={(value) => {
                onConfirm(value);
                unmount();
              }}
            />
          ));
        }}
      >
        모달 열기
      </button>
    );
  }
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => (
        <Providers>
          <AdminOverlayProvider>
            <Launcher />
          </AdminOverlayProvider>
        </Providers>
      ),
    }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
  return { user: userEvent.setup(), router, onConfirm };
}

it('모달이 Query·Router 컨텍스트를 공유하고 확인값을 콜백으로 전달한 뒤 제거된다', async () => {
  const { user, onConfirm } = await setup();
  await user.click(screen.getByRole('button', { name: '모달 열기' }));
  expect(await screen.findByText('/: 공유 캐시')).toBeVisible();
  await user.type(screen.getByLabelText('선택값'), '선택한 일정');
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(onConfirm).toHaveBeenCalledExactlyOnceWith('선택한 일정');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

it('검색 조건만 바뀌면 초안을 유지하고 pathname이 바뀌면 모달을 제거한다', async () => {
  const { user, router, onConfirm } = await setup();
  await user.click(screen.getByRole('button', { name: '모달 열기' }));
  await user.type(await screen.findByLabelText('선택값'), '유지할 초안');
  await act(async () => {
    router.history.push('/?type=team');
    await router.load();
  });
  expect(screen.getByLabelText('선택값')).toHaveValue('유지할 초안');
  await act(async () => {
    router.history.push('/next');
    await router.load();
  });
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(onConfirm).not.toHaveBeenCalled();
});
