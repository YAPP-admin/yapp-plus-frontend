/** DOM 환경은 파일을 다운로드하지 않으므로 실제 이미지 load·error 이벤트만 대행합니다. */
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ProfileAvatar } from './profile-avatar';

beforeEach(() => vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(false));
afterEach(() => {
  vi.restoreAllMocks();
});

it('이미지는 즉시 로딩을 표시하고 성공하면 대체 표시를 숨긴다', () => {
  const { container } = render(<ProfileAvatar src="/images/my/profile-web.svg" />);
  const placeholder = container.querySelector('.seed-skeleton');
  expect(placeholder).toBeVisible();
  fireEvent.load(screen.getByAltText('프로필'));
  expect(placeholder).not.toBeVisible();
  expect(screen.getByRole('img', { name: '프로필' })).toBeVisible();
});

it('실패는 사람 모양으로 표시하고 새 이미지에는 실패 상태를 전달하지 않는다', () => {
  const { rerender } = render(<ProfileAvatar key="web" src="/images/my/profile-web.svg" />);
  fireEvent.error(screen.getByAltText('프로필'));
  expect(screen.getByRole('img', { name: '기본 프로필' })).toBeVisible();
  rerender(<ProfileAvatar key="pm" src="/images/my/profile-pm.svg" />);
  expect(screen.queryByRole('img', { name: '기본 프로필' })).not.toBeInTheDocument();
  fireEvent.load(screen.getByAltText('프로필'));
  expect(screen.getByRole('img', { name: '프로필' })).toHaveAttribute(
    'src',
    '/images/my/profile-pm.svg',
  );
});
