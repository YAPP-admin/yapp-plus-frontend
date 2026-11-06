import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { TabLink } from './tab-link';

type Tick = (resolve: () => void) => void;
const state = vi.hoisted(() => ({
  scope: 'a',
  queues: new Map<string, Tick[]>(),
  pop: vi.fn<(scope: string) => void>(),
  replace: vi.fn<(scope: string, params: unknown) => void>(),
}));
vi.mock('@stackflow/react', () => ({
  useFlow: () => {
    const scope = state.scope;
    return { pop: () => state.pop(scope) };
  },
  useActivity: () => ({ name: 'Alerts' }),
  useStack: () => ({ activities: [{ id: state.scope, name: 'Tabs', params: {}, steps: [] }] }),
  useStepFlow: () => {
    const scope = state.scope;
    return { replaceStep: (params: unknown) => state.replace(scope, params) };
  },
}));
vi.mock('@stackflow/plugin-history-sync', () => ({
  useHistoryTick: () => {
    const scope = state.scope;
    return { requestHistoryTick: (callback: Tick) => state.queues.get(scope)?.push(callback) };
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  state.queues.clear();
  state.scope = 'a';
});

it('Alerts에서 탭 복귀는 각 Stack의 history 큐로 처리하고 다른 Stack의 예약을 덮지 않는다', () => {
  state.queues.set('a', []);
  state.queues.set('b', []);
  state.scope = 'a';
  render(<TabLink tab="notices">A 게시판</TabLink>);
  state.scope = 'b';
  render(<TabLink tab="schedule">B 일정</TabLink>);
  fireEvent.click(screen.getByRole('link', { name: 'A 게시판' }));
  fireEvent.click(screen.getByRole('link', { name: 'B 일정' }));

  expect(state.pop.mock.calls).toEqual([['a'], ['b']]);
  expect(state.replace).not.toHaveBeenCalled();
  expect(state.queues.get('a')).toHaveLength(1);
  expect(state.queues.get('b')).toHaveLength(1);
  state.queues.get('b')?.[0]?.(() => {});
  state.queues.get('a')?.[0]?.(() => {});
  expect(state.replace.mock.calls).toEqual([
    ['b', { initialTab: 'schedule' }],
    ['a', { initialTab: 'notices' }],
  ]);
});

it('수정키로 탭 링크를 열면 브라우저의 기본 이동을 유지한다', () => {
  state.queues.set('a', []);
  render(<TabLink tab="notices">게시판</TabLink>);
  const link = screen.getByRole('link', { name: '게시판' });
  expect(link).toHaveAttribute('href', '/notices');
  expect(fireEvent.click(link, { ctrlKey: true })).toBe(true);
  expect(state.pop).not.toHaveBeenCalled();
  expect(state.queues.get('a')).toHaveLength(0);
});
