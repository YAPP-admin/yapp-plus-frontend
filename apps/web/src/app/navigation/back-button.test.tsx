import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackButton } from './back-button';

const navigation = vi.hoisted(() => ({
  pop: vi.fn<() => void>(),
  replace: vi.fn<(activityName: string, activityParams: object) => void>(),
  isRoot: true,
}));
vi.mock('@stackflow/react', () => ({
  useFlow: () => navigation,
  useActivity: () => ({ isRoot: navigation.isRoot }),
}));

beforeEach(() => vi.clearAllMocks());

describe('BackButton', () => {
  it('부모 Activity가 있으면 Stackflow pop을 사용한다', async () => {
    const user = userEvent.setup();
    navigation.isRoot = false;
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
    'root Activity이면 %s Activity로 replace한다',
    async (activityName, activityParams) => {
      const user = userEvent.setup();
      navigation.isRoot = true;
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
    navigation.isRoot = true;
    render(<BackButton fallbackActivityName="Login" fallbackActivityParams={{}} iconOnly />);
    await user.click(screen.getByRole('button', { name: '뒤로가기' }));
    expect(navigation.replace).toHaveBeenCalledWith('Login', {});
  });
});
