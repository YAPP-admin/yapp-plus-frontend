/** 라이브러리 내부 대신 공지 첨부의 묶음 거절·오류·비동기 제거·원본 보존을 검증한다. */
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import type { NoticeAttachment } from '../model/notice';
import { NoticeAttachmentInput } from './notice-attachment-input';

const decode = vi.fn<(file: File) => Promise<Pick<ImageBitmap, 'close'>>>();

beforeEach(() => {
  decode.mockResolvedValue({ close: () => {} });
  vi.stubGlobal('createImageBitmap', decode);
});

afterEach(() => {
  onlineManager.setOnline(true);
  vi.unstubAllGlobals();
  decode.mockReset();
});

/** 저장 첨부는 Blob을 유지하고 파일 선택은 File로 전달한다. */
function saved(name: string): NoticeAttachment {
  return { id: name, name, blob: new Blob(['image'], { type: 'image/png' }) };
}

/** 각 편집 화면에 독립적인 비동기 작업 상태를 제공한다. */
function renderAttachments(initialAttachments: NoticeAttachment[] = []) {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <NoticeAttachmentInput initialAttachments={initialAttachments} />
    </QueryClientProvider>,
  );
}

it('기존 4개에서 2개 선택을 전부 거절하고 제거 후 재선택하면 5개에서 멈춘다', async () => {
  const user = userEvent.setup();
  renderAttachments(['1.png', '2.png', '3.png', '4.png'].map(saved));
  const input = screen.getByLabelText('첨부 이미지');
  const files = ['5.PNG', '6.png'].map((name) => new File(['image'], name, { type: 'image/png' }));

  await user.click(screen.getByRole('button', { name: '이미지 추가' }));
  await user.upload(input, files);
  expect(screen.getByRole('alert')).toHaveTextContent('1개 더 선택');
  expect(screen.getAllByRole('img')).toHaveLength(4);
  expect(decode).not.toHaveBeenCalled();

  await user.click(screen.getByRole('button', { name: '1.png 제거' }));
  await user.click(screen.getByRole('button', { name: '이미지 추가' }));
  await user.upload(input, files);
  await waitFor(() =>
    expect(screen.queryByText('이미지를 확인하고 있습니다.')).not.toBeInTheDocument(),
  );
  expect(screen.getAllByRole('img')).toHaveLength(5);
  expect(screen.getByRole('button', { name: '이미지 추가' })).toBeDisabled();
});

it('정상 파일은 유지하고 형식 오류와 이미지 읽기 실패를 파일별로 안내한다', async () => {
  decode.mockImplementation((file) =>
    file.name === '손상.png'
      ? Promise.reject(new Error('읽기 실패'))
      : Promise.resolve({ close: () => {} }),
  );
  const user = userEvent.setup({ applyAccept: false });
  renderAttachments();

  await user.click(screen.getByRole('button', { name: '이미지 추가' }));
  await user.upload(screen.getByLabelText('첨부 이미지'), [
    new File(['image'], '정상.png', { type: 'image/png' }),
    new File(['broken'], '손상.png', { type: 'image/png' }),
    new File(['text'], '문서.txt', { type: 'text/plain' }),
  ]);

  await waitFor(() => expect(screen.getAllByRole('img')).toHaveLength(1));
  expect(screen.getByRole('img')).toHaveAccessibleName('정상.png');
  expect(screen.getByRole('alert')).toHaveTextContent('문서.txt: JPG·PNG·WebP');
  expect(screen.getByRole('alert')).toHaveTextContent('손상.png: 이미지를 읽을 수 없습니다.');
});

it('오프라인에서도 확인하고 읽기 중 제거한 항목은 되살리지 않으며 저장 원본은 보존한다', async () => {
  onlineManager.setOnline(false);
  const pending = Promise.withResolvers<Pick<ImageBitmap, 'close'>>();
  decode.mockReturnValue(pending.promise);
  const original = [saved('기존.png')];
  const user = userEvent.setup();
  const { unmount } = renderAttachments(original);

  await user.click(screen.getByRole('button', { name: '이미지 추가' }));
  await user.upload(
    screen.getByLabelText('첨부 이미지'),
    new File(['image'], '추가.png', { type: 'image/png' }),
  );
  expect(screen.getByRole('button', { name: '이미지 추가' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: '추가.png 제거' }));
  await user.click(screen.getByRole('button', { name: '기존.png 제거' }));
  await act(async () => {
    pending.resolve({ close: () => {} });
    await pending.promise;
  });

  expect(screen.queryAllByRole('img')).toHaveLength(0);
  await waitFor(() => expect(screen.getByRole('button', { name: '이미지 추가' })).toBeEnabled());
  unmount();
  renderAttachments(original);
  expect(screen.getByRole('img')).toHaveAccessibleName('기존.png');
});
