import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NoticeErrorPage } from './notice-error-page';

const navigation = vi.hoisted(() => ({
  pop: vi.fn<() => void>(),
  replace: vi.fn<(activityName: string, params: object) => void>(),
  isRoot: true,
}));
vi.mock('@stackflow/react', () => ({
  useFlow: () => navigation,
  useActivity: () => ({ isRoot: navigation.isRoot }),
}));

beforeEach(() => vi.clearAllMocks());

describe('NoticeErrorPage', () => {
  it('오류 메시지와 설명을 정상적으로 렌더링한다', () => {
    render(<NoticeErrorPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: '앗, 오류가 발생했어요!' }),
    ).toBeInTheDocument();
    expect(screen.getByText('잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
  });

  it('뒤로가기 버튼 클릭 시 Notices 탭으로 이동한다', async () => {
    const user = userEvent.setup();
    navigation.isRoot = true;
    render(<NoticeErrorPage />);

    const backButton = screen.getByRole('button', { name: '뒤로가기' });
    await user.click(backButton);

    expect(navigation.replace).toHaveBeenCalledWith('Tabs', { initialTab: 'notices' });
  });
});
