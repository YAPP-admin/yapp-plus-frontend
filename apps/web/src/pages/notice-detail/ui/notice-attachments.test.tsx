/** 첨부 이미지의 탐색 UI 미노출을 검증한다. */
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { memberNoticeDetailFixture } from '../../../mocks/member-notice-handlers';
import { NoticeAttachments } from './notice-attachments';

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
