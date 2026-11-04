import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackButton } from './back-button';

const navigation = vi.hoisted(() => ({
  pop: vi.fn<() => void>(),
  replace: vi.fn<(activityName: string, activityParams: object) => void>(),
  canGoBack: vi.fn<() => boolean>(),
}));
vi.mock('@stackflow/react/future', () => ({ useFlow: () => navigation }));
vi.mock('./navigation-history', () => ({
  useCanGoBack: () => ({ current: navigation.canGoBack }),
}));
beforeEach(() => vi.clearAllMocks());

describe('BackButton', () => {
  it('확인된 내부 이력이 있으면 실제 브라우저 뒤로가기를 사용한다', async () => {
    const user = userEvent.setup();
    navigation.canGoBack.mockReturnValue(true);
    render(
      <BackButton fallbackActivityName="Tabs" fallbackActivityParams={{ initialTab: 'my' }} />,
    );
    await user.click(screen.getByRole('button', { name: '뒤로가기' }));
    expect(navigation.pop).toHaveBeenCalledOnce();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it.each([
    ['Tabs', { initialTab: 'my' }],
    ['Attendance', {}],
    ['Tabs', { initialTab: 'notices' }],
  ] as const)(
    '내부 이력이 없으면 %s Activity로 replace한다',
    async (activityName, activityParams) => {
      const user = userEvent.setup();
      navigation.canGoBack.mockReturnValue(false);
      render(
        <BackButton fallbackActivityName={activityName} fallbackActivityParams={activityParams} />,
      );
      await user.click(screen.getByRole('button', { name: '뒤로가기' }));
      expect(navigation.replace).toHaveBeenCalledWith(activityName, activityParams);
      expect(navigation.pop).not.toHaveBeenCalled();
    },
  );

  it('아이콘 버튼도 같은 이름과 이동 규칙을 사용한다', async () => {
    const user = userEvent.setup();
    navigation.canGoBack.mockReturnValue(false);
    render(<BackButton fallbackActivityName="Login" fallbackActivityParams={{}} iconOnly />);
    await user.click(screen.getByRole('button', { name: '뒤로가기' }));
    expect(navigation.replace).toHaveBeenCalledWith('Login', {});
  });
});
