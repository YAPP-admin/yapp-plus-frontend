/** 첨부 이미지의 탐색 UI 미노출을 검증한다. */
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { attachmentLoading } from './notice-detail-page.css';
import { memberNoticeDetailFixture } from '../../../mocks/member-notice-handlers';
import { NoticeAttachments } from './notice-attachments';

afterEach(() => vi.restoreAllMocks());

it('여러 이미지에도 별도 버튼·현재 위치·실시간 위치 안내를 표시하지 않는다', () => {
  const images = memberNoticeDetailFixture.images.flatMap((image) => [
    image,
    { ...image, imageKey: 'second-image', filename: '두 번째 안내.png' },
  ]);
  render(<NoticeAttachments images={images} />);

  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.queryByText('1 / 2')).not.toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('완료된 첨부의 URL이 바뀌면 다시 대기하고 오류 시 이미지를 숨긴다', () => {
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(false);
  const images = memberNoticeDetailFixture.images;
  const image = images[0];
  if (!image) {
    throw new Error('첨부 이미지 fixture가 필요합니다.');
  }
  const { container, rerender } = render(<NoticeAttachments images={images} />);
  const placeholder = () => container.querySelector(`.${attachmentLoading}`);
  expect(placeholder()).toBeVisible();

  fireEvent.load(screen.getByAltText(image.filename));
  expect(placeholder()).not.toBeVisible();
  expect(screen.getByRole('img', { name: image.filename })).toBeVisible();

  rerender(
    <NoticeAttachments
      images={[{ ...image, readUrl: 'https://images.example.com/renewed.png' }]}
    />,
  );
  expect(placeholder()).toBeVisible();
  fireEvent.error(screen.getByAltText(image.filename));
  expect(screen.queryByRole('img', { name: image.filename })).not.toBeInTheDocument();
  expect(screen.getByText('이미지를 표시하지 못했어요.')).toBeInTheDocument();
});
