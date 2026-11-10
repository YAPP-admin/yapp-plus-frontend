import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { ReactNode, Ref } from 'react';
import { screen as screenClass, screenBasement, scrollLayer } from './activity-screen.css';
import { ActivityScreen } from './activity-screen';

vi.mock('@stackflow/react', () => ({ useActivity: () => ({ isTop: true, isActive: true }) }));
vi.mock('../platform', () => ({ useAppScreenOptions: () => ({ theme: 'cupertino' }) }));
vi.mock('../../../seed-design/ui/app-bar', () => ({
  AppBar: ({ className }: { className: string }) => (
    <div data-testid="status-bar" className={className} />
  ),
}));
vi.mock('../../../seed-design/ui/app-screen', () => ({
  AppScreen: ({
    children,
    tone,
    layerOffsetTop,
    className,
  }: {
    children: ReactNode;
    tone: string;
    layerOffsetTop: string;
    className: string;
  }) => (
    <div data-testid="screen" data-tone={tone} data-offset={layerOffsetTop} className={className}>
      {children}
    </div>
  ),
  AppScreenContent: ({
    children,
    ref,
    className,
  }: {
    children: ReactNode;
    ref: Ref<HTMLDivElement>;
    className: string;
  }) => (
    <div ref={ref} data-testid="scroll-layer" className={className}>
      {children}
    </div>
  ),
}));
afterEach(() => vi.unstubAllGlobals());

it('safeArea를 확보하고 실제 스크롤 영역의 시작점에 따라 tone을 변경한 뒤 관찰을 정리한다', () => {
  let notify!: (entries: IntersectionObserverEntry[]) => void;
  let root: Element | Document | null | undefined;
  const observe = vi.fn<(target: Element) => void>();
  const disconnect = vi.fn<() => void>();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: typeof notify, options: IntersectionObserverInit) {
        notify = callback;
        root = options.root;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  const { unmount, rerender } = render(
    <ActivityScreen title="홈" background="layerBasement">
      <button>화면 동작</button>
    </ActivityScreen>,
  );
  expect(screen.getByTestId('screen')).toHaveAttribute('data-offset', 'safeArea');
  expect(root).toBe(screen.getByTestId('scroll-layer'));
  expect(screen.getByTestId('scroll-layer')).toHaveClass(scrollLayer);
  expect(screen.getByTestId('screen')).toHaveClass(screenBasement);
  expect(screen.getByTestId('screen')).toHaveAttribute('data-tone', 'transparent');
  const target = observe.mock.calls[0]?.[0];
  if (!target) {
    throw new Error('관찰할 시작점이 없습니다.');
  }
  const entry = {
    time: 0,
    target,
    rootBounds: new DOMRect(),
    boundingClientRect: new DOMRect(0, -20, 1, 1),
    intersectionRect: new DOMRect(),
    isIntersecting: false,
    intersectionRatio: 0,
  };
  act(() => notify([entry]));
  expect(screen.getByTestId('screen')).toHaveAttribute('data-tone', 'layer');
  act(() =>
    notify([
      {
        ...entry,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: new DOMRect(0, 0, 1, 1),
      },
    ]),
  );
  expect(screen.getByTestId('screen')).toHaveAttribute('data-tone', 'transparent');
  act(() => notify([{ ...entry, boundingClientRect: new DOMRect(0, 80, 1, 1) }]));
  expect(screen.getByTestId('screen')).toHaveAttribute('data-tone', 'transparent');
  for (const id of ['screen', 'scroll-layer', 'status-bar']) {
    expect(screen.getByTestId(id)).toHaveClass(screenBasement);
  }
  rerender(<ActivityScreen title="일정">일정</ActivityScreen>);
  for (const id of ['screen', 'scroll-layer', 'status-bar']) {
    expect(screen.getByTestId(id)).toHaveClass(screenClass);
  }
  unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});
