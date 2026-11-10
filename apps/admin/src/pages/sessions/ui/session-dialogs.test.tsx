/** 폼 검증과 별개로 저장 응답이 화면 수명을 넘어 UI 작업을 실행하지 않는지 확인합니다. */
import type * as Seed from '@seed-design/react';
import type { ReactNode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import { createAdminQueryClient } from '../../../query-client';
import type { CreateSessionInput } from '../model/session';
import { createSessionStore } from '../model/sessions.mock';
import { createSession, updateSession } from '../model/sessions';
import { CreateSessionDialog, EditSessionDialog } from './session-dialogs';

const { notify } = vi.hoisted(() => ({
  notify: vi.fn<(options: { render: () => ReactNode }) => void>(),
}));
vi.mock('@seed-design/react', async (importOriginal) => ({
  ...(await importOriginal<typeof Seed>()),
  useSnackbarAdapter: () => ({ create: notify }),
  Snackbar: {
    Root: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Content: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Message: ({ children }: { children: ReactNode }) => <p>{children}</p>,
    HiddenCloseButton: () => null,
  },
}));
vi.mock('../model/sessions', () => ({
  createSession: vi.fn<typeof createSession>(),
  updateSession: vi.fn<typeof updateSession>(),
  listSessions: vi.fn<() => Promise<[]>>().mockResolvedValue([]),
}));
const input: CreateSessionInput = {
  name: '저장한 세션',
  type: 'team',
  date: '2026-11-01',
  startTime: '14:00',
  endTime: '17:00',
  location: { guide: '' },
};
vi.mock('./session-form', () => ({
  SessionForm: ({ onSubmit }: { onSubmit: (value: CreateSessionInput) => Promise<void> }) => (
    <button type="button" onClick={() => void onSubmit(input)}>
      저장
    </button>
  ),
}));

it.each(['create', 'edit'] as const)(
  '%s 저장 중 화면을 떠나면 이전 화면의 탐색·닫기·알림을 실행하지 않는다',
  async (kind) => {
    const saved = createSessionStore([]).createSession(input);
    const pending = Promise.withResolvers<typeof saved>();
    vi.mocked(createSession).mockReset().mockReturnValueOnce(pending.promise);
    vi.mocked(updateSession).mockReset().mockReturnValueOnce(pending.promise);
    notify.mockClear();
    const close = vi.fn<() => void>();
    const created = vi.fn<() => void>();
    const client = createAdminQueryClient();
    const view = render(
      <QueryClientProvider client={client}>
        {kind === 'create' ? (
          <CreateSessionDialog onClose={close} onCreated={created} />
        ) : (
          <EditSessionDialog session={saved} filter="all" onClose={close} />
        )}
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(client.isMutating()).toBe(1));
    view.unmount();
    await act(async () => {
      pending.resolve(saved);
      await pending.promise;
    });
    await waitFor(() => expect(client.isMutating()).toBe(0));
    expect(close).not.toHaveBeenCalled();
    expect(created).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
    client.clear();
  },
);

it('저장 대기 중 같은 경로의 필터가 바뀌면 현재 필터로 성공 안내를 결정한다', async () => {
  const saved = createSessionStore([]).createSession(input);
  const pending = Promise.withResolvers<typeof saved>();
  vi.mocked(updateSession).mockReset().mockReturnValueOnce(pending.promise);
  notify.mockClear();
  const close = vi.fn<() => void>();
  const client = createAdminQueryClient();
  const view = render(
    <QueryClientProvider client={client}>
      <EditSessionDialog session={saved} filter="offline" onClose={close} />
    </QueryClientProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: '저장' }));
  await waitFor(() => expect(client.isMutating()).toBe(1));
  view.rerender(
    <QueryClientProvider client={client}>
      <EditSessionDialog session={saved} filter="all" onClose={close} />
    </QueryClientProvider>,
  );
  await act(async () => {
    pending.resolve(saved);
    await pending.promise;
  });
  await waitFor(() => expect(notify).toHaveBeenCalledOnce());
  const message = notify.mock.calls[0]?.[0].render();
  view.rerender(<>{message}</>);
  expect(screen.getByText('세션을 수정했습니다.')).toBeVisible();
  expect(screen.queryByText(/변경한 유형은/)).not.toBeInTheDocument();
  expect(close).toHaveBeenCalledOnce();
  client.clear();
});
