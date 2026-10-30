import { OverlayProvider, overlay } from 'overlay-kit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { memberPreviewAfterMapping } from '~/features/member-management/fixtures';
import { MemberEditDialog } from './member-edit-dialog';

const member = memberPreviewAfterMapping.members.at(0);
if (member === undefined) {
  throw new Error('회원 fixture가 비어 있습니다.');
}
const fixtureMember = member;

function openDialog() {
  const onClose = vi.fn<() => void>();
  const user = userEvent.setup();
  render(
    <OverlayProvider>
      <button
        type="button"
        onClick={() =>
          overlay.open(({ unmount }) => (
            <MemberEditDialog
              member={fixtureMember}
              activityId="preview-activity-33-1"
              onClose={() => {
                onClose();
                unmount();
              }}
            />
          ))
        }
      >
        수정 열기
      </button>
    </OverlayProvider>,
  );
  return { user, onClose };
}

it('회원 이름과 수정 폼 기본값을 모달에 표시한다', async () => {
  const { user } = openDialog();
  await user.click(screen.getByRole('button', { name: '수정 열기' }));
  expect(await screen.findByRole('dialog')).toHaveTextContent(
    '예시 회원 1 회원의 정보를 수정해요.',
  );
  expect(screen.getByRole('textbox', { name: '이름' })).toHaveValue('예시 회원 1');
});

it('닫기 후 다시 열면 이전 초안을 버리고 원본값을 표시한다', async () => {
  const { user, onClose } = openDialog();
  const trigger = screen.getByRole('button', { name: '수정 열기' });
  await user.click(trigger);
  const name = await screen.findByRole('textbox', { name: '이름' });
  await user.clear(name);
  await user.type(name, '임시 수정');
  await user.click(screen.getByRole('button', { name: '취소' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(trigger).toHaveFocus();

  await user.click(trigger);
  expect(await screen.findByRole('textbox', { name: '이름' })).toHaveValue('예시 회원 1');
});

it('취소는 초안을 저장하지 않고 모달을 제거한다', async () => {
  const { user, onClose } = openDialog();
  const trigger = screen.getByRole('button', { name: '수정 열기' });
  await user.click(trigger);
  await screen.findByRole('button', { name: '비활동 처리 (준비 중)' });
  expect(screen.getByRole('button', { name: '저장 (준비 중)' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: '취소' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(trigger).toHaveFocus();
});
